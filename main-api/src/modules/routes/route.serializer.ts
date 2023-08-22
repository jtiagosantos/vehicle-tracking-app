import { DirectionsResponseData } from '@googlemaps/google-maps-services-js';
import { Route } from '@prisma/client';

export class RouteSerializer implements Omit<Route, 'directions'> {
  id: string;
  name: string;
  source: {
    name: string;
    location: {
      lat: number;
      lng: number;
    };
  };
  destination: {
    name: string;
    location: {
      lat: number;
      lng: number;
    };
  };
  distance: number;
  duration: number;
  directions: DirectionsResponseData & { request: any };
  createdAt: Date;
  updatedAt: Date;

  constructor(route: Route) {
    this.id = route.id;
    this.name = route.name;
    this.source = route.source;
    this.destination = route.destination;
    this.distance = route.distance;
    this.duration = route.duration;
    this.directions = JSON.parse(route.directions as string);
    this.createdAt = route.createdAt;
    this.updatedAt = route.updatedAt;
  }
}
