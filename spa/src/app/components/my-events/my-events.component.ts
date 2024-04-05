import { Component, OnInit } from '@angular/core';
import { EventComponent } from "../event/event.component";
import { EventApiService, LocalService } from '../../services';
import { EventViewModel } from '../../models/view/event-view-model';
import { LoadingSkeletonComponent } from "../loading-skeleton/loading-skeleton.component";
import { Store } from '@ngrx/store';
import { selectIsLoading } from '../../store/loading/loading.selectors';

@Component({
  selector: 'app-my-events',
  templateUrl: './my-events.component.html',
  styleUrls: ['./my-events.component.css'],
  standalone: true,
  imports: [EventComponent, LoadingSkeletonComponent]
})
export class MyEventsComponent implements OnInit {
  protected eventFollows: EventViewModel[] = []
  protected loading$ = this.store.select(selectIsLoading);

  constructor(
    private readonly eventApiService: EventApiService,
    private readonly localService: LocalService,
    private store: Store,
  ) { }

  ngOnInit(): void {
    const userId = this.localService.getUserId()
    this.eventApiService.getMyEvents(userId).subscribe({
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
      }, error: (e) => {
        throw e
      }
    })
  }

}
