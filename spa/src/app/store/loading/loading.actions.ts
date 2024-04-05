import { createActionGroup, emptyProps, props } from '@ngrx/store'

export const loginActionGroup = createActionGroup({
  source: 'Loading Actions',
  events: {
    'Loading': emptyProps(),
    'Loading Failed': emptyProps(),
    'Loading Success': emptyProps(),
  }
})