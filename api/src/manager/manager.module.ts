import { Module } from '@nestjs/common';
import { EventManagerService } from './services/event-manager.service';
import { UserManagerService } from './services';
import { AccessModule } from '../access/access.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    AccessModule,
    AuthModule
  ],
  controllers: [],
  providers: [
    EventManagerService,
    UserManagerService
  ],
  exports: [
    EventManagerService,
    UserManagerService
  ]
})
export class ManagerModule {}
