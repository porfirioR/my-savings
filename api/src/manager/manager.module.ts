import { Module } from '@nestjs/common';
import { EventManagerService } from './services/event-manager.service';
import { UserManagerService } from './services';
import { AccessModule } from '../access/access.module';

@Module({
  imports: [AccessModule],
  controllers: [],
  providers: [
    EventManagerService,
    UserManagerService
  ],
})
export class ManagerModule {}
