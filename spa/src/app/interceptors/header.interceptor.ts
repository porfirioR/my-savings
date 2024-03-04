import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { LocalService } from '../services/local.service';
import { retry } from 'rxjs';

export const headerInterceptor: HttpInterceptorFn = (req, next) => {
  const localService = inject(LocalService)
  const email = localService.getEmail()
  if (req.url.includes('public') || (req.method === 'post' && req.url.includes('users')) || !email) {
    return next(req);
  }
  const requestCopy = req.clone({
    headers: req.headers.set('Authorization', email)
  })
  return next(requestCopy).pipe(retry(1));
};
