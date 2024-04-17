import { FormControl } from "@angular/forms"

export interface ResetPasswordFormGroup {
  email: FormControl<null | string>
  code: FormControl<null | string>
  newPassword: FormControl<null | string>
}
