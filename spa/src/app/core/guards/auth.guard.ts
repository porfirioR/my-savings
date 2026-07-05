import { inject } from '@angular/core';
import { CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { environment } from '../../../environments/environment';

export const authGuard: CanActivateFn = async () => {
  const auth = inject(AuthService);

  if (!auth.checked()) {
    await auth.loadUser();
  }

  if (!auth.user()) {
    if (!auth.authAlert()) {
      if (!environment.production) {
        // Local dev: no real SWA auth to redirect to, so surface the modal
        // instead of silently logging back in (which would undo a dev logout).
        auth.authAlert.set('session_expired');
      } else {
        // Normal unauthenticated: silent redirect to GitHub login
        auth.login();
      }
    }
    // If authAlert is set (timeout/error), AppComponent shows the modal
    return false;
  }

  if (!auth.isAuthorized()) {
    // Authenticated but wrong user: show wrong_user modal, block navigation
    auth.authAlert.set('wrong_user');
    return false;
  }

  return true;
};
