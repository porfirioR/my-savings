import { Module } from '@nestjs/common';
import { DbContextService, EventAccessService, EventFollowAccessService, UserAccessService } from './services';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [],
  controllers: [],
  providers: [
    ConfigService,
    DbContextService,
    EventAccessService,
    EventFollowAccessService,
    UserAccessService,
  ],
  exports: [
    UserAccessService,
    EventAccessService,
    EventFollowAccessService,
  ]
})
export class AccessModule {}
