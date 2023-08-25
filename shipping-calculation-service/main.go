package main

import (
	"database/sql"
	"encoding/json"
	"fmt"

	ckafka "github.com/confluentinc/confluent-kafka-go/kafka"
	usecases "github.com/jtiagosantos/vehicle-tracking-app/shipping-calculation-service/internal/shipping/use-cases"

	_ "github.com/go-sql-driver/mysql"
	"github.com/jtiagosantos/vehicle-tracking-app/shipping-calculation-service/internal/shipping/entity"
	"github.com/jtiagosantos/vehicle-tracking-app/shipping-calculation-service/internal/shipping/infra/repository"
	"github.com/jtiagosantos/vehicle-tracking-app/shipping-calculation-service/pkg/kafka"
)

func main() {
	db, err := sql.Open("mysql", "root:root@tcp(host.docker.internal:3306)/routes?parseTime=true")

	if err != nil {
		panic(err)
	}

	defer db.Close()

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
			output, err := createRouteUseCase.Execute(input)

			if err != nil {
				fmt.Println(err)
			}
			fmt.Println(output)

		case "RouteStarted", "RouteFinished":
			input := usecases.ChangeRouteStatusInput{}
			json.Unmarshal(msg.Value, &input)

			output, err := changeRouteStatusUseCase.Execute(input)

			if err != nil {
				fmt.Println(err)
			}
			fmt.Println(output)
		}
	}
}
