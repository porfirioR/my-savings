import { Module } from '@nestjs/common';
import { EventManagerService } from './services/event-manager.service';
import { EventFollowManagerService, UserManagerService } from './services';
import { AccessModule } from '../access/access.module';

@Module({
  imports: [AccessModule],
  controllers: [],
  providers: [
    EventManagerService,
    EventFollowManagerService,
    UserManagerService
  ],
})
export class ManagerModule {}
