import { ActionReducerMap, MetaReducer } from '@ngrx/store'
import { environment } from '../../environments/environment.development'
import * as fromLogin from './loading/loading.reducer'

export interface AppState {
}

export const reducers: ActionReducerMap<AppState> = {
  [fromLogin.loadingFeatureKey]: fromLogin.loginReducer,
}

export const metaReducers: MetaReducer<AppState>[] = !environment.production ? [] : []