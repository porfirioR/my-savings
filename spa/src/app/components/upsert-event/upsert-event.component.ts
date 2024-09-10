import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms'
import { CommonModule, DatePipe, Location } from '@angular/common'
import { Component } from '@angular/core'
import { ActivatedRoute, RouterModule } from '@angular/router'
import { Observable } from 'rxjs'
import { TextComponent } from '../inputs/text/text.component'
import { TextAreaInputComponent } from '../inputs/text-area-input/text-area-input.component'
import { DateInputComponent } from '../inputs/date-input/date-input.component'
import { CheckBoxInputComponent } from '../inputs/check-box-input/check-box-input.component'
import { AlertService, EventApiService, LocalService } from '../../services'
import { EventFormGroup } from '../../models/forms/event-form-group'
import { EventViewModel } from '../../models/view/event-view-model'
import { CreateEventApiRequest, EvenApiModel, UpdateEventApiRequest } from '../../models/api'

@Component({
  selector: 'app-upsert-event',
  templateUrl: './upsert-event.component.html',
  styleUrls: ['./upsert-event.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    TextComponent,
    TextAreaInputComponent,
    CheckBoxInputComponent,
    DateInputComponent,
  ]
})
export class UpsertEventComponent {
  protected formGroup: FormGroup<EventFormGroup>
  protected title: string
  protected event?: EventViewModel
  protected saving = false

  constructor(
    private readonly activatedRoute: ActivatedRoute,
    private readonly eventApiService: EventApiService,
    private readonly localService: LocalService,
    private readonly location: Location,
    private readonly alertService: AlertService,
  ) {
    this.event = this.activatedRoute.snapshot.data['event']
    this.title = this.event ? 'Update Event' : 'Create Event'
    const date = this.event?.date ? new DatePipe('en-US').transform(this.event?.date, 'yyyy-MM-dd', 'utc') as unknown as Date : null
    this.formGroup = new FormGroup<EventFormGroup>({
      description: new FormControl(this.event?.description ?? null, [Validators.required]),
      name: new FormControl(this.event?.name ?? null, [Validators.required]),
      date: new FormControl(date, [Validators.required]),
      isPublic: new FormControl(this.event?.isPublic ?? false, [Validators.required]),
      isActive: new FormControl(this.event?.isActive ?? false, [Validators.required]),
    })
  }

  protected save = (event?: Event): void => {
    event?.preventDefault()
    if (this.formGroup.invalid) {
      return
    }
    this.saving = true
    this.formGroup.disable()
    const request$ = this.event ? this.update() : this.create()
    request$.subscribe({
      next: () => {
        this.alertService.showSuccess('Event save successfully')
        this.cancel()
      }, error: (e) => {
        this.formGroup.enable()
        this.saving = false
        throw e
      }
    })
  }

  protected cancel = (): void => this.location.back()

  private create = (): Observable<EvenApiModel> => {
    const request = new CreateEventApiRequest(
      this.formGroup.value.name!,
      this.localService.getUserId()!,
      this.formGroup.value.description!,
      this.formGroup.value.date!,
      this.formGroup.value.isPublic!,
    )
    return this.eventApiService.createEvent(request)
  }

  private update = (): Observable<EvenApiModel> => {
    const request = new UpdateEventApiRequest(
      this.event!.id,
      this.formGroup.value.name!,
      this.formGroup.value.description!,
      this.formGroup.value.date!,
      this.formGroup.value.isPublic!,
    )
    return this.eventApiService.updateEvent(request)
  }
}
