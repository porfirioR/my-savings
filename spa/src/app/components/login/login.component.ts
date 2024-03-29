import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { LoginFormGroup } from '../../models/forms';
import { UserApiService } from '../../services/user-api.service';
import { LoginUserApiRequest } from '../../models/api';
import { LocalService } from '../../services/local.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  standalone: true,
  imports: [
    RouterModule,
    ReactiveFormsModule,
  ]
})
export class LoginComponent implements OnInit {
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

  ngOnInit(): void { }

  protected loginUser = (): void => {
    if (this.formGroup.invalid) {
      return
    }
    const request: LoginUserApiRequest = new LoginUserApiRequest(this.formGroup.value.email!, this.formGroup.value.password!)
    this.userApiService.loginUser(request).subscribe({
      next: (user) => {
        this.localService.setEmail(user.email)
        this.localService.setUserId(user.id)
        this.router.navigate([''])
      }
    })
  }

}
