export interface MonthlyPayment {
  id: string;
  ruedaId: string;
  memberId: string;
  memberName: string;
  month: number;
  year: number;
  paymentType: 'current_rueda' | 'previous_rueda' | 'contribution_only';
  installmentAmount: number;
  contributionAmount: number;
  totalAmount: number;
  status: 'paid' | 'pending';
  paidAt: string | null;
}

export interface PaymentSummary {
  totalCollected: number;
  totalPending: number;
  paidCount: number;
  pendingCount: number;
}

export interface GeneratePaymentsRequest {
  month: number;
  year: number;
}
