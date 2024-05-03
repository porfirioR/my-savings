import { FormControl } from "@angular/forms"

export interface LoginFormGroup {
  email: FormControl<null | string>
  password: FormControl<null | string>
}
