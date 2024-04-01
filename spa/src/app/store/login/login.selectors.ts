import { createFeatureSelector, createSelector } from '@ngrx/store';
import * as fromLogin from './login.reducer';
import { LoginState } from './login.reducer';

export const selectUser = (state: LoginState) => state.isLoading;

export const selectUserState = createFeatureSelector<fromLogin.LoginState>('login');

export const selectIsLoading = createSelector(
  selectUserState,
  (state) => state.isLoading
);