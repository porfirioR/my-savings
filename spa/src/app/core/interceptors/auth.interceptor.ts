import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  return next(req).pipe(
    catchError(err => {
      // status 0 covers the SWA case where an expired session gets redirected
      // to the identity provider's cross-origin login flow, which the browser
      // reports as a CORS-blocked opaque network error rather than a 401.
      if ((err.status === 401 || err.status === 403 || err.status === 0) && !req.url.includes('/.auth/')) {
        auth.authAlert.set('session_expired');
      }
      return throwError(() => err);
    }),
  );
};
