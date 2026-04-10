import { Component, EventEmitter, inject, Input, OnChanges, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { CashBoxService } from '../../services/cash-box.service';
import { CreateMovementFormGroup } from '../../../../core/forms';

@Component({
  selector: 'app-add-movement-dialog',
  standalone: true,
  imports: [ReactiveFormsModule, TranslateModule],
  template: `
    @if (show) {
      <div class="modal modal-open">
        <div class="modal-box">
          <h3 class="font-bold text-lg mb-1">{{ 'CASH_BOX.ADD_MOVEMENT' | translate }}</h3>
          <p class="text-sm text-base-content/50 mb-4">{{ 'CASH_BOX.ADD_SUBTITLE' | translate }}</p>

          <form [formGroup]="form">
          <fieldset class="fieldset mb-3">
            <legend class="fieldset-legend">{{ 'CASH_BOX.TYPE' | translate }} <span class="text-error">*</span></legend>
            <div class="join w-full">
              <button type="button" class="btn join-item flex-1"
                [class.btn-success]="form.controls.type.value === 'in'"
                [class.btn-outline]="form.controls.type.value !== 'in'"
                (click)="form.controls.type.setValue('in')">
                {{ 'CASH_BOX.TYPE_IN' | translate }}
              </button>
              <button type="button" class="btn join-item flex-1"
                [class.btn-error]="form.controls.type.value === 'out'"
                [class.btn-outline]="form.controls.type.value !== 'out'"
                (click)="form.controls.type.setValue('out')">
                {{ 'CASH_BOX.TYPE_OUT' | translate }}
              </button>
            </div>
          </fieldset>

          <fieldset class="fieldset mb-3">
            <legend class="fieldset-legend">{{ 'CASH_BOX.AMOUNT' | translate }} (Gs) <span class="text-error">*</span></legend>
            <input type="number" class="input input-bordered w-full" formControlName="amount"
              [class.input-error]="form.controls.amount.invalid && form.controls.amount.touched" />
            @if (form.controls.amount.invalid && form.controls.amount.touched) {
              <span class="text-error text-xs mt-1">{{ 'VALIDATION.AMOUNT_GT_ZERO' | translate }}</span>
            }
          </fieldset>

          <fieldset class="fieldset mb-3">
            <legend class="fieldset-legend">{{ 'CASH_BOX.DESCRIPTION' | translate }} <span class="text-error">*</span></legend>
            <input type="text" class="input input-bordered w-full" formControlName="description"
              [class.input-error]="form.controls.description.invalid && form.controls.description.touched" />
            @if (form.controls.description.invalid && form.controls.description.touched) {
              <span class="text-error text-xs mt-1">{{ 'VALIDATION.REQUIRED' | translate }}</span>
            }
          </fieldset>

          <fieldset class="fieldset mb-3">
            <legend class="fieldset-legend">{{ 'CASH_BOX.CATEGORY' | translate }} <span class="text-error">*</span></legend>
            <select class="select select-bordered w-full" formControlName="category"
              [class.select-error]="form.controls.category.invalid && form.controls.category.touched">
              <option value="">-- Seleccionar --</option>
              <option value="contribution">Aporte</option>
              <option value="rueda_collection">Cobro rueda</option>
              <option value="rueda_disbursement">Desembolso rueda</option>
              <option value="parallel_loan_payment">Pago préstamo paralelo</option>
              <option value="parallel_loan_disbursement">Desembolso préstamo paralelo</option>
              <option value="member_entry">Ingreso de miembro</option>
              <option value="member_exit">Salida de miembro</option>
              <option value="adjustment">Ajuste</option>
            </select>
            @if (form.controls.category.invalid && form.controls.category.touched) {
              <span class="text-error text-xs mt-1">{{ 'VALIDATION.REQUIRED' | translate }}</span>
            }
          </fieldset>

          <div class="grid grid-cols-2 gap-3 mb-4">
            <fieldset class="fieldset">
              <legend class="fieldset-legend">{{ 'PAYMENTS.MONTH' | translate }} <span class="text-error">*</span></legend>
              <select class="select select-bordered w-full" formControlName="month">
                @for (m of months; track m.value) {
                  <option [ngValue]="m.value">{{ 'MONTHS.' + m.value | translate }}</option>
                }
              </select>
            </fieldset>
            <fieldset class="fieldset">
              <legend class="fieldset-legend">{{ 'PAYMENTS.YEAR' | translate }} <span class="text-error">*</span></legend>
              <input type="number" class="input input-bordered w-full" formControlName="year"
                [class.input-error]="form.controls.year.invalid && form.controls.year.touched" />
              @if (form.controls.year.invalid && form.controls.year.touched) {
                <span class="text-error text-xs mt-1">{{ 'VALIDATION.YEAR_INVALID' | translate }}</span>
              }
            </fieldset>
          </div>
          </form>

          <div class="divider my-2"></div>
          <div class="modal-action mt-0">
            <button class="btn btn-ghost" (click)="onCancel()">{{ 'APP.CANCEL' | translate }}</button>
            <button class="btn btn-primary" [disabled]="form.invalid || saving" (click)="save()">
              @if (saving) { <span class="loading loading-spinner loading-xs"></span> }
              {{ 'APP.SAVE' | translate }}
            </button>
          </div>
        </div>
        <div class="modal-backdrop" (click)="onCancel()"></div>
      </div>
    }
  `,
})
export class AddMovementDialogComponent implements OnChanges {
  @Input() show = false;
  @Input() groupId = '';
  @Output() closed = new EventEmitter<void>();
  @Output() saved = new EventEmitter<void>();

  private readonly service = inject(CashBoxService);
  private readonly fb = inject(FormBuilder);

  saving = false;
  months = Array.from({ length: 12 }, (_, i) => ({ value: i + 1 }));

  form: FormGroup<CreateMovementFormGroup> = this.fb.nonNullable.group({
    type: ['in' as 'in' | 'out', Validators.required],
    amount: [0, [Validators.required, Validators.min(1)]],
    description: ['', Validators.required],
    category: ['adjustment', Validators.required],
    month: [new Date().getMonth() + 1, Validators.required],
    year: [new Date().getFullYear(), [Validators.required, Validators.min(2000)]],
  });

  ngOnChanges(): void {
    if (this.show) {
      this.form.reset({
        type: 'in',
        amount: 0,
        description: '',
        category: 'adjustment',
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear(),
      });
    }
  }

  save(): void {
    if (this.form.invalid) return;
    this.saving = true;
    this.service.addMovement(this.groupId, this.form.getRawValue()).subscribe({
      next: () => {
        this.saving = false;
        this.saved.emit();
      },
      error: () => { this.saving = false; },
    });
  }

  onCancel(): void {
    this.closed.emit();
  }
}
