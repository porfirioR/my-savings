import { ResolveFn } from '@angular/router';

export const loadingResolver: ResolveFn<boolean> = (route, state) => {
  return true;
};
