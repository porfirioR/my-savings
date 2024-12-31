import { CommonModule, DatePipe, Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { TextComponent } from '../inputs/text/text.component';
import { CheckBoxInputComponent } from '../inputs/check-box-input/check-box-input.component';
import { DateInputComponent } from '../inputs/date-input/date-input.component';
import { TextAreaInputComponent } from '../inputs/text-area-input/text-area-input.component';
import { SavingFormGroup } from '../../models/forms';
import { AlertService, LocalService, SavingApiService } from '../../services';
import { Observable } from 'rxjs';
import { CreateSavingApiRequest, SavingApiModel, UpdateSavingApiRequest, } from '../../models/api';

@Component({
  selector: 'app-upsert-saving',
  templateUrl: './upsert-saving.component.html',
  styleUrls: ['./upsert-saving.component.css'],
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
export class UpsertSavingComponent implements OnInit {
  protected formGroup: FormGroup<SavingFormGroup>
  protected title: string
  protected saving?: SavingApiModel
  protected savingForm = false

  constructor(
    private readonly location: Location,
    private readonly localService: LocalService,
    private readonly activatedRoute: ActivatedRoute,
    private readonly alertService: AlertService,
    private readonly savingApiService: SavingApiService,
  ) {
    this.saving = this.activatedRoute.snapshot.data['saving']
    this.title = this.saving ? 'Update Saving' : 'New Saving'
    let date = new Date()
    if (this.saving?.date) {
      date = this.saving?.date
    }
    date = new DatePipe('en-US').transform(date, 'yyyy-MM-dd', 'utc') as unknown as Date
    this.formGroup = new FormGroup<SavingFormGroup>({
      id: new FormControl(this.saving?.id),
      name: new FormControl(this.saving?.name, [Validators.required, Validators.maxLength(50)]),
      description: new FormControl(this.saving?.description, [Validators.required, Validators.maxLength(100)]),
      date: new FormControl(date, [Validators.required]),
      savingTypeId: new FormControl(this.saving?.savingTypeId, [Validators.required]),
      isActive: new FormControl(this.saving?.isActive),
      currencyId: new FormControl(this.saving?.currencyId, [Validators.required]),
      periodId: new FormControl(this.saving?.periodId),
      totalAmount: new FormControl(this.saving?.totalAmount),
      numberOfPayment: new FormControl(this.saving?.numberOfPayment),
    })
  }

  ngOnInit() {
  }

  protected cancel = (): void => this.location.back()

  protected save = (event?: Event): void => {
    event?.preventDefault()
    if (this.formGroup.invalid) {
      return
    }
    this.savingForm = true
    this.formGroup.disable()
    const request$ = this.saving ? this.update() : this.create()
    request$.subscribe({
      next: () => {
        this.alertService.showSuccess('Saving save successfully')
        this.cancel()
      }, error: (e) => {
        this.formGroup.enable()
        this.savingForm = false
        throw e
      }
    })
  }

  private create = (): Observable<SavingApiModel> => {
    const request = new CreateSavingApiRequest(
      this.formGroup.value.name!,
      this.formGroup.value.description!,
      this.formGroup.value.date!,
      this.formGroup.value.savingTypeId!,
      this.formGroup.value.currencyId!,
      this.localService.getUserId()!,
      this.formGroup.value.periodId ?? undefined,
      this.formGroup.value.totalAmount ?? undefined,
      this.formGroup.value.numberOfPayment ?? undefined,
    )
    return this.savingApiService.createSaving(request)
  }

  private update = (): Observable<SavingApiModel> => {
    const request = new UpdateSavingApiRequest(
      this.formGroup.value.id!,
      this.formGroup.value.isActive ?? true,
      this.formGroup.value.name!,
      this.formGroup.value.description!,
      this.formGroup.value.date!,
      this.formGroup.value.savingTypeId!,
      this.formGroup.value.currencyId!,
      this.localService.getUserId()!,
      this.formGroup.value.periodId ?? undefined,
      this.formGroup.value.totalAmount ?? undefined,
      this.formGroup.value.numberOfPayment ?? undefined,
    )
    return this.savingApiService.updateSaving(request)
  }
}
