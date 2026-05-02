import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom, timeout, TimeoutError } from 'rxjs';
import { ALLOWED_USER } from '../constants/auth.const';
import { environment } from '../../../environments/environment';

export interface SwaUser {
  userId: string;
  userDetails: string;
  identityProvider: string;
  userRoles: string[];
}

export type AuthAlert = 'session_expired' | 'wrong_user' | null;

const DEV_USER: SwaUser = {
  userId: 'local-dev',
  userDetails: ALLOWED_USER,
  identityProvider: 'github',
  userRoles: ['authenticated'],
};

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);

  user = signal<SwaUser | null>(null);
  checked = signal(false);
  authAlert = signal<AuthAlert>(null);

  async loadUser(): Promise<void> {
    if (!environment.production) {
      this.user.set(DEV_USER);
      this.checked.set(true);
      return;
    }
    try {
      const response = await firstValueFrom(
        this.http
          .get<{ clientPrincipal: SwaUser | null }>('/.auth/me')
          .pipe(timeout(8000)),
      );
      this.user.set(response.clientPrincipal);
    } catch (err) {
      this.user.set(null);
      if (err instanceof TimeoutError) {
        this.authAlert.set('session_expired');
      }
    } finally {
      this.checked.set(true);
    }
  }

  isAuthorized(): boolean {
    const u = this.user();
    return !!u && u.userDetails === ALLOWED_USER;
  }

  login(): void {
    const returnUrl = encodeURIComponent(window.location.pathname + window.location.search);
    window.location.href = `/.auth/login/github?post_login_redirect_uri=${returnUrl}`;
  }

  logout(): void {
    window.location.href = '/.auth/logout';
  }
}
