import { Injectable } from '@nestjs/common';
import { MembersAccess } from '../../access/data/services';
import { MemberAccessModel } from '../../access/contracts/members';
import {
  CreateMemberRequest,
  ExitMemberRequest,
  MemberModel,
  UpdateMemberRequest,
} from '../contracts/members';
import {
  calculateAccumulatedContributions,
  calculateMemberExitSettlement,
  monthsBetween,
} from '../../utility/helpers';

@Injectable()
export class MembersManager {
  constructor(private readonly membersAccess: MembersAccess) {}

  private mapToModel(a: MemberAccessModel): MemberModel {
    return new MemberModel(
      a.id, a.groupId, a.firstName, a.lastName, a.phone,
      a.position, a.isActive, a.joinedMonth, a.joinedYear,
      a.leftMonth, a.leftYear, a.createdAt, a.updatedAt,
    );
  }

  async findByGroup(groupId: string): Promise<MemberModel[]> {
    return (await this.membersAccess.findByGroup(groupId)).map(m => this.mapToModel(m));
  }

  async findById(id: string): Promise<MemberModel> {
    return this.mapToModel(await this.membersAccess.findById(id));
  }

  async create(req: CreateMemberRequest): Promise<MemberModel> {
    return this.mapToModel(await this.membersAccess.create(req));
  }

  async update(id: string, req: UpdateMemberRequest): Promise<MemberModel> {
    return this.mapToModel(await this.membersAccess.update(id, req));
  }

  async processExit(
    id: string,
    req: ExitMemberRequest,
    contributionPerMonth: number,
    installmentsPaid: number,
    totalInstallments: number,
    installmentAmount: number,
    ruedaStartMonth: number,
    ruedaStartYear: number,
  ): Promise<{ member: MemberModel; memberReceives: number; memberPays: number }> {
    const member = await this.membersAccess.findById(id);
    const monthsParticipated = monthsBetween(
      member.joinedMonth, member.joinedYear,
      req.leftMonth, req.leftYear,
    );
    const accumulated = calculateAccumulatedContributions(contributionPerMonth, monthsParticipated);
    const remaining = Math.max(0, (totalInstallments - installmentsPaid) * installmentAmount);
    const settlement = calculateMemberExitSettlement(accumulated, remaining);

    const updated = await this.membersAccess.processExit(id, req);
    return { member: this.mapToModel(updated), ...settlement };
  }
}
