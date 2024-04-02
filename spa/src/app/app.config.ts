import { ApplicationConfig, ErrorHandler } from '@angular/core'
import { provideHttpClient, withInterceptors } from '@angular/common/http'
import { provideEffects } from '@ngrx/effects'
import { provideRouter } from '@angular/router'
import { provideStore } from '@ngrx/store'

import { routes } from './app.routes'
import { headerInterceptor } from './interceptors/header.interceptor'
import { jwtInterceptor } from './interceptors/jwt.interceptor'
import { metaReducers, reducers } from './store';
import { catchErrorInterceptor } from './interceptors/catch-error.interceptor'
import { CustomErrorHandler } from './errors/custom-error-handler'

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(withInterceptors([headerInterceptor, jwtInterceptor, catchErrorInterceptor])),
    provideStore(reducers, { metaReducers }),
    provideEffects(),
    {
      provide: ErrorHandler,
      useClass: CustomErrorHandler
    },
  ]
}
