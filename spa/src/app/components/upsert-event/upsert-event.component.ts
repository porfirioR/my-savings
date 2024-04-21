import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { EventFormGroup } from '../../models/forms/event-form-group';
import { tap } from 'rxjs';
import { EventViewModel } from '../../models/view/event-view-model';

@Component({
  selector: 'app-upsert-event',
  templateUrl: './upsert-event.component.html',
  styleUrls: ['./upsert-event.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
  ]
})
export class UpsertEventComponent {
  protected formGroup: FormGroup<EventFormGroup>

  constructor(
    private readonly activatedRoute: ActivatedRoute
  ) {
    const event: EventViewModel | null = this.activatedRoute.snapshot.data['event']
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
