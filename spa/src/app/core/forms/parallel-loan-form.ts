import { FormControl } from '@angular/forms'

export interface CreateParallelLoanFormGroup {
  memberId: FormControl<string>
  amount: FormControl<number>
  interestRate: FormControl<number>
  totalInstallments: FormControl<number>
  roundingUnit: FormControl<0 | 500 | 1000>
  startMonth: FormControl<number>
  startYear: FormControl<number>
}
