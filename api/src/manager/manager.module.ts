import { Module } from '@nestjs/common';
import { EventManagerService, MailManagerService, PaymentManagerService, SavingsManagerService, UserManagerService } from './services';
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
    MailManagerService,
    PaymentManagerService,
    SavingsManagerService
  ],
  exports: [
    EventManagerService,
    UserManagerService,
    MailManagerService,
    PaymentManagerService,
    SavingsManagerService
  ]
})
export class ManagerModule {}
