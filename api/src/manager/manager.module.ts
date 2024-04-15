import { Module } from '@nestjs/common';
import { EventManagerService, MailManagerService, UserManagerService } from './services';
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
    UserManagerService,
    MailManagerService
  ],
  exports: [
    EventManagerService,
    UserManagerService,
    MailManagerService
  ]
})
export class ManagerModule {}
