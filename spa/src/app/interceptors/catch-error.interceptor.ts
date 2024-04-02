import { inject } from '@angular/core';
import {
  HttpInterceptorFn
} from '@angular/common/http';
import { catchError, retry } from 'rxjs';
import { Store } from '@ngrx/store';
import { AppState } from '../store';
import * as fromLoadingActions from '../store/loading/loading.actions'

export const catchErrorInterceptor: HttpInterceptorFn = (request, next) =>  {
  const store = inject(Store<AppState>)

  return next(request).pipe(retry(3), catchError(error => {
    store.dispatch(fromLoadingActions.loginActionGroup.loadingFailed())
    throw error
  }))
}
