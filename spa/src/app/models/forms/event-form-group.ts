import { FormControl } from "@angular/forms"

export interface EventFormGroup {
  name: FormControl<string | null>
  description: FormControl<string | null>
  date: FormControl<Date | null>
  isPublic: FormControl<boolean | null>
  isActive: FormControl<boolean | null>
}
