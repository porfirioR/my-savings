import { ApplicationConfig } from '@angular/core'
import { provideRouter } from '@angular/router'

import { routes } from './app.routes'
import { provideHttpClient, withInterceptors } from '@angular/common/http'
import { headerInterceptor } from './interceptors/header.interceptor'
import { jwtInterceptor } from './interceptors/jwt.interceptor'
import { provideStore } from '@ngrx/store'
import { provideEffects } from '@ngrx/effects'

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(withInterceptors([headerInterceptor, jwtInterceptor])),
    provideStore(),
    provideEffects()
  ]
}
