export class UpdateRuedaRequest {
  constructor(
    public loanAmount?: number,
    public interestRate?: number,
    public contributionAmount?: number,
    public roundingUnit?: 0 | 500 | 1000,
    public startMonth?: number,
    public startYear?: number,
    public endMonth?: number,
    public endYear?: number,
    public status?: 'pending' | 'active' | 'completed',
    public historicalContributionTotal?: number,
    public notes?: string,
  ) {}
}
