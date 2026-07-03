import { BadRequestException, Injectable } from '@nestjs/common';
import { RuedasAccess } from '../../access/data/services';
import { RuedaAccessModel, RuedaSlotAccessModel } from '../../access/contracts/ruedas';
import { calculateInstallment, toReferenceUuid } from '../../utility/helpers';
import { CreateRuedaRequest, RuedaModel, RuedaSlotModel, RuedaTimelineMonth, RuedaTimelinePayment, UpdateRuedaRequest } from '../contracts/ruedas';
import { RuedaMonthlyPaymentEntity } from '../../access/data/entities';
import { CashBoxManager } from './cash-box-manager.service';


@Injectable()
export class RuedasManager {
  constructor(
    private readonly ruedasAccess: RuedasAccess,
    private readonly cashBoxManager: CashBoxManager,
  ) {}

  private mapSlotToModel(accessModel: RuedaSlotAccessModel): RuedaSlotModel {
    return {
      id: accessModel.id,
      ruedaId: accessModel.ruedaId,
      memberId: accessModel.memberId,
      memberName: accessModel.memberName,
      position: accessModel.position,
      loanAmount: accessModel.loanAmount,
      installmentAmount: accessModel.installmentAmount,
      totalToReturn: accessModel.totalToReturn,
      loanMonth: accessModel.loanMonth,
      loanYear: accessModel.loanYear,
      status: accessModel.status,
      createdAt: accessModel.createdAt,
      updatedAt: accessModel.updatedAt,
      previousLoanAmount: accessModel.previousLoanAmount,
    };
  }

  private mapToModel(accessModel: RuedaAccessModel): RuedaModel {
    return {
      id: accessModel.id,
      groupId: accessModel.groupId,
      ruedaNumber: accessModel.ruedaNumber,
      type: accessModel.type,
      loanAmount: accessModel.loanAmount,
      interestRate: accessModel.interestRate * 100,
      contributionAmount: accessModel.contributionAmount,
      installmentAmount: accessModel.installmentAmount,
      totalToReturn: accessModel.totalToReturn,
      roundingUnit: accessModel.roundingUnit,
      startMonth: accessModel.startMonth,
      startYear: accessModel.startYear,
      endMonth: accessModel.endMonth,
      endYear: accessModel.endYear,
      status: accessModel.status,
      historicalContributionTotal: accessModel.historicalContributionTotal,
      previousRuedaId: accessModel.previousRuedaId,
      slotAmountMode: accessModel.slotAmountMode,
      notes: accessModel.notes,
      createdAt: accessModel.createdAt,
      updatedAt: accessModel.updatedAt,
      slots: accessModel.slots?.map((s) => this.mapSlotToModel(s)),
      slotCount: accessModel.slotCount,
    };
  }

  async findByGroup(groupId: string): Promise<RuedaModel[]> {
    const result = await this.ruedasAccess.findByGroup(groupId);
    return result.map((m) => this.mapToModel(m));
  }

  async findById(id: string): Promise<RuedaModel> {
    const result = await this.ruedasAccess.findById(id);
    return this.mapToModel(result);
  }

  async findActive(groupId: string): Promise<RuedaModel | null> {
    const result = await this.ruedasAccess.findActive(groupId);
    return result ? this.mapToModel(result) : null;
  }

  async create(req: CreateRuedaRequest): Promise<RuedaModel> {
    const totalMonths = req.slots && req.slots.length > 0 ? req.slots.length : 15;
    const interestRateDecimal = req.interestRate / 100;
    const { installmentAmount, totalToReturn } = calculateInstallment(
      req.loanAmount,
      interestRateDecimal,
      totalMonths,
      req.roundingUnit,
    );

    // Determine next rueda number by looking at existing ruedas
    const existingRuedas = await this.ruedasAccess.findByGroup(req.groupId);
    const ruedaNumber = existingRuedas.length + 1;

    const rueda = await this.ruedasAccess.create({
      groupId: req.groupId,
      ruedaNumber,
      type: req.type,
      loanAmount: req.loanAmount,
      interestRate: interestRateDecimal,
      contributionAmount: req.contributionAmount,
      installmentAmount,
      totalToReturn,
      roundingUnit: req.roundingUnit,
      startMonth: req.startMonth,
      startYear: req.startYear,
      status: 'pending',
      slotAmountMode: req.slotAmountMode,
      historicalContributionTotal: req.historicalContributionTotal,
      previousRuedaId: req.previousRuedaId,
      notes: req.notes,
    });

    if (req.slots && req.slots.length > 0) {
      const slotRequests = req.slots.map((slot) => {
        const slotLoanAmount = slot.loanAmount ?? req.loanAmount;
        const slotCalc = calculateInstallment(
          slotLoanAmount,
          interestRateDecimal,
          totalMonths,
          req.roundingUnit,
        );

        // Calculate loan month/year based on slot position and rueda start
        const totalMonthOffset = req.startMonth - 1 + (slot.position - 1);
        const loanMonth = (totalMonthOffset % 12) + 1;
        const loanYear = req.startYear + Math.floor(totalMonthOffset / 12);

        return {
          ruedaId: rueda.id,
          memberId: slot.memberId,
          position: slot.position,
          loanAmount: slotLoanAmount,
          installmentAmount: slotCalc.installmentAmount,
          totalToReturn: slotCalc.totalToReturn,
          loanMonth,
          loanYear,
          status: 'pending' as const,
          previousLoanAmount: slot.previousLoanAmount,
        };
      });

      await this.ruedasAccess.upsertSlots(rueda.id, slotRequests);
    }

    return this.findById(rueda.id);
  }

  async update(id: string, req: UpdateRuedaRequest): Promise<RuedaModel> {
    if (req.status === 'completed') {
      const hasPending = await this.ruedasAccess.hasUnpaidPayments(id);
      if (hasPending) throw new BadRequestException('COMPLETE_HAS_PENDING');
    }

    if (req.slots?.some((s) => s.memberId)) {
      const current = await this.ruedasAccess.findById(id);
      if (current.status !== 'pending') throw new BadRequestException('SLOT_MEMBER_CHANGE_NOT_PENDING');
    }

    let installmentAmount: number | undefined;
    let totalToReturn: number | undefined;

    if (req.loanAmount !== undefined || req.interestRate !== undefined || req.roundingUnit !== undefined) {
      const current = await this.ruedasAccess.findById(id);
      const loanAmount = req.loanAmount ?? current.loanAmount;
      // current.interestRate is already decimal (from DB); req.interestRate is percent
      const interestRate = req.interestRate !== undefined ? req.interestRate / 100 : current.interestRate;
      const roundingUnit = req.roundingUnit ?? current.roundingUnit;
      const calc = calculateInstallment(loanAmount, interestRate, 15, roundingUnit);
      installmentAmount = calc.installmentAmount;
      totalToReturn = calc.totalToReturn;
    }

    const updated = await this.ruedasAccess.update(id, {
      ...req,
      interestRate: req.interestRate !== undefined ? req.interestRate / 100 : undefined,
      installmentAmount,
      totalToReturn,
    });

    if (req.slots && req.slots.length > 0) {
      await this.ruedasAccess.updateSlotsPreviousLoanAmount(id, req.slots);
    }

    if (req.startMonth !== undefined || req.startYear !== undefined) {
      await this.ruedasAccess.updateSlotsDates(id, updated.startMonth, updated.startYear);
    }

    return this.findById(id);
  }

  async delete(id: string): Promise<void> {
    const rueda = await this.ruedasAccess.findById(id);
    const payments = await this.ruedasAccess.findMonthlyPaymentsByRueda(id);

    const uniqueMonths = [...new Map(
      payments.map(p => [`${p.month}/${p.year}`, { month: p.month, year: p.year }])
    ).values()];

    const referenceIds = uniqueMonths.flatMap(({ month, year }) => [
      toReferenceUuid(`disburse:${id}:${month}/${year}`),
      toReferenceUuid(`rueda:${id}:${month}/${year}`),
    ]);

    await this.cashBoxManager.deleteByReferenceIds(rueda.groupId, referenceIds);
    await this.ruedasAccess.delete(id);
  }

  async getTimeline(id: string): Promise<RuedaTimelineMonth[]> {
    const rueda = await this.ruedasAccess.findById(id);
    const slots = rueda.slots ?? [];
    const isContinua = rueda.type === 'continua';

    // Load all monthly payment records for this rueda to check paid status
    const monthlyPayments = await this.ruedasAccess.findMonthlyPaymentsByRueda(id);
    // Index payments by memberId+month+year for O(1) lookup
    const paymentIndex = new Map<string, RuedaMonthlyPaymentEntity>();
    for (const p of monthlyPayments) {
      paymentIndex.set(`${p.member_id}:${p.month}:${p.year}`, p);
    }

    const timeline: RuedaTimelineMonth[] = [];

    for (let position = 1; position <= slots.length; position++) {
      const disbursedSlot = slots.find((s) => s.position === position);
      if (!disbursedSlot) continue;

      const payments: RuedaTimelinePayment[] = [];
      let totalCollected = 0;

      for (const slot of slots) {
        const paymentKey = `${slot.memberId}:${disbursedSlot.loanMonth}:${disbursedSlot.loanYear}`;
        const paymentRecord = paymentIndex.get(paymentKey);
        const isPaid = paymentRecord?.is_paid ?? false;
        const hasPaymentRecord = !!paymentRecord;

        if (slot.position < position) {
          // Already received → paying current rueda, first cuota is month AFTER receiving
          const cuotaNumber = position - slot.position;
          const amount = slot.installmentAmount + rueda.contributionAmount;
          payments.push({
            slotPosition: slot.position,
            memberId: slot.memberId,
            memberName: slot.memberName ?? '',
            paymentType: 'current_rueda',
            amount,
            cuotaNumber,
            isPaid,
            hasPaymentRecord,
          });
          totalCollected += amount;

        } else {
          // slot.position >= position: hasn't received current loan yet (includes receiver on disbursement month)
          if (!isContinua) {
            // New rueda: no previous loan → contribution only (receiver included)
            payments.push({
              slotPosition: slot.position,
              memberId: slot.memberId,
              memberName: slot.memberName ?? '',
              paymentType: 'contribution_only',
              amount: rueda.contributionAmount,
              cuotaNumber: 0,
              isPaid,
              hasPaymentRecord,
            });
            totalCollected += rueda.contributionAmount;
          } else {
            const cuotaNumber = slots.length - (slot.position - position);
            const prevInstallment = slot.previousLoanAmount ?? rueda.installmentAmount;
            const amount = prevInstallment + rueda.contributionAmount;
            payments.push({
              slotPosition: slot.position,
              memberId: slot.memberId,
              memberName: slot.memberName ?? '',
              paymentType: 'previous_rueda',
              amount,
              cuotaNumber,
              isPaid,
              hasPaymentRecord,
            });
            totalCollected += amount;
          }
        }
      }

      // Sort payments by slot position
      payments.sort((a, b) => a.slotPosition - b.slotPosition);

      timeline.push({
        position,
        calendarMonth: disbursedSlot.loanMonth,
        calendarYear: disbursedSlot.loanYear,
        disbursedToMemberId: disbursedSlot.memberId,
        disbursedToMemberName: disbursedSlot.memberName ?? '',
        disbursedAmount: disbursedSlot.loanAmount,
        totalCollected,
        payments,
      });
    }

    // Virtual last junta — all members pay their final installment of current rueda
    if (slots.length > 0) {
      const lastSlot = slots[slots.length - 1];
      const nextMonth = lastSlot.loanMonth === 12 ? 1 : lastSlot.loanMonth + 1;
      const nextYear = lastSlot.loanMonth === 12 ? lastSlot.loanYear + 1 : lastSlot.loanYear;

      const payments: RuedaTimelinePayment[] = [];
      let totalCollected = 0;

      for (const slot of slots) {
        const cuotaNumber = slots.length + 1 - slot.position;
        const amount = slot.installmentAmount; // contribution unknown for next rueda
        const paymentKey = `${slot.memberId}:${nextMonth}:${nextYear}`;
        const paymentRecord = paymentIndex.get(paymentKey);

        payments.push({
          slotPosition: slot.position,
          memberId: slot.memberId,
          memberName: slot.memberName ?? '',
          paymentType: 'current_rueda',
          amount,
          cuotaNumber,
          isPaid: paymentRecord?.is_paid ?? false,
          hasPaymentRecord: !!paymentRecord,
        });
        totalCollected += amount;
      }

      payments.sort((a, b) => a.slotPosition - b.slotPosition);

      timeline.push({
        position: slots.length + 1,
        calendarMonth: nextMonth,
        calendarYear: nextYear,
        disbursedToMemberId: null,
        disbursedToMemberName: null,
        disbursedAmount: 0,
        totalCollected,
        payments,
      });
    }

    return timeline;
  }

  async calculateSuggestion(groupId: string): Promise<{
    suggestedLoanAmount: number;
    cajaBalance: number;
    projectedMonthlyIncome: number;
  }> {
    return this.ruedasAccess.calculateSuggestion(groupId);
  }
}
