import { Component, effect, inject, OnDestroy, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { ThemeService } from './core/services/theme.service';
import { LanguageService } from './core/services/language.service';
import { AuthService } from './core/services/auth.service';
import { ToastService } from './core/services/toast.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, TranslateModule],
  template: `
    <router-outlet />

    <div class="toast toast-bottom toast-end z-50">
      @for (t of toast.toasts(); track t.id) {
        <div class="alert" [class.alert-success]="t.type === 'success'" [class.alert-error]="t.type === 'error'">
          <span>{{ t.text | translate }}</span>
        </div>
      }
    </div>

    @if (auth.authAlert()) {
      <div class="modal modal-open">
        <div class="modal-box text-center max-w-sm">

          @if (auth.authAlert() === 'wrong_user') {
            <div class="text-5xl mb-4">🚫</div>
            <h3 class="font-bold text-lg mb-2">{{ 'APP.WRONG_USER_TITLE' | translate }}</h3>
            @if (auth.user(); as user) {
              <p class="text-base-content/70 text-sm mb-1">
                {{ 'APP.LOGGED_IN_AS' | translate }} <strong>{{ user.userDetails }}</strong>,
                {{ 'APP.WRONG_USER_MESSAGE' | translate }}
              </p>
            }
            <p class="text-base-content/50 text-xs mb-6">
              {{ 'APP.LOGGING_OUT_IN' | translate }} <span class="font-bold text-base-content/80">{{ countdown() }}</span>...
            </p>
            <button class="btn btn-error btn-sm w-full" (click)="logoutNow()">
              {{ 'APP.LOGOUT_NOW' | translate }}
            </button>

          } @else {
            <div class="text-5xl mb-4">⏱</div>
            <h3 class="font-bold text-lg mb-2">{{ 'APP.SESSION_EXPIRED_TITLE' | translate }}</h3>
            <p class="text-base-content/70 text-sm mb-6">
              {{ 'APP.SESSION_EXPIRED_MESSAGE' | translate }}<br>
              {{ 'APP.SESSION_EXPIRED_RETRY' | translate }}
            </p>
            <button class="btn btn-primary btn-sm w-full mb-2" (click)="loginAgain()">
              {{ 'APP.LOGIN' | translate }}
            </button>
            <button class="btn btn-ghost btn-sm w-full" (click)="logoutNow()">
              {{ 'APP.LOGOUT' | translate }}
            </button>
          }

        </div>
      </div>
    }
  `,
})
export class AppComponent implements OnDestroy {
  readonly auth = inject(AuthService);
  readonly toast = inject(ToastService);
  private readonly theme = inject(ThemeService);
  private readonly language = inject(LanguageService);

  countdown = signal(5);
  private countdownInterval: ReturnType<typeof setInterval> | null = null;

  constructor() {
    this.language.init();
    this.theme.init();

    effect(() => {
      if (this.auth.authAlert() === 'wrong_user') {
        this.countdown.set(5);
        this.startCountdown();
      } else {
        this.clearCountdown();
      }
    });
  }

  logoutNow(): void {
    this.clearCountdown();
    this.auth.logout();
  }

  loginAgain(): void {
    this.auth.authAlert.set(null);
    this.auth.login();
  }

  ngOnDestroy(): void {
    this.clearCountdown();
  }

  private startCountdown(): void {
    this.clearCountdown();
    this.countdownInterval = setInterval(() => {
      const next = this.countdown() - 1;
      if (next <= 0) {
        this.clearCountdown();
        this.auth.logout();
      } else {
        this.countdown.set(next);
      }
    }, 1000);
  }

  private clearCountdown(): void {
    if (this.countdownInterval !== null) {
      clearInterval(this.countdownInterval);
      this.countdownInterval = null;
    }
  }
}
