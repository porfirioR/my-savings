import { ConfigModule } from '@nestjs/config';
import { Module } from '@nestjs/common';
import { ControllerModule } from './controller/controller.module';

@Module({
  imports: [ConfigModule.forRoot(), ControllerModule],
  controllers: [],
  providers: []
})
export class AppModule {}
