import { Component, OnInit } from '@angular/core'
import { CommonModule } from '@angular/common'
import { AbstractControl, FormControl, FormGroup, ReactiveFormsModule, ValidatorFn, Validators } from '@angular/forms'
import { ActivatedRoute, RouterModule } from '@angular/router'
import { UserApiService } from '../../services'
import { ResetPasswordFormGroup } from '../../models/forms'
import { ResetPasswordApiRequest } from '../../models/api/reset-password-api-request'
import { TextComponent } from '../inputs/text/text.component'

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    TextComponent
  ]
})
export class ResetPasswordComponent implements OnInit {
  protected formGroup: FormGroup<ResetPasswordFormGroup>

  constructor(
    private readonly activeRoute: ActivatedRoute,
    private readonly userApiService: UserApiService
  ) {
    const code = this.activeRoute.snapshot.queryParams['code']
    const email = this.activeRoute.snapshot.queryParams['email']
    this.formGroup = new FormGroup<ResetPasswordFormGroup>({
      email: new FormControl(email ? email : null, [Validators.required, Validators.email]),
      newPassword: new FormControl(null, [Validators.required, Validators.minLength(4)]),
      repeatPassword: new FormControl(null, [Validators.required, this.repeatPasswordValidator()]),
      code: new FormControl(code ? code : null, [Validators.required]),
    })
  }

  ngOnInit(): void {
    this.formGroup.controls.newPassword.valueChanges.subscribe({
      next: () => {
        this.formGroup.controls.repeatPassword.updateValueAndValidity()
      }
    })

  }

  protected changePassword = (event: Event): void => {
    event.preventDefault()
    if (this.formGroup.invalid) {
      return
    }
    const request = new ResetPasswordApiRequest(this.formGroup.value.email!, this.formGroup.value.code!, this.formGroup.value.newPassword!)
    this.userApiService.resetPassword(request).subscribe({
      next: (value) => {
        
      }, error: (e) => {
        
        throw e
      }
    })
  }

  
  private repeatPasswordValidator = (): ValidatorFn => {
    return (control: AbstractControl): { [key: string]: unknown } | null => {
      const password = this.formGroup?.controls?.newPassword.value
      const repeatPassword = control.value
      if (repeatPassword && password?.localeCompare(repeatPassword)) {
        return { invalidRepeatPassword: true }
      }
      return null
    }
  }
}
