import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { LoginFormGroup } from '../../models/forms';
import { UserApiService } from '../../services/user-api.service';
import { CreateUserApiRequest } from '../../models/api';

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
    private readonly userApiService: UserApiService
  ) {
    this.formGroup = new FormGroup<LoginFormGroup>({
      email: new FormControl(null, [Validators.required, Validators.email]),
      password: new FormControl(null, [Validators.required, Validators.minLength(5), Validators.maxLength(10)])
    })
  }

  ngOnInit(): void {
  }

  protected save = (): void => {
    if (!this.formGroup.valid) {
      return
    }
    const request: CreateUserApiRequest = new CreateUserApiRequest(this.formGroup.value.email!, this.formGroup.value.password!)
    this.userApiService.createUser(request).subscribe({
      next: (user) => {
        //todo set to local storage
        this.router.navigate([''])
      }
    })
  }

}
