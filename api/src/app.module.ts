import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { UtilityModule } from './utility/utility.module';
import { HostModule } from './host/host.module';
import { SwaAuthGuard } from './utility/guards/swa-auth.guard';

@Module({
  imports: [
    UtilityModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env'
    }),
    HostModule
  ],
  providers: [
    { provide: APP_GUARD, useClass: SwaAuthGuard },
  ],
})
export class AppModule {}
