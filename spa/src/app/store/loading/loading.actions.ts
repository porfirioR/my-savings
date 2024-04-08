import { createActionGroup, emptyProps } from '@ngrx/store'

export const loadingActionGroup = createActionGroup({
  source: 'Loading Actions',
  events: {
    'Loading': emptyProps(),
    'Loading Success': emptyProps(),
    'Loading Failed': emptyProps(),
  }
})