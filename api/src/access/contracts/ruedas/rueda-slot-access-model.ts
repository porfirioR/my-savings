export interface RuedaSlotAccessModel {
  id: string;
  ruedaId: string;
  memberId: string;
  memberName?: string;
  slotPosition: number;
  loanAmount: number;
  installmentAmount: number;
  totalToReturn: number;
  loanMonth: number;
  loanYear: number;
  status: 'pending' | 'active' | 'completed';
  createdAt: string;
  updatedAt: string;
}
