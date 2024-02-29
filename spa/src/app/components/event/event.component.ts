import { Component, Input, OnInit } from '@angular/core';
import { EventViewModel } from '../../models/view/event-view-model';

@Component({
  selector: 'app-event',
  templateUrl: './event.component.html',
  styleUrls: ['./event.component.css'],
  standalone: true,
  imports: []
})
export class EventComponent implements OnInit {
  @Input() eventModel!: EventViewModel

  constructor() { }

  ngOnInit() {
  }

}
