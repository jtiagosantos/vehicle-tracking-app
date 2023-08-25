package usecases

import "github.com/jtiagosantos/vehicle-tracking-app/shipping-calculation-service/internal/shipping/entity"

type CreateRouteInput struct {
	ID       string  `json:"id"`
	Name     string  `json:"name"`
	Distance float64 `json:"distance"`
	Event    string  `json:"event"`
}

type CreateRouteOutput struct {
	ID            string
	Name          string
	Distance      float64
	Status        string
	ShippingPrice float64
}

type CreateRouteUseCase struct {
	Repository entity.RouteRepository
	Shipping   entity.ShippingInterface
}

func NewCreateRouteUseCase(repository entity.RouteRepository, shipping entity.ShippingInterface) *CreateRouteUseCase {
	return &CreateRouteUseCase{
		Repository: repository,
		Shipping:   shipping,
	}
}

func (u *CreateRouteUseCase) Execute(input CreateRouteInput) (*CreateRouteOutput, error) {
	route := entity.NewRoute(input.ID, input.Name, input.Distance)

	u.Shipping.Calculate(route)

	err := u.Repository.Create(route)

	if err != nil {
		return nil, err
	}

	return &CreateRouteOutput{
		ID:            route.ID,
		Name:          route.Name,
		Distance:      route.Distance,
		Status:        route.Status,
		ShippingPrice: route.ShippingPrice,
	}, nil
}
