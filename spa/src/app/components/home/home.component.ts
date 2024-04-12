import { NgFor, NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { EventComponent } from '../event/event.component';
import { EventApiService, LocalService } from '../../services';
import { EventViewModel } from '../../models/view/event-view-model';
import { LoadingSkeletonComponent } from "../loading-skeleton/loading-skeleton.component";

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  standalone: true,
  imports: [
    NgIf,
    NgFor,
    EventComponent,
    LoadingSkeletonComponent
  ]
})
export class HomeComponent implements OnInit {
  protected eventFollows: EventViewModel[] = []

  constructor(
    private readonly eventApiService: EventApiService,
    private readonly localService: LocalService
  ) { }

  ngOnInit(): void {
    const userId = this.localService.getUserId()
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
      }, error: (e) => {
        throw e
      }
    })
  }
}
