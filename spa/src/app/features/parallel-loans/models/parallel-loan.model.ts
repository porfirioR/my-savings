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
  endMonth: number | null;
  endYear: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface ParallelLoanPayment {
  id: string;
  loanId: string;
  amount: number;
  month: number;
  year: number;
  status: 'paid' | 'pending';
  paidAt: string | null;
  createdAt: string;
}

export interface CreateParallelLoanRequest {
  memberId: string;
  amount: number;
  interestRate: number;
  totalInstallments: number;
  roundingUnit: 0 | 500 | 1000;
  startMonth: number;
  startYear: number;
}

export interface UpdateParallelLoanRequest {
  memberId: string;
  amount: number;
  interestRate: number;
  totalInstallments: number;
  roundingUnit: 0 | 500 | 1000;
  startMonth: number;
  startYear: number;
}
