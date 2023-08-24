import { Module } from '@nestjs/common';
import { RoutesService } from './routes.service';
import { RoutesController } from './routes.controller';
import { MapsModule } from '../maps/maps.module';
import { RoutesDriverService } from './routes-driver/routes-driver.service';
import { RoutesGateway } from './routes/routes.gateway';
import { BullModule } from '@nestjs/bull';
import { NewPointsQueueConsumer } from './new-points.consumer';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { KafkaProducerQueueConsumer } from './kafka-producer.consumer';
import { makeCounterProvider } from '@willsoto/nestjs-prometheus';

@Module({
  imports: [
    MapsModule, 
    BullModule.registerQueue(
      { name: 'new-points' },
      { name: 'kafka-producer' }
    ),
    ClientsModule.register([
      {
        name: 'KAFKA_SERVICE',
        transport: Transport.KAFKA,
        options: {
          client: {
            clientId: 'nest',
            brokers: [
              '10.0.0.248:9094'
            ],
          }
        }
      }
    ]),
  ],
  controllers: [RoutesController],
  providers: [
    RoutesService,
    RoutesDriverService,
    RoutesGateway,
    NewPointsQueueConsumer,
    KafkaProducerQueueConsumer,
    makeCounterProvider({
      name: 'route_started_counter',
      help: 'Number of routes started'
    }),
    makeCounterProvider({
      name: 'route_finished_counter',
      help: 'Number of routes finished'
    }),
  ],
})
export class RoutesModule {}
