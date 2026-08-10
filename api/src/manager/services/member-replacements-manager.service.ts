import { BadRequestException, Injectable } from '@nestjs/common';
import { MemberReplacementsAccess, MembersAccess, PaymentsAccess, RuedasAccess } from '../../access/data/services';
import { CreateMemberReplacementAccessRequest, CreateMemberReplacementScheduleAccessRequest, MemberReplacementAccessModel, MemberReplacementScheduleAccessModel } from '../../access/contracts/member-replacements';
import { CreateMemberAccessRequest } from '../../access/contracts/members';
import {
  CreateMemberReplacementRequest,
  CreateMemberReplacementResult,
  MemberReplacementModel,
  MemberReplacementScheduleModel,
} from '../contracts/member-replacements';
import { ExitMemberRequest } from '../contracts/members';
import { CreateCashMovementRequest } from '../contracts/cash-box';
import { MembersManager } from './members-manager.service';
import { CashBoxManager } from './cash-box-manager.service';
import { ContributionsManager } from './contributions-manager.service';
import { toReferenceUuid } from '../../utility/helpers';

@Injectable()
export class MemberReplacementsManager {
  constructor(
    private readonly replacementsAccess: MemberReplacementsAccess,
    private readonly ruedasAccess: RuedasAccess,
    private readonly membersAccess: MembersAccess,
    private readonly paymentsAccess: PaymentsAccess,
    private readonly membersManager: MembersManager,
    private readonly cashBoxManager: CashBoxManager,
    private readonly contributionsManager: ContributionsManager,
  ) {}

  private mapToModel(a: MemberReplacementAccessModel): MemberReplacementModel {
    return new MemberReplacementModel(
      a.id, a.groupId, a.ruedaId, a.slotPosition,
      a.outgoingMemberId, a.outgoingMonthlyAmount,
      a.incomingMemberId, a.incomingTotalAmount, a.incomingInstallments,
      a.status, a.createdAt, a.updatedAt,
      a.ruedaNumber, a.outgoingMemberName, a.incomingMemberName,
    );
  }

  private mapScheduleToModel(a: MemberReplacementScheduleAccessModel): MemberReplacementScheduleModel {
    return new MemberReplacementScheduleModel(
      a.id, a.replacementId, a.month, a.year, a.installmentNumber,
      a.outgoingAmount, a.outgoingPaid, a.outgoingPaidAt,
      a.incomingAmount, a.incomingPaid, a.incomingPaidAt,
      a.createdAt, a.updatedAt,
    );
  }

  async findByGroup(groupId: string): Promise<MemberReplacementModel[]> {
    return (await this.replacementsAccess.findByGroup(groupId)).map((m) => this.mapToModel(m));
  }

  async getSchedule(replacementId: string): Promise<MemberReplacementScheduleModel[]> {
    return (await this.replacementsAccess.findScheduleByReplacement(replacementId)).map((m) => this.mapScheduleToModel(m));
  }

  async previewOutgoingAmount(groupId: string, memberId: string): Promise<number> {
    const slot = await this.ruedasAccess.findActiveSlotByMember(groupId, memberId);
    if (!slot) throw new BadRequestException('NO_ACTIVE_SLOT');

    const latestPayment = await this.paymentsAccess.findLatestByMember(slot.ruedaId, memberId);
    return latestPayment?.totalAmountDue ?? 0;
  }

  async create(req: CreateMemberReplacementRequest): Promise<CreateMemberReplacementResult> {
    const slot = await this.ruedasAccess.findActiveSlotByMember(req.groupId, req.outgoingMemberId);
    if (!slot) throw new BadRequestException('NO_ACTIVE_SLOT');

    const outgoingMemberBefore = await this.membersAccess.findById(req.outgoingMemberId);

    const { memberReceives, memberPays } = await this.membersManager.processExit(
      req.outgoingMemberId,
      new ExitMemberRequest(req.leftMonth, req.leftYear),
      req.accumulatedContributions,
      req.remainingLoanBalance,
    );

    // First calendar month after the exit
    const startOffset = req.leftMonth;
    const startMonth = (startOffset % 12) + 1;
    const startYear = req.leftYear + Math.floor(startOffset / 12);

    const incomingMember = await this.membersAccess.create(
      new CreateMemberAccessRequest(
        req.groupId,
        req.incomingFirstName,
        req.incomingLastName,
        outgoingMemberBefore.position,
        startMonth,
        startYear,
        req.incomingPhone,
      ),
    );

    const replacement = await this.replacementsAccess.create(
      new CreateMemberReplacementAccessRequest(
        req.groupId,
        slot.ruedaId,
        slot.slotPosition,
        req.outgoingMemberId,
        req.outgoingMonthlyAmount,
        incomingMember.id,
        req.incomingTotalAmount,
        req.incomingInstallments,
      ),
    );

    const base = Math.floor(req.incomingTotalAmount / req.incomingInstallments);
    const remainder = req.incomingTotalAmount - base * req.incomingInstallments;
    const scheduleRows: CreateMemberReplacementScheduleAccessRequest[] = [];
    for (let i = 0; i < req.incomingInstallments; i++) {
      const offset = (startMonth - 1) + i;
      const month = (offset % 12) + 1;
      const year = startYear + Math.floor(offset / 12);
      const installmentNumber = i + 1;
      const incomingAmount = base + (installmentNumber === req.incomingInstallments ? remainder : 0);
      scheduleRows.push(
        new CreateMemberReplacementScheduleAccessRequest(
          replacement.id, month, year, installmentNumber, req.outgoingMonthlyAmount, incomingAmount,
        ),
      );
    }
    await this.replacementsAccess.createScheduleRows(scheduleRows);
    const schedule = await this.replacementsAccess.findScheduleByReplacement(replacement.id);

    return new CreateMemberReplacementResult(
      this.mapToModel(replacement),
      schedule.map((s) => this.mapScheduleToModel(s)),
      memberReceives,
      memberPays,
    );
  }

  async markSchedule(scheduleId: string, side: 'outgoing' | 'incoming', paid: boolean): Promise<MemberReplacementScheduleModel> {
    const current = await this.replacementsAccess.findScheduleById(scheduleId);
    const row = await this.replacementsAccess.markSchedule(scheduleId, side, paid);
    const replacement = await this.replacementsAccess.findById(row.replacementId);
    const referenceId = toReferenceUuid(`replacement:${row.replacementId}:${side}:${row.month}/${row.year}`);

    if (paid) {
      const amount = side === 'outgoing' ? current.outgoingAmount : current.incomingAmount;
      const description = side === 'outgoing'
        ? `Ajuste salida ${replacement.outgoingMemberName ?? ''} ${row.month}/${row.year}`
        : `Ingreso ${replacement.incomingMemberName ?? ''} ${row.installmentNumber}/${replacement.incomingInstallments}`;

      await this.cashBoxManager.createMovement(
        new CreateCashMovementRequest(
          replacement.groupId,
          side === 'outgoing' ? 'out' : 'in',
          'automatic',
          side === 'outgoing' ? 'member_exit' : 'member_entry',
          amount,
          row.month,
          row.year,
          description,
          referenceId,
        ),
      );
    } else {
      await this.cashBoxManager.deleteByReference(replacement.groupId, referenceId);
    }

    if (side === 'incoming') {
      const schedule = await this.replacementsAccess.findScheduleByReplacement(row.replacementId);
      const allIncomingPaid = schedule.every((s) => s.incomingPaid);

      if (allIncomingPaid && replacement.status !== 'completed') {
        await this.ruedasAccess.reassignSlotMember(replacement.ruedaId, replacement.slotPosition, replacement.incomingMemberId);
        await this.replacementsAccess.updateStatus(replacement.id, 'completed');
        await this.contributionsManager.finalizeIncomingReplacement(replacement);
      } else if (!allIncomingPaid && replacement.status === 'completed') {
        await this.ruedasAccess.reassignSlotMember(replacement.ruedaId, replacement.slotPosition, replacement.outgoingMemberId);
        await this.replacementsAccess.updateStatus(replacement.id, 'active');
        await this.contributionsManager.clearIncomingReplacementContributions(replacement.incomingMemberId);
      }
    }

    return this.mapScheduleToModel(row);
  }

  async updateScheduleAmount(scheduleId: string, side: 'outgoing' | 'incoming', amount: number): Promise<MemberReplacementScheduleModel> {
    const current = await this.replacementsAccess.findScheduleById(scheduleId);
    const alreadyPaid = side === 'outgoing' ? current.outgoingPaid : current.incomingPaid;
    if (alreadyPaid) throw new BadRequestException('SCHEDULE_ALREADY_PAID');

    const row = await this.replacementsAccess.updateScheduleAmount(scheduleId, side, amount);
    return this.mapScheduleToModel(row);
  }
}
