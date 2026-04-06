export interface ParallelLoan {
  id: string;
  groupId: string;
  memberId: string;
  memberName: string;
  amount: number;
  interestRate: number;
  installmentAmount: number;
  totalInstallments: number;
  installmentsPaid: number;
  totalToReturn: number;
  status: 'active' | 'completed';
  startMonth: number;
  startYear: number;
  createdAt: string;
}

export interface ParallelLoanPayment {
  id: string;
  loanId: string;
  installmentNumber: number;
  amount: number;
  month: number;
  year: number;
  status: 'paid' | 'pending';
  paidAt: string | null;
}

export interface CreateParallelLoanRequest {
  memberId: string;
  amount: number;
  interestRate: number;
  totalInstallments: number;
  startMonth: number;
  startYear: number;
}
