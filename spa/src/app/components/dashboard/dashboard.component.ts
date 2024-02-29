import { Component, OnInit } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { EventComponent } from '../event/event.component';
import { EventViewModel } from '../../models/view/event-view-model';
import { EventApiService } from '../../services/event-api.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [NgIf, NgFor, EventComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {
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
