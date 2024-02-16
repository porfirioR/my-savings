import { Module } from '@nestjs/common';
import { EventManagerService } from './services/event-manager.service';

@Module({
  imports: [],
  controllers: [],
  providers: [EventManagerService],
})
export class ManagerModule {}
