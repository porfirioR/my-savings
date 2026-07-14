import { Module } from '@nestjs/common';
import { DataModule } from '../access/data/data.module';
import {
  CashBoxManager,
  ContributionsManager,
  GroupsManager,
  MembersManager,
  ParallelLoansManager,
  PaymentsManager,
  RuedasManager,
} from './services';

const services = [
  CashBoxManager,
  ContributionsManager,
  GroupsManager,
  MembersManager,
  ParallelLoansManager,
  PaymentsManager,
  RuedasManager,
];

@Module({
  imports: [DataModule],
  providers: services,
  exports: services,
})
export class ManagerModule {}
