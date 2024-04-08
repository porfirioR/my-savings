import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { EMPTY, Observable, map } from 'rxjs';
import { EventComponent } from "../event/event.component";
import { LoadingSkeletonComponent } from "../loading-skeleton/loading-skeleton.component";
import { EventApiService, LocalService } from '../../services';
import { EventViewModel } from '../../models/view/event-view-model';
import { selectIsLoading } from '../../store/loading/loading.selectors';

@Component({
  selector: 'app-my-events',
  templateUrl: './my-events.component.html',
  styleUrls: ['./my-events.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    EventComponent,
    LoadingSkeletonComponent
  ]
})
export class MyEventsComponent implements OnInit {
  protected eventFollows: Observable<EventViewModel[]> = EMPTY
  protected loading$ = this.store.select(selectIsLoading)

  constructor(
    private readonly eventApiService: EventApiService,
    private readonly localService: LocalService,
    private store: Store,
  ) { }

  ngOnInit(): void {
    const userId = this.localService.getUserId()
    this.eventFollows = this.eventApiService.getMyEvents(userId).pipe(map((eventFollow) => {
      const currentDate = new Date()
      return eventFollow.map(x => new EventViewModel(
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
    }))
  }

}
