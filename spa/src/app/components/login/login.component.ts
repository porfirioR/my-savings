import { Component } from '@angular/core'
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms'
import { Router, RouterModule } from '@angular/router'
import { LoginFormGroup } from '../../models/forms'
import { LoginUserApiRequest } from '../../models/api'
import { AlertService, LocalService, UserApiService } from '../../services'
import { FormErrorsComponent } from '../form-errors/form-errors.component'

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  imports: [
    RouterModule,
    ReactiveFormsModule,
    FormErrorsComponent,
  ]
})
export class LoginComponent {
  protected formGroup: FormGroup<LoginFormGroup>

  constructor(
    private readonly router: Router,
    private readonly userApiService: UserApiService,
    private readonly localService: LocalService,
    private readonly alertService: AlertService,
  ) {
    this.formGroup = new FormGroup<LoginFormGroup>({
      email: new FormControl(null, [Validators.required, Validators.email]),
      password: new FormControl(null, [Validators.required, Validators.minLength(5), Validators.maxLength(10)])
    })
  }

  protected loginUser = (): void => {
    if (this.formGroup.invalid) {
      return
    }
    const request: LoginUserApiRequest = new LoginUserApiRequest(this.formGroup.value.email!, this.formGroup.value.password!)
    this.userApiService.loginUser(request).subscribe({
      next: (user) => {
        this.alertService.showSuccess(`Welcome ${user.email}`)
        this.router.navigate([''])
      }
    })
  }

}
