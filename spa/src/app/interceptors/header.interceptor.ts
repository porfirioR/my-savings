import { HttpHandlerFn, HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { retry } from 'rxjs';
import { LocalService } from '../services';

export const headerInterceptor: HttpInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn) => {
  const localService = inject(LocalService)
  const email = localService.getEmail()
  if (req.url.includes('public') || (req.method === 'post' && req.url.includes('users')) || !email) {
    return next(req);
  }
  const requestCopy = req.clone({
    headers: req.headers.set('email', email)
  })
  return next(requestCopy)
};
