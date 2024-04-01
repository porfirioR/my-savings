import { ApplicationConfig } from '@angular/core'
import { provideHttpClient, withInterceptors } from '@angular/common/http'
import { provideRouter } from '@angular/router'
import { provideStore } from '@ngrx/store'
import { provideEffects } from '@ngrx/effects'

import { routes } from './app.routes'
import { headerInterceptor } from './interceptors/header.interceptor'
import { jwtInterceptor } from './interceptors/jwt.interceptor'
import { metaReducers, reducers } from './store';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(withInterceptors([headerInterceptor, jwtInterceptor])),
    provideStore(reducers, { metaReducers }),
    provideEffects()
  ]
}
