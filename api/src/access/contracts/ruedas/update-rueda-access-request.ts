export class UpdateRuedaAccessRequest {
  constructor(
    public loanAmount?: number,
    public interestRate?: number,
    public contributionAmount?: number,
    public installmentAmount?: number,
    public totalToReturn?: number,
    public roundingUnit?: 500 | 1000,
    public startMonth?: number,
    public startYear?: number,
    public endMonth?: number,
    public endYear?: number,
    public status?: 'pending' | 'active' | 'completed',
    public historicalContributionTotal?: number,
    public notes?: string,
  ) {}
}
