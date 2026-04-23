import { FormControl } from '@angular/forms'

export interface CreateGroupFormGroup {
  name: FormControl<string>
  startMonth: FormControl<number>
  startYear: FormControl<number>
}
