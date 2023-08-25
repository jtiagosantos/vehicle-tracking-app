package entity

import "time"

type CustomTime time.Time

const layout = "2006-01-02T15:04"

func (ct *CustomTime) UnmarshalJSON(b []byte) error {
	s := string(b)

	t, err := time.Parse(layout, s[1:len(s)-1])

	if err != nil {
		return err
	}

	*ct = CustomTime(t)

	return nil
}

type RouteRepository interface {
	Create(route *Route) error
	FindByID(id string) (*Route, error)
	Update(route *Route) error
}

type Route struct {
	ID            string
	Name          string
	Distance      float64
	Status        string
	ShippingPrice float64
	StartedAt     time.Time
	FinishedAt    time.Time
}

func NewRoute(id, name string, distance float64) *Route {
	return &Route{
		ID:       id,
		Name:     name,
		Distance: distance,
		Status:   "pending",
	}
}

func (r *Route) Start(startedAt time.Time) {
	r.Status = "started"
	r.StartedAt = startedAt
}

func (r *Route) Finish(finishedAt time.Time) {
	r.Status = "finished"
	r.FinishedAt = finishedAt
}

type ShippingInterface interface {
	Calculate(route *Route)
}

type Shipping struct {
	PricePerKm float64
}

func NewShipping(pricePerKm float64) *Shipping {
	return &Shipping{
		PricePerKm: pricePerKm,
	}
}

func (s *Shipping) Calculate(route *Route) {
	route.ShippingPrice = route.Distance * s.PricePerKm
}
