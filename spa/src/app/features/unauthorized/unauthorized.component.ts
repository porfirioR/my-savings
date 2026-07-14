import { Component, inject } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-unauthorized',
  standalone: true,
  imports: [TranslateModule],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-base-200">
      <div class="card w-96 bg-base-100 shadow-xl text-center">
        <div class="card-body gap-4">
          <span class="text-6xl">🔒</span>
          <h2 class="card-title justify-center text-xl">{{ 'UNAUTHORIZED.TITLE' | translate }}</h2>
          @if (auth.user(); as user) {
            <p class="text-base-content/60 text-sm">
              {{ 'UNAUTHORIZED.LOGGED_IN_AS' | translate }} <strong>{{ user.userDetails }}</strong> {{ 'UNAUTHORIZED.MESSAGE' | translate }}
            </p>
          }
          <div class="card-actions flex-col gap-2">
            <button class="btn btn-error btn-sm w-full" (click)="auth.logout()">
              {{ 'APP.LOGOUT' | translate }}
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class UnauthorizedComponent {
  auth = inject(AuthService);
}
