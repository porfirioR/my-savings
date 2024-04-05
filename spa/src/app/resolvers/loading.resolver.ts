import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, ResolveFn, RouterStateSnapshot } from '@angular/router';
import { Store } from '@ngrx/store';
import { EMPTY } from 'rxjs';
import { AppState } from '../store';
import * as fromLoadingActions from '../store/loading/loading.actions'

export const loadingResolver: ResolveFn<boolean> = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
  const store = inject(Store<AppState>)
  store.dispatch(fromLoadingActions.loginActionGroup.loading())
  return EMPTY;
};
