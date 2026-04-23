export class CreateRuedaSlotRequest {
  constructor(
    public memberId: string,
    public position: number,
    public loanAmount?: number,
    public previousLoanAmount?: number,
  ) {}
}

export class CreateRuedaRequest {
  constructor(
    public groupId: string,
    public type: 'new' | 'continua',
    public loanAmount: number,
    public interestRate: number,
    public contributionAmount: number,
    public roundingUnit: 0 | 500 | 1000,
    public startMonth: number,
    public startYear: number,
    public slots: CreateRuedaSlotRequest[],
    public slotAmountMode: 'constant' | 'variable' = 'constant',
    public historicalContributionTotal?: number,
    public previousRuedaId?: string,
    public notes?: string,
  ) {}
}
