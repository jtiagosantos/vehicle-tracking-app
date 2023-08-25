package repository

import (
	"database/sql"

	"github.com/jtiagosantos/vehicle-tracking-app/shipping-calculation-service/internal/shipping/entity"
)

type RouteRepositoryMySQL struct {
	db *sql.DB
}

func NewRouteRepositoryMySQL(db *sql.DB) *RouteRepositoryMySQL {
	return &RouteRepositoryMySQL{
		db: db,
	}
}

func (r *RouteRepositoryMySQL) Create(route *entity.Route) error {
	sql := "INSERT INTO routes (id, name, distance, status, shipping_price) VALUES (?, ?, ?, ?,?)"

	_, err := r.db.Exec(sql, route.ID, route.Name, route.Distance, route.Status, route.ShippingPrice)

	if err != nil {
		return err
	}

	return nil
}

func (r *RouteRepositoryMySQL) FindByID(id string) (*entity.Route, error) {
	sqlSmt := "SELECT id, name, distance, status, shipping_price, started_at, finished_at FROM routes WHERE id = ?"

	row := r.db.QueryRow(sqlSmt, id)

	var startedAt, finishedAt sql.NullTime
	var route entity.Route

	err := row.Scan(
		&route.ID,
		&route.Name,
		&route.Distance,
		&route.Status,
		&route.ShippingPrice,
		&startedAt,
		&finishedAt,
	)

	if err != nil {
		return nil, err
	}

	if startedAt.Valid {
		route.StartedAt = startedAt.Time
	}

	if finishedAt.Valid {
		route.FinishedAt = finishedAt.Time
	}

	return &route, nil
}

func (r *RouteRepositoryMySQL) Update(route *entity.Route) error {
	startedAt := route.StartedAt.Format("2006-01-02 15:04:05")
	finishedAt := route.FinishedAt.Format("2006-01-02 15:04:05")

	sql := "UPDATE routes SET status = ?, shipping_price = ?, started_at=?, finished_at = ? WHERE id = ?"

	_, err := r.db.Exec(sql, route.Status, route.ShippingPrice, startedAt, finishedAt, route.ID)

	if err != nil {
		return err
	}

	return nil
}
