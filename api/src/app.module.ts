import { ConfigModule } from '@nestjs/config';
import { Module } from '@nestjs/common';
import { UtilityModule } from './utility/utility.module';
import { ControllerModule } from './host/controller.module';

@Module({
  imports: [
    UtilityModule,
    ConfigModule.forRoot(),
    ControllerModule,
  ],
  controllers: [],
  providers: [
  ]
})
export class AppModule {}
