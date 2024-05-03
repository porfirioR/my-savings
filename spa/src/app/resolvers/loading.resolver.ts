import { inject } from '@angular/core'
import { ActivatedRouteSnapshot, ResolveFn, RouterStateSnapshot } from '@angular/router'
import { Store } from '@ngrx/store'
import { AppState } from '../store'
import { loadingActionGroup } from '../store/loading/loading.actions'

export const loadingResolver: ResolveFn<boolean> = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
  const store = inject(Store<AppState>)
  store.dispatch(loadingActionGroup.loading())
  return true
}
