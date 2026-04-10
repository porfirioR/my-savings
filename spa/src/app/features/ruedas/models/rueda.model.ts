export interface Rueda {
  id: string;
  groupId: string;
  ruedaNumber: number;
  type: 'new' | 'continua';
  loanAmount: number;
  interestRate: number;
  contributionAmount: number;
  installmentAmount: number;
  totalToReturn: number;
  roundingUnit: number;
  startMonth: number;
  startYear: number;
  endMonth: number | null;
  endYear: number | null;
  status: 'pending' | 'active' | 'completed';
  historicalContributionTotal: number | null;
  previousRuedaId: string | null;
  slotAmountMode: 'constant' | 'variable';
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  slots?: RuedaSlot[];
}

export interface RuedaSlot {
  id: string;
  ruedaId: string;
  position: number;
  memberId: string | null;
  memberName?: string;
  loanAmount: number;
  installmentAmount: number;
  totalToReturn: number;
  loanMonth: number;
  loanYear: number;
  status: 'pending' | 'active' | 'completed';
  createdAt: string;
  updatedAt: string;
}

export interface RuedaTimelinePayment {
  slotPosition: number;
  memberId: string;
  memberName: string;
  type: 'contribution' | 'installment';
  amount: number;
}

export interface RuedaTimelineMonth {
  position: number;
  calendarMonth: number;
  calendarYear: number;
  disbursedToMemberId: string;
  disbursedToMemberName: string;
  disbursedAmount: number;
  totalCollected: number;
  payments: RuedaTimelinePayment[];
}

export interface CreateRuedaRequest {
  type: 'new' | 'continua';
  loanAmount: number;
  interestRate: number;
  contributionAmount: number;
  roundingUnit: number;
  startMonth: number;
  startYear: number;
  slotAmountMode: 'constant' | 'variable';
  previousRuedaId?: string;
  slots: { position: number; memberId: string; loanAmount?: number; }[];
}

export interface UpdateRuedaRequest {
  type?: 'new' | 'continua';
  loanAmount?: number;
  interestRate?: number;
  contributionAmount?: number;
  roundingUnit?: 0 | 500 | 1000;
  startMonth?: number;
  startYear?: number;
  endMonth?: number;
  endYear?: number;
  status?: 'pending' | 'active' | 'completed';
  notes?: string;
}
