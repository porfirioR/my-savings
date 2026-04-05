import { Module } from '@nestjs/common';
import {
  CashBoxAccess,
  GroupsAccess,
  MembersAccess,
  ParallelLoansAccess,
  PaymentsAccess,
  RuedasAccess,
} from './services';

const services = [
  CashBoxAccess,
  GroupsAccess,
  MembersAccess,
  ParallelLoansAccess,
  PaymentsAccess,
  RuedasAccess,
];

@Module({
  providers: services,
  exports: services,
})
export class DataModule {}
