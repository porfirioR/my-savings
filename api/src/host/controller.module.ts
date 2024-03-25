import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { UsersController } from './services/users.controller';
import { EventsController } from './services/events.controller';
import { AllExceptionsFilter } from './filters/exception.filter';
import { ManagerModule } from '../manager/manager.module';
import { LoginMiddleware } from './middleware/login.middleware';
import { SignupMiddleware } from './middleware/signup.middleware';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [
    ManagerModule
  ],
  controllers: [
    UsersController,
    EventsController
  ],
  providers: [
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter
    },
    JwtService,
    ConfigService
  ],
})
export class ControllerModule  implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(LoginMiddleware)
      .forRoutes({ path: 'users/login', method: RequestMethod.POST });

    consumer
      .apply(SignupMiddleware)
      .forRoutes({ path: 'users/sign-up', method: RequestMethod.POST });
  }
}
