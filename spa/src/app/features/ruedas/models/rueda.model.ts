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
  notes: string | null;
  createdAt: string;
  slots?: RuedaSlot[];
}

export interface RuedaSlot {
  id: string;
  ruedaId: string;
  position: number;
  memberId: string | null;
  memberName?: string;
  loanMonth: number;
  loanYear: number;
}

export interface CreateRuedaRequest {
  type: 'new' | 'continua';
  loanAmount: number;
  interestRate: number;
  contributionAmount: number;
  roundingUnit: number;
  startMonth: number;
  startYear: number;
  slots: { position: number; memberId: string; }[];
}

export interface UpdateRuedaRequest {
  status?: 'pending' | 'active' | 'completed';
  endMonth?: number;
  endYear?: number;
  notes?: string;
}
