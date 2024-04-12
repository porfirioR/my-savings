import { inject } from '@angular/core';
import { HttpInterceptorFn } from '@angular/common/http';
import { retry } from 'rxjs';
import { LocalService } from '../services';

export const jwtInterceptor: HttpInterceptorFn = (request, next) => {
  const localService = inject(LocalService)
  const token = localService.getJwtToken()
  if (token) {
    request = request.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    })
  }
  return next(request)
}