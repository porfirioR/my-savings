import { Module } from '@nestjs/common';
import { GroupsAccess, MembersAccess, PaymentsAccess, RuedasAccess } from './services';

@Module({
  providers: [GroupsAccess, MembersAccess, PaymentsAccess, RuedasAccess],
  exports: [GroupsAccess, MembersAccess, PaymentsAccess, RuedasAccess],
})
export class DataModule {}
