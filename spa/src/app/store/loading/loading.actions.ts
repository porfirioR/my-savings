import { createActionGroup, emptyProps, props } from '@ngrx/store'

export const loginActionGroup = createActionGroup({
  source: 'Loading Actions',
  events: {
    'Loading': props<{ isLoading: boolean }>(),
    'Loading Failed': emptyProps(),
  }
})