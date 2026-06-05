export interface NextRuedaSimulatorRequest {
  openingCash: number;
  oldInstallmentPerPerson: number;
  participantsCount: number;
  loanPerPerson: number;
  interestRate: number;
  contributionAmount: number;
  memberNames?: string[];
}

export interface NextRuedaMonth {
  monthIndex: number;
  oldInstallmentPayers: number;
  newInstallmentPayers: number;
  oldInstallmentsTotal: number;
  newInstallmentsTotal: number;
  contributionsTotal: number;
  totalIncoming: number;
  loanDisbursed: number;
  netCashFlow: number;
  cajaBalance: number;
}

export interface NextRuedaPersonMonth {
  personIndex: number;
  month: number;
  paymentType: 'old_installment' | 'new_installment' | 'loan_received';
  installmentAmount: number;
  totalAmount: number;
}

export interface NextRuedaResult {
  months: NextRuedaMonth[];
  matrix: NextRuedaPersonMonth[][];
  newInstallmentPerPerson: number;
  finalCajaBalance: number;
  totalDisbursed: number;
}

export interface RuedaSimulatorRequest {
  previousRuedaId?: string;
  openingCash: number;
  interestRate: number;
  participantsCount: number;
  contributionAmount: number;
  estimatedLoanAmount: number;
  paymentMode: 'sequential' | 'fixed';
  fixedLoanPayment: number;
  previousInstallmentPerPerson?: number;
  previousActiveCount?: number;
}

export interface RuedaSimulatorMonth {
  position: number;
  monthLabel: string;
  startingCash: number;
  newContributions: number;
  previousPool: number;
  previousPayersCount: number;
  monthlyCollection: number;
  interestCost: number;
  loanPayment: number;
  principalPayment: number;
  cashFlow: number;
  endingCash: number;
  remainingLoanBalance: number;
}

export interface RuedaSimulatorResult {
  months: RuedaSimulatorMonth[];
  totalCollected: number;
  totalLoanPaid: number;
  totalInterestPaid: number;
  endingCash: number;
  remainingLoanBalance: number;
  monthlyCollection: number;
  perPersonPayment: number;
  computedFixedLoanPayment: number;
  perPersonLoanPayment: number;
}
