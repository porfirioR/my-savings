import { Component, OnInit } from '@angular/core';
import { EventApiService } from '../../services/event-api.service';
import { EventViewModel } from '../../models/view/event-view-model';
import { EventComponent } from '../event/event.component';
import { NgFor, NgIf } from '@angular/common';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  standalone: true,
  imports: [NgIf, NgFor, EventComponent],
})
export class HomeComponent implements OnInit {
  protected eventFollows: EventViewModel[] = []

  constructor(private readonly eventApiService: EventApiService) { }

  ngOnInit(): void {
    this.eventApiService.getMyEventFollows(1).subscribe({
      next: (eventFollow) => {
        this.eventFollows = eventFollow.map(x => new EventViewModel(x.id, x.name, x.authorId, '', x.description, x.isActive, x.date, x.isPublic))
      }, error: (e) => {
        throw e
      }
    })
  }

}
