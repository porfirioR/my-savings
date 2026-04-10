import { RuedaSlotModel } from './rueda-slot-model';

export class RuedaModel {
  constructor(
    public id: string,
    public groupId: string,
    public ruedaNumber: number,
    public type: 'new' | 'continua',
    public loanAmount: number,
    public interestRate: number,
    public contributionAmount: number,
    public installmentAmount: number,
    public totalToReturn: number,
    public roundingUnit: 0 | 500 | 1000,
    public startMonth: number,
    public startYear: number,
    public endMonth: number | null,
    public endYear: number | null,
    public status: 'pending' | 'active' | 'completed',
    public historicalContributionTotal: number | null,
    public previousRuedaId: string | null,
    public slotAmountMode: 'constant' | 'variable',
    public notes: string | null,
    public createdAt: string,
    public updatedAt: string,
    public slots?: RuedaSlotModel[],
  ) {}
}
