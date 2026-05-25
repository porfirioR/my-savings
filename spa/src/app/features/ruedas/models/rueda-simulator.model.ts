export interface RuedaSimulatorRequest {
  previousRuedaId?: string;
  openingCash: number;
  interestRate: number;
  participantsCount: number;
  contributionAmount: number;
  estimatedLoanAmount: number;
  paymentMode: 'sequential' | 'fixed';
  fixedLoanPayment: number;
  // installment amount per person coming from the previous rueda (per-person payment)
  previousInstallmentPerPerson?: number;
  // number of active participants in the previous rueda (used to compute diminishing previous pool)
  previousActiveCount?: number;
}

export interface RuedaSimulatorMonth {
  position: number;
  monthLabel: string;
  startingCash: number;
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
}
