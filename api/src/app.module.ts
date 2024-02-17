import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { ControllerModule } from './controller/controller.module';

@Module({
  imports: [
    ControllerModule
  ],
  controllers: [AppController],
  providers: []
})
export class AppModule {}
