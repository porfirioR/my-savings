import { inject } from '@angular/core'
import { HttpInterceptorFn } from '@angular/common/http'
import { LocalService } from '../services'

export const jwtInterceptor: HttpInterceptorFn = (request, next) => {
  const localService = inject(LocalService)
  const token = localService.getJwtToken()
  if (token) {
    request = request.clone({
      setHeaders: {
        JwtUserToken: `Bearer ${token}`
      }
    })
  }
  return next(request)
}