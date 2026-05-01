import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { ALLOWED_USER } from '../constants/auth.const';
import { environment } from '../../../environments/environment';

export interface SwaUser {
  userId: string;
  userDetails: string;
  identityProvider: string;
  userRoles: string[];
}

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

  async loadUser(): Promise<void> {
    if (!environment.production) {
      this.user.set(DEV_USER);
      this.checked.set(true);
      return;
    }
    try {
      const response = await firstValueFrom(
        this.http.get<{ clientPrincipal: SwaUser | null }>('/.auth/me')
      );
      this.user.set(response.clientPrincipal);
    } catch {
      this.user.set(null);
    } finally {
      this.checked.set(true);
    }
  }

  isAuthorized(): boolean {
    const u = this.user();
    return !!u && u.userDetails === ALLOWED_USER;
  }

  login(): void {
    window.location.href = '/.auth/login/github';
  }

  logout(): void {
    window.location.href = '/.auth/logout';
  }
}
