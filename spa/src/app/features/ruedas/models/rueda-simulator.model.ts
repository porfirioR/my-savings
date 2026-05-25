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
