export class UpdateRuedaAccessRequest {
  constructor(
    public type?: 'new' | 'continua',
    public loanAmount?: number,
    public interestRate?: number,
    public contributionAmount?: number,
    public installmentAmount?: number,
    public totalToReturn?: number,
    public roundingUnit?: 0 | 500 | 1000,
    public startMonth?: number,
    public startYear?: number,
    public endMonth?: number,
    public endYear?: number,
    public status?: 'pending' | 'active' | 'completed',
    public historicalContributionTotal?: number,
    public previousRuedaId?: string | null,
    public slotAmountMode?: 'constant' | 'variable',
    public notes?: string,
  ) {}
}
