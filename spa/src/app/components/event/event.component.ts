import { Component, Input } from '@angular/core'
import { DatePipe, NgClass } from '@angular/common'
import { EventViewModel } from '../../models/view/event-view-model'
import { Router, RouterLink, RouterModule } from '@angular/router'

@Component({
  selector: 'app-event',
  templateUrl: './event.component.html',
  styleUrls: ['./event.component.css'],
  standalone: true,
  imports: [
    NgClass,
    DatePipe,
    RouterModule
  ]
})
export class EventComponent {
  @Input() eventModel!: EventViewModel

  constructor(private readonly router: Router) { }

  protected editEvent = (id: number) => {
    this.router.navigate(['my-events/update-event', id])
  }

}
