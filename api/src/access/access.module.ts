import { Module } from '@nestjs/common';
import { DbContextService, EventAccessService, EventFollowAccessService, UserAccessService } from './services';
import { ConfigService } from '@nestjs/config';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [],
  providers: [
    ConfigService,
    DbContextService,
    EventAccessService,
    EventFollowAccessService,
    UserAccessService,
  ],
  exports: [
    EventAccessService,
    EventFollowAccessService,
    UserAccessService,
  ]
})
export class AccessModule {}
