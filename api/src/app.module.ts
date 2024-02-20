import { APP_FILTER } from '@nestjs/core';
import { AllExceptionsFilter } from './controller/services/exception.filter';
import { Module } from '@nestjs/common';
import { ControllerModule } from './controller/controller.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule.forRoot(), ControllerModule],
  controllers: [],
  providers: [
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter
    }
  ]
})
export class AppModule {}
