import { FormControl } from '@angular/forms'

export interface CreateMemberFormGroup {
  firstName: FormControl<string>
  lastName: FormControl<string>
  phone: FormControl<string>
  position: FormControl<number>
  joinedMonth: FormControl<number>
  joinedYear: FormControl<number>
}

export interface UpdateMemberFormGroup {
  firstName: FormControl<string>
  lastName: FormControl<string>
  phone: FormControl<string>
  position: FormControl<number>
  joinedMonth: FormControl<number>
  joinedYear: FormControl<number>
}

export interface ExitMemberFormGroup {
  leftMonth: FormControl<number>
  leftYear: FormControl<number>
  accumulatedContributions: FormControl<number>
  remainingLoanBalance: FormControl<number>
}

export interface ReplacementFormGroup {
  incomingFirstName: FormControl<string>
  incomingLastName: FormControl<string>
  incomingPhone: FormControl<string>
  outgoingMonthlyAmount: FormControl<number>
  incomingTotalAmount: FormControl<number>
  incomingInstallments: FormControl<number>
}
