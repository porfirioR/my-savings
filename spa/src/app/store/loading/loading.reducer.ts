import { createReducer, on } from '@ngrx/store'
import { loginActionGroup } from './loading.actions'

export const loadingFeatureKey = 'logins'

export interface LoadingState {
  isLoading: boolean
}

export const initialState: LoadingState = {
  isLoading: true
}

export const loginReducer = createReducer(
  initialState,
  on(loginActionGroup.loading,
    (state) => ({
      ...state,
      isLoading: true
    })
  ),
  on(loginActionGroup.loadingFailed,
    (state) => ({
      ...state,
      isLoading: false
    })
  ),
)