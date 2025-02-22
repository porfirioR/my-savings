import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { ScheduleModule } from '@nestjs/schedule';
import { UsersController } from './controllers/users.controller';
import { EventsController } from './controllers/events.controller';
import { AllExceptionsFilter } from './filters/exception.filter';
import { ManagerModule } from '../manager/manager.module';
import { LoginMiddleware } from './middleware/login.middleware';
import { SignupMiddleware } from './middleware/signup.middleware';
import { PrivateEndpointGuard } from './guards/private-endpoint.guard';
import { ResetPasswordMiddleware } from './middleware/reset-password.middleware';
import { TasksService } from './services/tasks.service';
import { PaymentController } from './controllers/payments.controller';
import { SavingsController } from './controllers/savings.controller';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    ManagerModule
  ],
  controllers: [
    UsersController,
    EventsController,
    PaymentController,
    SavingsController
  ],
  providers: [
    JwtService,
    ConfigService,
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter
    },
    {
      provide: APP_GUARD,
      useClass: PrivateEndpointGuard,
    },
    TasksService
  ],
})
export class ControllerModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(LoginMiddleware)
      .forRoutes({ path: 'users/login', method: RequestMethod.POST });

    consumer
      .apply(ResetPasswordMiddleware)
      .forRoutes({ path: 'users/reset-password', method: RequestMethod.POST });

    consumer
      .apply(SignupMiddleware)
      .forRoutes({ path: 'users/sign-up', method: RequestMethod.POST });
  }
}
