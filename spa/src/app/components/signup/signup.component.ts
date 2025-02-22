import { Component } from '@angular/core'
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms'
import { Router, RouterModule } from '@angular/router'
import { LoginFormGroup } from '../../models/forms'
import { CreateUserApiRequest } from '../../models/api'
import { AlertService, LocalService, UserApiService } from '../../services'
import { TextComponent } from '../inputs/text/text.component'

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css'],
  imports: [
    RouterModule,
    ReactiveFormsModule,
    TextComponent
  ]
})
export class SignupComponent {
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

  protected save = (event: Event): void => {
    event.preventDefault()
    if (this.formGroup.invalid) {
      return
    }
    const request: CreateUserApiRequest = new CreateUserApiRequest(this.formGroup.value.email!, this.formGroup.value.password!)
    this.userApiService.signUpUser(request).subscribe({
      next: (user) => {
        this.alertService.showSuccess(`Welcome ${user.email}`)
        this.router.navigate([''])
      }
    })
  }
}
