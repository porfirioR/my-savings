import { Injectable } from '@nestjs/common';
import { RuedasAccess } from '../../access/data/services';
import { RuedaAccessModel, RuedaSlotAccessModel } from '../../access/contracts/ruedas';
import { calculateInstallment } from '../../utility/helpers';
import { CreateRuedaRequest, RuedaModel, RuedaSlotModel, UpdateRuedaRequest } from '../contracts/ruedas';


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
      historicalContributionTotal: req.historicalContributionTotal,
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

    const result = await this.ruedasAccess.update(id, {
      ...req,
      interestRate: req.interestRate !== undefined ? req.interestRate / 100 : undefined,
      installmentAmount,
      totalToReturn,
    });
    return this.mapToModel(result);
  }

  async calculateSuggestion(groupId: string): Promise<{
    suggestedLoanAmount: number;
    cajaBalance: number;
    projectedMonthlyIncome: number;
  }> {
    return this.ruedasAccess.calculateSuggestion(groupId);
  }
}
