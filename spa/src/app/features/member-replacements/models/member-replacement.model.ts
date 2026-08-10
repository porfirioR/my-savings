export interface MemberReplacement {
  id: string;
  groupId: string;
  ruedaId: string;
  slotPosition: number;
  outgoingMemberId: string;
  outgoingMonthlyAmount: number;
  incomingMemberId: string;
  incomingTotalAmount: number;
  incomingInstallments: number;
  status: 'active' | 'completed';
  createdAt: string;
  updatedAt: string;
  ruedaNumber?: number;
  outgoingMemberName?: string;
  incomingMemberName?: string;
}

export interface MemberReplacementSchedule {
  id: string;
  replacementId: string;
  month: number;
  year: number;
  installmentNumber: number;
  outgoingAmount: number;
  outgoingPaid: boolean;
  outgoingPaidAt: string | null;
  incomingAmount: number;
  incomingPaid: boolean;
  incomingPaidAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateMemberReplacementRequest {
  outgoingMemberId: string;
  leftMonth: number;
  leftYear: number;
  accumulatedContributions: number;
  remainingLoanBalance: number;
  incomingFirstName: string;
  incomingLastName: string;
  incomingPhone?: string;
  outgoingMonthlyAmount: number;
  incomingTotalAmount: number;
  incomingInstallments: number;
}

export interface CreateMemberReplacementResult {
  replacement: MemberReplacement;
  schedule: MemberReplacementSchedule[];
  memberReceives: number;
  memberPays: number;
}
