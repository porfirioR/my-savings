import { inject } from '@angular/core';
import { CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = async () => {
  const auth = inject(AuthService);

  if (!auth.checked()) {
    await auth.loadUser();
  }

  if (!auth.user()) {
    if (!auth.authAlert()) {
      // Normal unauthenticated: silent redirect to GitHub login
      auth.login();
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
