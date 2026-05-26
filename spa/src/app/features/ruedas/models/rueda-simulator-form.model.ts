import { FormControl } from '@angular/forms';

export interface RuedaSimulatorFormGroup {
  previousRuedaId: FormControl<string>;
  openingCash: FormControl<number>;
  interestRate: FormControl<number>;
  participantsCount: FormControl<number>;
  contributionAmount: FormControl<number>;
  estimatedLoanAmount: FormControl<number>;
  paymentMode: FormControl<'sequential' | 'fixed'>;
  fixedLoanPayment: FormControl<number>;
  loanPerPerson: FormControl<number>;
}
