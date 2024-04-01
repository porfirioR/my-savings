import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor
} from '@angular/common/http';
import { catchError, Observable, retry } from 'rxjs';
import { Store } from '@ngrx/store';
import { AppState } from '../store';
import * as fromLoadingActions from '../store/loading/loading.actions'

@Injectable()
export class CatchErrorInterceptor implements HttpInterceptor {

  constructor(private store: Store<AppState>) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    return next.handle(request).pipe(retry(3), catchError(error => {
      this.store.dispatch(fromLoadingActions.loginActionGroup.loadingFailed())
      throw error
    }))
  }
}
