import { createReducer, on } from '@ngrx/store'
import { loadingActionGroup } from './loading.actions'

export const loadingFeatureKey = 'logins'

export interface LoadingState {
  isLoading: boolean
}

export const initialState: LoadingState = {
  isLoading: true
}

export const loginReducer = createReducer(
  initialState,
  on(loadingActionGroup.loading,
    (state) => ({
      ...state,
      isLoading: true
    })
  ),
  on(loadingActionGroup.loadingFailed,
    loadingActionGroup.loadingSuccess,
    (state) => ({
      ...state,
      isLoading: false
    })
  ),
)