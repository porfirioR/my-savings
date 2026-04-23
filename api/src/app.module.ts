import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { UtilityModule } from './utility/utility.module';
import { HostModule } from './host/host.module';

@Module({
  imports: [
    UtilityModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env'
    }),
    HostModule
  ],
})
export class AppModule {}
