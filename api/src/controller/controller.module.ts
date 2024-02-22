import { Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { UsersController } from './services/users.controller';
import { EventsController } from './services/events.controller';
import { AllExceptionsFilter } from './services/exception.filter';
import { ManagerModule } from '../manager/manager.module';

@Module({
  imports: [ManagerModule],
  controllers: [
    UsersController,
    EventsController
  ],
  providers: [
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter
    }
  ],
})
export class ControllerModule {}
