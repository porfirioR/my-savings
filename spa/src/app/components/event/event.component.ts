import { Component, EventEmitter, Input, Output } from '@angular/core'
import { DatePipe, NgClass } from '@angular/common'
import { EventViewModel } from '../../models/view/event-view-model'
import { Router, RouterModule } from '@angular/router'
import { AlertService, EventApiService } from '../../services'

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
  @Output() removeEventFromMyEvents = new EventEmitter<number>()

  constructor(
    private readonly router: Router,
    private readonly eventApiService: EventApiService,
    private readonly alertService: AlertService,
  ) { }

  protected editEvent = (id: number) => {
    this.router.navigate(['my-events/update-event', id])
  }

  protected deleteEvent = (id: number) => {
    this.alertService.showQuestionModal('Delete Event', 'Are you sure delete this event, cannot revert this action').then((result) => {
      if (result) {
        this.eventApiService.deleteEvent(id).subscribe({
          next: () => {
            this.alertService.showSuccess('Event deleted')
            this.removeEventFromMyEvents.emit(id)
          }
        })
      }
    }).catch()
  }

}
