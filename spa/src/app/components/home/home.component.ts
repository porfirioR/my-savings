import { AsyncPipe, NgFor, NgIf } from '@angular/common'
import { Component, OnInit } from '@angular/core'
import { Store } from '@ngrx/store'
import { RouterModule } from '@angular/router'
import { Observable } from 'rxjs'
import { EventComponent } from '../event/event.component'
import { LoadingSkeletonComponent } from "../loading-skeleton/loading-skeleton.component"
import { EmptyDataComponent } from '../empty-data/empty-data.component'
import { EventApiService, LocalService } from '../../services'
import { EventViewModel } from '../../models/view/event-view-model'
import { selectIsLoading } from '../../store/loading/loading.selectors'
import { loadingActionGroup } from '../../store/loading/loading.actions'

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  standalone: true,
  imports: [
    NgIf,
    NgFor,
    AsyncPipe,
    RouterModule,
    EventComponent,
    LoadingSkeletonComponent,
    EmptyDataComponent
  ]
})
export class HomeComponent implements OnInit {
  protected eventFollows: EventViewModel[] = []
  protected loading$: Observable<boolean>
  protected userLoaded: boolean

  constructor(
    private readonly eventApiService: EventApiService,
    private readonly localService: LocalService,
    private readonly store: Store,
  ) {
    this.loading$ = this.store.select(selectIsLoading)
    const userId = this.localService.getUserId()
    this.userLoaded = userId > 0
    this.eventApiService.getPublicEvents().subscribe({
      next: (eventFollow) => {
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
    })
  }

  ngOnInit(): void {
  }
}
