package main

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"net/http"

	ckafka "github.com/confluentinc/confluent-kafka-go/kafka"
	usecases "github.com/jtiagosantos/vehicle-tracking-app/shipping-calculation-service/internal/shipping/use-cases"

	_ "github.com/go-sql-driver/mysql"
	"github.com/jtiagosantos/vehicle-tracking-app/shipping-calculation-service/internal/shipping/entity"
	"github.com/jtiagosantos/vehicle-tracking-app/shipping-calculation-service/internal/shipping/infra/repository"
	"github.com/jtiagosantos/vehicle-tracking-app/shipping-calculation-service/pkg/kafka"
	"github.com/prometheus/client_golang/prometheus"
	"github.com/prometheus/client_golang/prometheus/promhttp"
)

var (
	routesCreated = prometheus.NewCounter(
		prometheus.CounterOpts{
			Name: "routes_created_total",
			Help: "Total number of created routes",
		},
	)

	routesStarted = prometheus.NewCounterVec(
		prometheus.CounterOpts{
			Name: "routes_started_total",
			Help: "Total number of started routes",
		},
		[]string{"status"},
	)

	errorsTotal = prometheus.NewCounter(
		prometheus.CounterOpts{
			Name: "errors_total",
			Help: "Total number of errors",
		},
	)
)

func init() {
	prometheus.MustRegister(routesStarted)
	prometheus.MustRegister(errorsTotal)
	prometheus.MustRegister(routesCreated)
}

func main() {
	db, err := sql.Open("mysql", "root:root@tcp(host.docker.internal:3306)/routes?parseTime=true")

	if err != nil {
		panic(err)
	}

	defer db.Close()

	http.Handle("/metrics", promhttp.Handler())
	go http.ListenAndServe(":8080", nil)

	msgChan := make(chan *ckafka.Message)
	topics := []string{"routes"}
	servers := "host.docker.internal:9094"
	go kafka.Consume(topics, servers, msgChan)

	repository := repository.NewRouteRepositoryMySQL(db)
	shipping := entity.NewShipping(10)
	createRouteUseCase := usecases.NewCreateRouteUseCase(repository, shipping)
	changeRouteStatusUseCase := usecases.NewChangeRouteStatusUseCase(repository)

	for msg := range msgChan {
		input := usecases.CreateRouteInput{}
		json.Unmarshal(msg.Value, &input)

		switch input.Event {
		case "RouteCreated":
			_, err := createRouteUseCase.Execute(input)

			if err != nil {
				fmt.Println(err)
				errorsTotal.Inc()
			} else {
				routesCreated.Inc()
			}

		case "RouteStarted":
			input := usecases.ChangeRouteStatusInput{}
			json.Unmarshal(msg.Value, &input)

			_, err := changeRouteStatusUseCase.Execute(input)

			if err != nil {
				fmt.Println(err)
				errorsTotal.Inc()
			} else {
				routesStarted.WithLabelValues("started").Inc()
			}

		case "RouteFinished":
			input := usecases.ChangeRouteStatusInput{}
			json.Unmarshal(msg.Value, &input)

			_, err := changeRouteStatusUseCase.Execute(input)

			if err != nil {
				fmt.Println(err)
				errorsTotal.Inc()
			} else {
				routesStarted.WithLabelValues("finished").Inc()
			}
		}
	}
}
