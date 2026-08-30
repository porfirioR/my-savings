import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { environment } from '../../../environments/environment';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  const token = auth.accessToken();
  // Azure Static Web Apps overwrites the `Authorization` header with its own
  // internal token when it proxies /api/* to the Functions backend, so the
  // Supabase token has to travel in a header SWA leaves alone. `Authorization`
  // is kept too for local dev (no SWA in between).
  const authReq = token && req.url.startsWith(environment.apiUrl)
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}`, 'X-Sb-Token': token } })
    : req;

  return next(authReq).pipe(
    catchError(err => {
      // The /auth/me check itself is expected to 401/403 for an unauthorized
      // account - let AuthService.login()/loadUser() handle that inline
      // instead of bouncing the whole app around while it's mid-check.
      if (req.url.includes('/auth/me')) {
        return throwError(() => err);
      }

      if (err.status === 401) {
        auth.logout().then(() => router.navigate(['/login']));
      } else if (err.status === 403) {
        auth.logout().then(() => router.navigate(['/unauthorized']));
      }

      return throwError(() => err);
    }),
  );
};
