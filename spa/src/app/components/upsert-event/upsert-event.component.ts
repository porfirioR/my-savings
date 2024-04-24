import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Component, OnChanges, SimpleChanges } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { EventFormGroup } from '../../models/forms/event-form-group';
import { EventViewModel } from '../../models/view/event-view-model';
import { FormErrorsComponent } from '../form-errors/form-errors.component';
import { BaseComponent } from '../base/base.component';

@Component({
  selector: 'app-upsert-event',
  templateUrl: './upsert-event.component.html',
  styleUrls: ['./upsert-event.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    FormErrorsComponent,
  ]
})
export class UpsertEventComponent extends BaseComponent {
  protected formGroup: FormGroup<EventFormGroup>
  protected title: string

  constructor(
    private readonly activatedRoute: ActivatedRoute
  ) {
    super()
    const event: EventViewModel | null = this.activatedRoute.snapshot.data['event']
    this.title = event ? 'Update Event' : 'Create Event'
    this.formGroup = new FormGroup<EventFormGroup>({
      description: new FormControl(event?.description ?? null, [Validators.required]),
      name: new FormControl(event?.name ?? null, [Validators.required]),
      date: new FormControl(event?.date ?? null, [Validators.required]),
      isPublic: new FormControl(event?.isPublic ?? false, [Validators.required]),
      isActive: new FormControl(event?.isActive ?? false, [Validators.required]),
    })
  }

  protected save = (): void => {
    console.log(this.formGroup);
  }
}
