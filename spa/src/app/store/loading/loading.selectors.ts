import { createFeatureSelector, createSelector } from '@ngrx/store'
import * as fromLoading from './loading.reducer'

export const loadingFeatureSelector = createFeatureSelector<fromLoading.LoadingState>(fromLoading.loadingFeatureKey)

export const selectIsLoading = createSelector(
  loadingFeatureSelector,
  (state) => state.isLoading
)