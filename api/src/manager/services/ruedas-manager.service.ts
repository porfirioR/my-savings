import { Injectable } from '@nestjs/common';
import { RuedasAccess } from '../../access/data/services';
import { RuedaAccessModel, RuedaSlotAccessModel } from '../../access/contracts/ruedas';
import { calculateInstallment } from '../../utility/helpers';
import { CreateRuedaRequest, RuedaModel, RuedaSlotModel, RuedaTimelineMonth, RuedaTimelinePayment, UpdateRuedaRequest, UpdateRuedaSlotRequest } from '../contracts/ruedas';
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

    await this.ruedasAccess.update(id, {
      ...req,
      interestRate: req.interestRate !== undefined ? req.interestRate / 100 : undefined,
      installmentAmount,
      totalToReturn,
    });

    if (req.slots && req.slots.length > 0) {
      await this.ruedasAccess.updateSlotsPreviousLoanAmount(id, req.slots);
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
        if (slot.position === position) continue; // receiving member doesn't collect

        const paymentKey = `${slot.memberId}:${disbursedSlot.loanMonth}:${disbursedSlot.loanYear}`;
        const paymentRecord = paymentIndex.get(paymentKey);
        const isPaid = paymentRecord?.is_paid ?? false;
        const hasPaymentRecord = !!paymentRecord;

        if (slot.position < position) {
          // Already received current loan → paying installment from current rueda
          // cuota: for new rueda starts at 1 on disbursement month (P-S+1),
          //        for continua starts at 1 on month AFTER disbursement (P-S)
          const cuotaNumber = isContinua
            ? position - slot.position
            : position - slot.position + 1;

          payments.push({
            slotPosition: slot.position,
            memberId: slot.memberId,
            memberName: slot.memberName ?? '',
            paymentType: 'current_rueda',
            amount: slot.installmentAmount,
            cuotaNumber,
            isPaid,
            hasPaymentRecord,
          });
          totalCollected += slot.installmentAmount;

        } else {
          // slot.position > position: hasn't received current loan yet

          if (!isContinua) {
            // New (first) rueda → pays contribution only, no installment
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
            // Continua rueda → paying installment from previous rueda
            // cuota from previous = 16 - S + P (capped at 15 to handle P=S edge)
            const cuotaNumber = Math.min(16 - slot.position + position, 15);

            // Installment amount from previous loan
            let prevAmount = rueda.installmentAmount; // fallback to current rueda default
            if (slot.previousLoanAmount) {
              const prevCalc = calculateInstallment(
                slot.previousLoanAmount,
                rueda.interestRate / 100, // interestRate in model is already *100 (percentage)
                15,
                rueda.roundingUnit as 0 | 500 | 1000,
              );
              prevAmount = prevCalc.installmentAmount;
            }

            payments.push({
              slotPosition: slot.position,
              memberId: slot.memberId,
              memberName: slot.memberName ?? '',
              paymentType: 'previous_rueda',
              amount: prevAmount,
              cuotaNumber,
              isPaid,
              hasPaymentRecord,
            });
            totalCollected += prevAmount;
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
