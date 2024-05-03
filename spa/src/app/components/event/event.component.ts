import { Component, Input, OnInit } from '@angular/core'
import { DatePipe, NgClass } from '@angular/common'
import { EventViewModel } from '../../models/view/event-view-model'

@Component({
  selector: 'app-event',
  templateUrl: './event.component.html',
  styleUrls: ['./event.component.css'],
  standalone: true,
  imports: [
    NgClass,
    DatePipe
  ]
})
export class EventComponent implements OnInit {
  @Input() eventModel!: EventViewModel

  constructor() { }

  ngOnInit() {
  }

}
