export interface CreateRuedaSlotAccessRequest {
  ruedaId: string;
  memberId: string;
  slotPosition: number;
  loanAmount: number;
  installmentAmount: number;
  totalToReturn: number;
  loanMonth: number;
  loanYear: number;
  status: 'pending' | 'active' | 'completed';
}
