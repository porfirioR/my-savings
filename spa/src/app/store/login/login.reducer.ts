import { createFeature, createReducer, on } from '@ngrx/store';
import { EntityState, EntityAdapter, createEntityAdapter } from '@ngrx/entity';
import { Login } from './login.model';
import { LoginActions } from './login.actions';

export const loginsFeatureKey = 'logins';

export interface LoginState extends EntityState<Login> {
  isLoading: boolean
}

export const adapter: EntityAdapter<Login> = createEntityAdapter<Login>();

export const initialState: LoginState = adapter.getInitialState({
  isLoading: true
});

export const reducer = createReducer(
  initialState,
  on(LoginActions.upsertLogin, (state, action) => adapter.upsertOne(action.login, state)),
  on(LoginActions.clearLogins,
    state => adapter.removeAll(state)
  ),
);

export const loginsFeature = createFeature({
  name: loginsFeatureKey,
  reducer,
  extraSelectors: ({ selectLoginsState }) => ({
    ...adapter.getSelectors(selectLoginsState)
  }),
});

export const {
  selectIds,
  selectEntities,
  selectAll,
  selectTotal,
} = loginsFeature;
