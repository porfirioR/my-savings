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
  status: 'pending' | 'active' | 'completed';
  createdAt: string;
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
  roundingUnit: number;
  startMonth: number;
  startYear: number;
  slots: { position: number; memberId: string; }[];
}
