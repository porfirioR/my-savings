export class CreateRuedaAccessRequest {
  constructor(
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
    public status: 'pending' | 'active' | 'completed',
    public slotAmountMode: 'constant' | 'variable' = 'constant',
    public historicalContributionTotal?: number,
    public previousRuedaId?: string,
    public notes?: string,
  ) {}
}
