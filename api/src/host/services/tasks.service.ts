
import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { EventManagerService } from 'src/manager/services';

@Injectable()
export class TasksService {

  constructor(private eventManagerService: EventManagerService) {}

  @Cron(CronExpression.EVERY_30_SECONDS)
  async handleCron(): Promise<void> {
    const events = await this.eventManagerService.getPublicEvents();
    console.log(events);
  }
}
