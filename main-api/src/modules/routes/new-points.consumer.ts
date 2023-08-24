import { Process, Processor } from '@nestjs/bull';
import { RoutesDriverService } from './routes-driver/routes-driver.service';
import type { Job } from 'bull';
import type { NewPointsEventPayload } from './routes/types/new-points-event-payload';

@Processor('new-points')
export class NewPointsQueueConsumer {
  constructor(private routesDriverService: RoutesDriverService) {}

  @Process()
  async handle(job: Job<NewPointsEventPayload>) {
    await this.routesDriverService.createOrUpdate(job.data);
    return {};
  }
}