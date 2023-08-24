import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../modules/prisma/prisma.service';
import { CreateOrUpdateRoutesDriverDto } from '../dto/create-or-update-routes-driver.dto';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { DirectionsResponseData } from '@googlemaps/google-maps-services-js';
import { Counter } from 'prom-client';
import { InjectMetric } from '@willsoto/nestjs-prometheus';

@Injectable()
export class RoutesDriverService {
  constructor(
    private prismaService: PrismaService,
    @InjectQueue('kafka-producer') private kafkaProducerQueue: Queue,
    @InjectMetric('route_started_counter')
    private routeStartedCounter: Counter,
    @InjectMetric('route_finished_counter')
    private routeFinishedCounter: Counter,
  ) {}

  async createOrUpdate({ routeId, lat, lng }: CreateOrUpdateRoutesDriverDto) {
    const countRoutesDriver = await this.prismaService.routeDriver.count({
      where: {
        routeId,
      },
    });

    const routeDriver = await this.prismaService.routeDriver.upsert({
      where: {
        routeId,
      },
      create: {
        routeId,
        points: {
          set: {
            location: {
              lat,
              lng,
            },
          },
        },
      },
      update: {
        points: {
          push: {
            location: {
              lat,
              lng,
            },
          },
        },
      },
      include: {
        route: true,
      },
    });

    if (countRoutesDriver === 0) {
      this.routeStartedCounter.inc();

      await this.kafkaProducerQueue.add({
        event: 'RouteStarted',
        id: routeDriver.route.id,
        name: routeDriver.route.name,
        started_at: new Date().toISOString(),
        lat,
        lng,
      });

      return routeDriver;
    }

    const directions: DirectionsResponseData = JSON.parse(
      routeDriver.route.directions as string,
    );

    const lastPoint =
      directions.routes[0].legs[0].steps[
        directions.routes[0].legs[0].steps.length - 1
      ];

    if (
      lastPoint.end_location.lat === lat &&
      lastPoint.end_location.lng === lng
    ) {
      this.routeFinishedCounter.inc();

      await this.kafkaProducerQueue.add({
        event: 'RouteFinished',
        id: routeDriver.route.id,
        name: routeDriver.route.name,
        finished_at: new Date().toISOString(),
        lat,
        lng,
      });

      return routeDriver;
    }

    await this.kafkaProducerQueue.add({
      event: 'DriverMoved',
      id: routeDriver.route.id,
      name: routeDriver.route.name,
      lat,
      lng,
    });

    return routeDriver;
  }
}
