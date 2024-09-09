import { inject } from '@angular/core'
import { HttpInterceptorFn } from '@angular/common/http'
import { Store } from '@ngrx/store'
import { catchError, retry } from 'rxjs'
import { AppState } from '../store'
import { loadingActionGroup } from '../store/loading/loading.actions'

export const catchErrorInterceptor: HttpInterceptorFn = (request, next) =>  {
  const store = inject(Store<AppState>)

  return next(request).pipe(retry(2), catchError(error => {
    store.dispatch(loadingActionGroup.loadingFailed())
    throw error
  }))
}
