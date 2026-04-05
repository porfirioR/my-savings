export interface CreateRuedaSlotRequest {
  memberId: string;
  slotPosition: number;
  loanAmount?: number;
}

export interface CreateRuedaRequest {
  groupId: string;
  type: 'new' | 'continua';
  loanAmount: number;
  interestRate: number;
  contributionAmount: number;
  roundingUnit: 500 | 1000;
  startMonth: number;
  startYear: number;
  historicalContributionTotal?: number;
  notes?: string;
  slots: CreateRuedaSlotRequest[];
}
