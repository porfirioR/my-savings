import { Module } from '@nestjs/common';
import { UsersController } from './services/users.controller';
import { EventsController } from './services/events.controller';
import { ManagerModule } from '../manager/manager.module';

@Module({
  imports: [ManagerModule],
  controllers: [
    UsersController,
    EventsController
  ],
  providers: [],
})
export class ControllerModule {}
