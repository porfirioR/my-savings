import { Module } from '@nestjs/common';
import { UsersController } from './services/users.controller';
import { EventsController } from './services/events.controller';

@Module({
  imports: [],
  controllers: [
    UsersController,
    EventsController
  ],
  providers: [],
})
export class ControllerModule {}
