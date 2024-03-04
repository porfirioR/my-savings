import { NgFor, NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { EventApiService } from '../../services/event-api.service';
import { EventViewModel } from '../../models/view/event-view-model';
import { EventComponent } from '../event/event.component';
import { LocalService } from '../../services/local.service';
import { debounce, debounceTime } from 'rxjs';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  standalone: true,
  imports: [NgIf, NgFor, EventComponent],
})
export class HomeComponent implements OnInit {
  protected eventFollows: EventViewModel[] = []

  constructor(
    private readonly eventApiService: EventApiService,
    private readonly localService: LocalService
  ) { }

  ngOnInit(): void {
    const userId = this.localService.getUserId()
    this.eventApiService.getPublicEvents().pipe(debounceTime(10000)).subscribe({
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
