import { Module } from '@nestjs/common';
import {
  BaseAccessService,
  CashBoxAccess,
  DbContextService,
  GroupsAccess,
  MembersAccess,
  ParallelLoansAccess,
  PaymentsAccess,
  RuedasAccess,
} from './services';
import { ConfigModule } from '@nestjs/config';
import { UtilityModule } from '../../utility/utility.module';

const services = [
  DbContextService,
  CashBoxAccess,
  GroupsAccess,
  MembersAccess,
  ParallelLoansAccess,
  PaymentsAccess,
  RuedasAccess,
];

@Module({
  imports: [
    ConfigModule,
    UtilityModule
  ],
  providers: services,
  exports: services,
})
export class DataModule {}
