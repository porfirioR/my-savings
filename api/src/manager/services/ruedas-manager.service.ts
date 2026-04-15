import { Injectable } from '@nestjs/common';
import { RuedasAccess } from '../../access/data/services';
import { RuedaAccessModel, RuedaSlotAccessModel } from '../../access/contracts/ruedas';
import { calculateInstallment } from '../../utility/helpers';
import { CreateRuedaRequest, RuedaModel, RuedaSlotModel, RuedaTimelineMonth, RuedaTimelinePayment, UpdateRuedaRequest } from '../contracts/ruedas';
import { RuedaMonthlyPaymentEntity } from '../../access/data/entities';


@Injectable()
export class RuedasManager {
  constructor(private readonly ruedasAccess: RuedasAccess) {}

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
    // Rueda has 15 slots (months)
    const totalMonths = 15;
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

    for (let position = 1; position <= 15; position++) {
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
          // Formula: cuota = 15 - (slot.position - position)
          //   - receiver (slot.position == position): 15/15 (n/n)
          //   - next one (slot.position == position+1): 14/15 (n-1/n)
          //   - last slot (15) on page 1: 1/15
          //   - last slot (15) on page 15 (their receipt): 15/15 (n/n)

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
            const cuotaNumber = 15 - (slot.position - position);
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

    // Position 16: virtual "next junta" — all members pay their remaining cuota of current rueda
    if (slots.length === 15) {
      const lastSlot = slots.find((s) => s.position === 15)!;
      const nextMonth = lastSlot.loanMonth === 12 ? 1 : lastSlot.loanMonth + 1;
      const nextYear = lastSlot.loanMonth === 12 ? lastSlot.loanYear + 1 : lastSlot.loanYear;

      const payments: RuedaTimelinePayment[] = [];
      let totalCollected = 0;

      for (const slot of slots) {
        const cuotaNumber = 16 - slot.position;
        const amount = slot.installmentAmount + rueda.contributionAmount;
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
        position: 16,
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
