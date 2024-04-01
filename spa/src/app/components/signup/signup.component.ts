import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { LoginFormGroup } from '../../models/forms';
import { CreateUserApiRequest } from '../../models/api';
import { LocalService, UserApiService } from '../../services';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css'],
  standalone: true,
  imports: [
    RouterModule,
    ReactiveFormsModule,
  ]
})
export class SignupComponent implements OnInit {
  protected formGroup: FormGroup<LoginFormGroup>

  constructor(
    private readonly router: Router,
    private readonly userApiService: UserApiService,
    private readonly localService: LocalService
  ) {
    this.formGroup = new FormGroup<LoginFormGroup>({
      email: new FormControl(null, [Validators.required, Validators.email]),
      password: new FormControl(null, [Validators.required, Validators.minLength(5), Validators.maxLength(10)])
    })
  }

  ngOnInit() {
  }

  protected save = (): void => {
    if (!this.formGroup.valid) {
      return
    }
    const request: CreateUserApiRequest = new CreateUserApiRequest(this.formGroup.value.email!, this.formGroup.value.password!)
    this.userApiService.signUpUser(request).subscribe({
      next: (user) => {
        this.localService.setEmail(user.email)
        this.localService.setJwtToken(user.token)
        this.router.navigate([''])
      }
    })
  }
}
