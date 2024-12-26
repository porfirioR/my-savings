import { AsyncPipe } from '@angular/common'
import { Component } from '@angular/core'
import { RouterModule } from '@angular/router'
import { Store } from '@ngrx/store'
import { Observable, first, tap } from 'rxjs'
import { EventComponent } from "../event/event.component"
import { LoadingSkeletonComponent } from "../loading-skeleton/loading-skeleton.component"
import { EventApiService, LocalService } from '../../services'
import { EventViewModel } from '../../models/view/event-view-model'
import { selectIsLoading } from '../../store/loading/loading.selectors'
import { loadingActionGroup } from '../../store/loading/loading.actions'
import { EmptyDataComponent } from "../empty-data/empty-data.component";

@Component({
  selector: 'app-my-events',
  templateUrl: './my-events.component.html',
  styleUrls: ['./my-events.component.css'],
  standalone: true,
  imports: [
    AsyncPipe,
    RouterModule,
    EventComponent,
    LoadingSkeletonComponent,
    EmptyDataComponent
]
})
export class MyEventsComponent {
  protected eventFollows: EventViewModel[] = []
  protected loading$: Observable<boolean>

  constructor(
    private readonly eventApiService: EventApiService,
    private readonly localService: LocalService,
    private store: Store,
  ) {
    this.loading$ = this.store.select(selectIsLoading)
    const userId = this.localService.getUserId()
    this.eventApiService.getMyEvents(userId).pipe(
      first(),
      tap((eventFollow) => {
        const currentDate = new Date()
        this.eventFollows = eventFollow.map(x => new EventViewModel(
          x.id,
          x.name,
          x.authorId,
          x.authorId !== userId ? '': this.localService.getEmail()!,
          x.description,
          x.isActive,
          new Date(x.date),
          x.isPublic,
          currentDate
        ))
        this.store.dispatch(loadingActionGroup.loadingSuccess())
      }
    )).subscribe()
  }

}
