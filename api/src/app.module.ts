import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { ControllerModule } from './controller/controller.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot(),
    ControllerModule
  ],
  controllers: [AppController],
  providers: []
})
export class AppModule {}
