export interface UpdateRuedaRequest {
  loanAmount?: number;
  interestRate?: number;
  contributionAmount?: number;
  roundingUnit?: 500 | 1000;
  startMonth?: number;
  startYear?: number;
  endMonth?: number;
  endYear?: number;
  status?: 'pending' | 'active' | 'completed';
  historicalContributionTotal?: number;
  notes?: string;
}
