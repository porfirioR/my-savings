import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = async () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (!auth.checked()) {
    await auth.loadUser();
  }

  if (!auth.user()) {
    auth.login();
    return false;
  }

  if (!auth.isAuthorized()) {
    return router.createUrlTree(['/unauthorized']);
  }

  return true;
};
