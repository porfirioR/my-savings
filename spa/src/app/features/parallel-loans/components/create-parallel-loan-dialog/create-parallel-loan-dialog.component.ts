import { Component, EventEmitter, inject, Input, OnChanges, Output, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { ParallelLoansService } from '../../services/parallel-loans.service';
import { MembersService } from '../../../members/services/members.service';
import { CreateParallelLoanFormGroup } from '../../../../core/forms';

@Component({
  selector: 'app-create-parallel-loan-dialog',
  standalone: true,
  imports: [ReactiveFormsModule, TranslateModule],
  template: `
    @if (show) {
      <div class="modal modal-open">
        <div class="modal-box">
          <h3 class="font-bold text-lg mb-1">{{ 'PARALLEL_LOANS.NEW' | translate }}</h3>
          <p class="text-sm text-base-content/50 mb-4">Configura los datos del nuevo préstamo.</p>

          <form [formGroup]="form">
          <fieldset class="fieldset mb-3">
            <legend class="fieldset-legend">{{ 'PARALLEL_LOANS.MEMBER' | translate }} <span class="text-error">*</span></legend>
            <select class="select select-bordered w-full" formControlName="memberId"
              [class.select-error]="form.controls.memberId.invalid && form.controls.memberId.touched">
              <option value="">-- Seleccionar --</option>
              @for (m of membersService.members(); track m.id) {
                @if (m.isActive) {
                  <option [value]="m.id">{{ m.firstName }} {{ m.lastName }}</option>
                }
              }
            </select>
            @if (form.controls.memberId.invalid && form.controls.memberId.touched) {
              <span class="text-error text-xs mt-1">Selecciona un miembro</span>
            }
          </fieldset>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
            <fieldset class="fieldset">
              <legend class="fieldset-legend">{{ 'PARALLEL_LOANS.AMOUNT' | translate }} (Gs) <span class="text-error">*</span></legend>
              <input type="number" class="input input-bordered w-full" formControlName="amount"
                [class.input-error]="form.controls.amount.invalid && form.controls.amount.touched" />
              @if (form.controls.amount.invalid && form.controls.amount.touched) {
                <span class="text-error text-xs mt-1">Monto requerido (mayor a 0)</span>
              }
            </fieldset>
            <fieldset class="fieldset">
              <legend class="fieldset-legend">{{ 'PARALLEL_LOANS.INTEREST' | translate }} (%) <span class="text-error">*</span></legend>
              <input type="number" class="input input-bordered w-full" formControlName="interestRate"
                [class.input-error]="form.controls.interestRate.invalid && form.controls.interestRate.touched" />
              @if (form.controls.interestRate.invalid && form.controls.interestRate.touched) {
                <span class="text-error text-xs mt-1">Campo requerido</span>
              }
            </fieldset>
            <fieldset class="fieldset">
              <legend class="fieldset-legend">{{ 'PARALLEL_LOANS.TOTAL_INSTALLMENTS' | translate }} <span class="text-error">*</span></legend>
              <input type="number" class="input input-bordered w-full" formControlName="totalInstallments"
                [class.input-error]="form.controls.totalInstallments.invalid && form.controls.totalInstallments.touched" />
              @if (form.controls.totalInstallments.invalid && form.controls.totalInstallments.touched) {
                <span class="text-error text-xs mt-1">Mínimo 1 cuota</span>
              }
            </fieldset>
            <fieldset class="fieldset">
              <legend class="fieldset-legend">{{ 'RUEDAS.ROUNDING' | translate }}</legend>
              <select class="select select-bordered w-full" formControlName="roundingUnit">
                <option [ngValue]="0">Sin redondeo</option>
                <option [ngValue]="500">500 Gs</option>
                <option [ngValue]="1000">1.000 Gs</option>
              </select>
            </fieldset>
            <fieldset class="fieldset">
              <legend class="fieldset-legend">{{ 'PAYMENTS.MONTH' | translate }} inicio <span class="text-error">*</span></legend>
              <select class="select select-bordered w-full" formControlName="startMonth">
                @for (m of months; track m.value) {
                  <option [ngValue]="m.value">{{ 'MONTHS.' + m.value | translate }}</option>
                }
              </select>
            </fieldset>
            <fieldset class="fieldset">
              <legend class="fieldset-legend">{{ 'PAYMENTS.YEAR' | translate }} <span class="text-error">*</span></legend>
              <input type="number" class="input input-bordered w-full" formControlName="startYear"
                [class.input-error]="form.controls.startYear.invalid && form.controls.startYear.touched" />
              @if (form.controls.startYear.invalid && form.controls.startYear.touched) {
                <span class="text-error text-xs mt-1">Año inválido</span>
              }
            </fieldset>
          </div>
          </form>

          <div class="divider my-2"></div>
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
export class CreateParallelLoanDialogComponent implements OnChanges {
  @Input() show = false;
  @Input() groupId = '';
  @Output() closed = new EventEmitter<void>();
  @Output() saved = new EventEmitter<void>();

  private readonly service = inject(ParallelLoansService);
  readonly membersService = inject(MembersService);
  private readonly fb = inject(FormBuilder);

  saving = signal(false);
  months = Array.from({ length: 12 }, (_, i) => ({ value: i + 1 }));

  form: FormGroup<CreateParallelLoanFormGroup> = this.fb.nonNullable.group({
    memberId: ['', Validators.required],
    amount: [0, [Validators.required, Validators.min(1)]],
    interestRate: [5, [Validators.required, Validators.min(0)]],
    totalInstallments: [15, [Validators.required, Validators.min(1)]],
    roundingUnit: [0 as 0 | 500 | 1000, Validators.required],
    startMonth: [new Date().getMonth() + 1, Validators.required],
    startYear: [new Date().getFullYear(), [Validators.required, Validators.min(2000)]],
  });

  ngOnChanges(): void {
    if (this.show) {
      this.form.reset({
        memberId: '',
        amount: 0,
        interestRate: 5,
        totalInstallments: 15,
        roundingUnit: 0,
        startMonth: new Date().getMonth() + 1,
        startYear: new Date().getFullYear(),
      });
    }
  }

  save(): void {
    if (this.form.invalid) return;
    this.saving.set(true);
    this.service.create(this.groupId, this.form.getRawValue()).subscribe({
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
