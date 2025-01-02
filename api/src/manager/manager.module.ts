import { Module } from '@nestjs/common';
import { EventManagerService, MailManagerService, PaymentManagerService, SavingsManagerService, TypeManagerService, UserManagerService } from './services';
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
    SavingsManagerService,
    TypeManagerService,
  ],
  exports: [
    EventManagerService,
    UserManagerService,
    MailManagerService,
    PaymentManagerService,
    SavingsManagerService,
    TypeManagerService,
  ]
})
export class ManagerModule {}
