import { Component, OnInit } from '@angular/core';
import { UserApiService } from '../../services';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ResetPasswordFormGroup } from '../../models/forms';
import { ResetPasswordApiRequest } from '../../models/api/reset-password-api-request';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule
  ]
})
export class ResetPasswordComponent implements OnInit {
  protected formGroup: FormGroup<ResetPasswordFormGroup>

  constructor(
    private readonly activeRoute: ActivatedRoute,
    private readonly userApiService: UserApiService
  ) {
    const code = this.activeRoute.snapshot.queryParams['code']
    this.formGroup = new FormGroup<ResetPasswordFormGroup>({
      email: new FormControl(null, [Validators.required, Validators.email]),
      newPassword: new FormControl(null, [Validators.required]),
      code: new FormControl(code ? code : null, [Validators.required]),
    })
  }

  ngOnInit() {
  }

  protected changePassword = (): void => {
    const request = new ResetPasswordApiRequest(this.formGroup.value.email!, this.formGroup.value.code!, this.formGroup.value.newPassword!)
    this.userApiService.resetPassword(request).subscribe({
      next: (value) => {
        
      }, error: (e) => {
        
        throw e
      }
    })
  }
}
