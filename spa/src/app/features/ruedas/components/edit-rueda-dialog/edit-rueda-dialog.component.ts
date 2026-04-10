import { Component, EventEmitter, inject, Input, OnChanges, Output, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { RuedasService } from '../../services/ruedas.service';
import { Rueda } from '../../models/rueda.model';
import { UpdateRuedaFormGroup } from '../../../../core/forms';

@Component({
  selector: 'app-edit-rueda-dialog',
  standalone: true,
  imports: [ReactiveFormsModule, TranslateModule],
  template: `
    @if (show) {
      <div class="modal modal-open">
        <div class="modal-box w-11/12 max-w-2xl">
          <h3 class="font-bold text-lg mb-1">{{ 'RUEDAS.EDIT' | translate }}</h3>
          <p class="text-sm text-base-content/50 mb-4">
            {{ 'RUEDAS.NUMBER' | translate }} {{ rueda?.ruedaNumber }}
          </p>

          <form [formGroup]="form">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <fieldset class="fieldset">
                <legend class="fieldset-legend">{{ 'RUEDAS.TYPE' | translate }} <span class="text-error">*</span></legend>
                <select class="select select-bordered w-full" formControlName="type">
                  <option value="new">{{ 'RUEDAS.TYPE_NEW' | translate }}</option>
                  <option value="continua">{{ 'RUEDAS.TYPE_CONTINUA' | translate }}</option>
                </select>
              </fieldset>
              <fieldset class="fieldset">
                <legend class="fieldset-legend">{{ 'RUEDAS.ROUNDING' | translate }}</legend>
                <select class="select select-bordered w-full" formControlName="roundingUnit">
                  <option [ngValue]="0">{{ 'RUEDAS.ROUNDING_NONE' | translate }}</option>
                  <option [ngValue]="500">500 Gs</option>
                  <option [ngValue]="1000">1.000 Gs</option>
                </select>
              </fieldset>
              <fieldset class="fieldset">
                <legend class="fieldset-legend">{{ 'RUEDAS.LOAN_AMOUNT' | translate }} (Gs) <span class="text-error">*</span></legend>
                <input type="number" class="input input-bordered w-full" formControlName="loanAmount"
                  [class.input-error]="form.controls.loanAmount.invalid && form.controls.loanAmount.touched" />
                @if (form.controls.loanAmount.invalid && form.controls.loanAmount.touched) {
                  <span class="text-error text-xs mt-1">{{ 'VALIDATION.AMOUNT_GT_ZERO' | translate }}</span>
                }
              </fieldset>
              <fieldset class="fieldset">
                <legend class="fieldset-legend">{{ 'RUEDAS.INTEREST_RATE' | translate }} (%) <span class="text-error">*</span></legend>
                <input type="number" class="input input-bordered w-full" formControlName="interestRate"
                  [class.input-error]="form.controls.interestRate.invalid && form.controls.interestRate.touched" />
                @if (form.controls.interestRate.invalid && form.controls.interestRate.touched) {
                  <span class="text-error text-xs mt-1">{{ 'VALIDATION.REQUIRED' | translate }}</span>
                }
              </fieldset>
              <fieldset class="fieldset">
                <legend class="fieldset-legend">{{ 'RUEDAS.CONTRIBUTION' | translate }} (Gs) <span class="text-error">*</span></legend>
                <input type="number" class="input input-bordered w-full" formControlName="contributionAmount"
                  [class.input-error]="form.controls.contributionAmount.invalid && form.controls.contributionAmount.touched" />
                @if (form.controls.contributionAmount.invalid && form.controls.contributionAmount.touched) {
                  <span class="text-error text-xs mt-1">{{ 'VALIDATION.AMOUNT_GT_ZERO' | translate }}</span>
                }
              </fieldset>
              <fieldset class="fieldset">
                <legend class="fieldset-legend">{{ 'RUEDAS.START_MONTH_YEAR' | translate }} <span class="text-error">*</span></legend>
                <div class="join w-full">
                  <select class="select select-bordered join-item flex-1" formControlName="startMonth">
                    @for (m of months; track m.value) {
                      <option [ngValue]="m.value">{{ 'MONTHS.' + m.value | translate }}</option>
                    }
                  </select>
                  <input type="number" class="input input-bordered join-item w-24" formControlName="startYear"
                    [class.input-error]="form.controls.startYear.invalid && form.controls.startYear.touched" />
                </div>
              </fieldset>
              <fieldset class="fieldset sm:col-span-2">
                <legend class="fieldset-legend">{{ 'RUEDAS.NOTES' | translate }}</legend>
                <textarea class="textarea textarea-bordered w-full" formControlName="notes" rows="2"></textarea>
              </fieldset>
            </div>
          </form>

          <div class="divider my-3"></div>
          <div class="modal-action mt-0">
            <button class="btn btn-ghost" (click)="onCancel()">{{ 'APP.CANCEL' | translate }}</button>
            <button class="btn btn-primary" [disabled]="form.invalid || saving()" (click)="save()">
              @if (saving()) { <span class="loading loading-spinner loading-xs"></span> }
              {{ 'APP.SAVE' | translate }}
            </button>
          </div>
        </div>
        <div class="modal-backdrop" (click)="onCancel()"></div>
      </div>
    }
  `,
})
export class EditRuedaDialogComponent implements OnChanges {
  @Input() show = false;
  @Input() rueda: Rueda | null = null;
  @Input() groupId = '';
  @Output() closed = new EventEmitter<void>();
  @Output() saved = new EventEmitter<void>();

  private readonly service = inject(RuedasService);
  private readonly fb = inject(FormBuilder);

  saving = signal(false);

  months = Array.from({ length: 12 }, (_, i) => ({ value: i + 1 }));

  form: FormGroup<UpdateRuedaFormGroup> = this.fb.nonNullable.group({
    type: ['new' as 'new' | 'continua', Validators.required],
    loanAmount: [0, [Validators.required, Validators.min(1)]],
    interestRate: [5, [Validators.required, Validators.min(0)]],
    contributionAmount: [0, [Validators.required, Validators.min(1)]],
    roundingUnit: [0 as 0 | 500 | 1000, Validators.required],
    startMonth: [new Date().getMonth() + 1, Validators.required],
    startYear: [new Date().getFullYear(), [Validators.required, Validators.min(2000)]],
    notes: [''],
  });

  ngOnChanges(): void {
    if (this.show && this.rueda) {
      this.form.reset({
        type: this.rueda.type,
        loanAmount: this.rueda.loanAmount,
        interestRate: this.rueda.interestRate,
        contributionAmount: this.rueda.contributionAmount,
        roundingUnit: (this.rueda.roundingUnit as 0 | 500 | 1000),
        startMonth: this.rueda.startMonth,
        startYear: this.rueda.startYear,
        notes: this.rueda.notes ?? '',
      });
    }
  }

  save(): void {
    if (this.form.invalid || !this.rueda) return;
    const raw = this.form.getRawValue();
    this.saving.set(true);
    this.service.update(this.groupId, this.rueda.id, raw).subscribe({
      next: () => {
        this.saving.set(false);
        this.saved.emit();
      },
      error: () => { this.saving.set(false); },
    });
  }

  onCancel(): void {
    this.closed.emit();
  }
}
