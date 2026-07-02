import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom, timeout } from 'rxjs';
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

const DEV_LOGGED_OUT_KEY = 'dev_logged_out';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);

  user = signal<SwaUser | null>(null);
  checked = signal(false);
  authAlert = signal<AuthAlert>(null);

  async loadUser(): Promise<void> {
    if (!environment.production) {
      const loggedOut = localStorage.getItem(DEV_LOGGED_OUT_KEY) === '1';
      this.user.set(loggedOut ? null : DEV_USER);
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
    } catch {
      this.user.set(null);
      this.authAlert.set('session_expired');
    } finally {
      this.checked.set(true);
    }
  }

  isAuthorized(): boolean {
    const u = this.user();
    return !!u && u.userDetails === ALLOWED_USER;
  }

  login(): void {
    if (!environment.production) {
      localStorage.removeItem(DEV_LOGGED_OUT_KEY);
      this.authAlert.set(null);
      window.location.href = '/';
      return;
    }
    const returnUrl = encodeURIComponent(window.location.pathname + window.location.search);
    window.location.href = `/.auth/login/github?post_login_redirect_uri=${returnUrl}`;
  }

  logout(): void {
    if (!environment.production) {
      localStorage.setItem(DEV_LOGGED_OUT_KEY, '1');
      window.location.href = '/';
      return;
    }
    window.location.href = '/.auth/logout';
  }
}
