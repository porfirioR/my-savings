import { FormControl } from '@angular/forms'

export interface CreateRuedaFormGroup {
  type: FormControl<'new' | 'continua'>
  loanAmount: FormControl<number>
  interestRate: FormControl<number>
  contributionAmount: FormControl<number>
  roundingUnit: FormControl<0 | 500 | 1000>
  startMonth: FormControl<number>
  startYear: FormControl<number>
  slotAmountMode: FormControl<'constant' | 'variable'>
  previousRuedaId: FormControl<string>
}

export interface UpdateRuedaFormGroup {
  type: FormControl<'new' | 'continua'>
  loanAmount: FormControl<number>
  interestRate: FormControl<number>
  contributionAmount: FormControl<number>
  roundingUnit: FormControl<0 | 500 | 1000>
  startMonth: FormControl<number>
  startYear: FormControl<number>
  notes: FormControl<string>
}
