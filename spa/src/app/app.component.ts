import { Component, effect, inject, OnDestroy, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ThemeService } from './core/services/theme.service';
import { AuthService } from './core/services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, TranslateModule],
  template: `
    <router-outlet />

    @if (auth.authAlert()) {
      <div class="modal modal-open">
        <div class="modal-box text-center max-w-sm">

          @if (auth.authAlert() === 'wrong_user') {
            <div class="text-5xl mb-4">🚫</div>
            <h3 class="font-bold text-lg mb-2">Acceso no permitido</h3>
            @if (auth.user(); as user) {
              <p class="text-base-content/70 text-sm mb-1">
                Iniciaste sesión como <strong>{{ user.userDetails }}</strong>,
                pero esta aplicación solo está disponible para el usuario autorizado.
              </p>
            }
            <p class="text-base-content/50 text-xs mb-6">
              Cerrando sesión en <span class="font-bold text-base-content/80">{{ countdown() }}</span>...
            </p>
            <button class="btn btn-error btn-sm w-full" (click)="logoutNow()">
              Cerrar sesión ahora
            </button>

          } @else {
            <div class="text-5xl mb-4">⏱</div>
            <h3 class="font-bold text-lg mb-2">Sesión finalizada</h3>
            <p class="text-base-content/70 text-sm mb-6">
              Tu sesión expiró o hubo un problema de conexión.<br>
              Volvé a iniciar sesión para continuar.
            </p>
            <button class="btn btn-primary btn-sm w-full" (click)="loginAgain()">
              Iniciar sesión
            </button>
          }

        </div>
      </div>
    }
  `,
})
export class AppComponent implements OnDestroy {
  readonly auth = inject(AuthService);
  private readonly theme = inject(ThemeService);

  countdown = signal(5);
  private countdownInterval: ReturnType<typeof setInterval> | null = null;

  constructor(private translate: TranslateService) {
    this.translate.setDefaultLang('es');
    this.translate.use('es');
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
