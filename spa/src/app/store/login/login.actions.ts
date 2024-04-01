import { createActionGroup, emptyProps, props } from '@ngrx/store';

import { Login } from './login.model';

export const LoginActions = createActionGroup({
  source: 'Login/API',
  events: {
    'Upsert Login': props<{ login: Login }>(),
    'Clear Logins': emptyProps(),
  }
});
