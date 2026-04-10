import { FormControl } from '@angular/forms'

export interface CreateMovementFormGroup {
  type: FormControl<'in' | 'out'>
  amount: FormControl<number>
  description: FormControl<string>
  category: FormControl<string>
  month: FormControl<number>
  year: FormControl<number>
}
