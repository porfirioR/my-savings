import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ForgotPasswordFormGroup } from '../../models/forms';
import { AlertService, UserApiService } from '../../services';
import { ForgotPasswordApiRequest } from '../../models/api';
import { FormErrorsComponent } from '../form-errors/form-errors.component';
import { TextComponent } from '../inputs/text/text.component';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.css'],
  standalone: true,
  imports: [
    RouterModule,
    ReactiveFormsModule,
    TextComponent
  ]
})
export class ForgotPasswordComponent implements OnInit {
  protected formGroup: FormGroup<ForgotPasswordFormGroup>
  protected showMessage: boolean = false
  constructor(
    private readonly userApiService: UserApiService,
    private readonly alertService: AlertService
  ) {
    this.formGroup = new FormGroup<ForgotPasswordFormGroup>({
      email: new FormControl(null, [Validators.required, Validators.email])
    })
  }

  ngOnInit() {
  }

  protected sendCode = (event: Event): void => {
    event.preventDefault();
    if (!this.formGroup.valid) {
      return
    }
    const email = this.formGroup.value.email!
    this.showMessage = false
    this.userApiService.forgotPassword(new ForgotPasswordApiRequest(email)).subscribe({
      next: (value) => {
        if (value) {
          this.alertService.showSuccess('Code was sended correctly.')
          this.showMessage = true
        }
      }, error: (e) => {
        this.showMessage = false
        throw e
      }
    })
  }

}
