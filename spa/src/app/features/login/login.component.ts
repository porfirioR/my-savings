import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, TranslateModule],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-base-200">
      <div class="card w-96 bg-base-100 shadow-xl">
        <div class="card-body gap-3">
          <h2 class="card-title justify-center text-xl mb-2">{{ 'APP.LOGIN' | translate }}</h2>

          <form [formGroup]="form" (ngSubmit)="submit()">
            <fieldset class="fieldset mb-3">
              <legend class="fieldset-legend">{{ 'LOGIN.EMAIL' | translate }}</legend>
              <input type="email" class="input input-bordered w-full" formControlName="email" autocomplete="username" />
            </fieldset>
            <fieldset class="fieldset mb-4">
              <legend class="fieldset-legend">{{ 'LOGIN.PASSWORD' | translate }}</legend>
              <input type="password" class="input input-bordered w-full" formControlName="password" autocomplete="current-password" />
            </fieldset>

            @if (errorMsg()) {
              <div class="alert alert-error mb-3 text-sm">
                <span>{{ errorMsg() }}</span>
              </div>
            }

            <button type="submit" class="btn btn-primary w-full" [disabled]="form.invalid || submitting()">
              @if (submitting()) { <span class="loading loading-spinner loading-xs"></span> }
              {{ 'LOGIN.SUBMIT' | translate }}
            </button>
          </form>
        </div>
      </div>
    </div>
  `,
})
export class LoginComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly fb = inject(FormBuilder);
  private readonly translate = inject(TranslateService);

  submitting = signal(false);
  errorMsg = signal<string | null>(null);

  form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  });

  async submit(): Promise<void> {
    if (this.form.invalid) return;
    this.errorMsg.set(null);
    this.submitting.set(true);

    const { email, password } = this.form.getRawValue();
    const error = await this.auth.login(email, password);

    this.submitting.set(false);
    if (error) {
      this.errorMsg.set(error === 'UNAUTHORIZED' ? this.translate.instant('LOGIN.UNAUTHORIZED_ERROR') : error);
      return;
    }

    const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');
    this.router.navigateByUrl(returnUrl || '/groups');
  }
}
