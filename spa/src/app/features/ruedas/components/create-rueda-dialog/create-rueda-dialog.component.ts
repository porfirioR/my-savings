import { Component, EventEmitter, inject, Input, OnChanges, Output, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { RuedasService } from '../../services/ruedas.service';
import { MembersService } from '../../../members/services/members.service';
import { CreateRuedaFormGroup } from '../../../../core/forms';

@Component({
  selector: 'app-create-rueda-dialog',
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule, TranslateModule, DecimalPipe],
  template: `
    @if (show) {
      <div class="modal modal-open">
        <div class="modal-box w-11/12 max-w-2xl">
          <h3 class="font-bold text-lg mb-1">{{ 'RUEDAS.NEW' | translate }}</h3>
          <p class="text-sm text-base-content/50 mb-4">Configura los parámetros de la nueva rueda.</p>

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
                <option [ngValue]="0">Sin redondeo</option>
                <option [ngValue]="500">500 Gs</option>
                <option [ngValue]="1000">1.000 Gs</option>
              </select>
            </fieldset>
            <fieldset class="fieldset">
              <legend class="fieldset-legend">
                {{ 'RUEDAS.LOAN_AMOUNT' | translate }} (Gs) <span class="text-error">*</span>
                @if (suggested()) {
                  <span class="text-info cursor-pointer ml-2 font-normal" (click)="useSuggestion()">
                    {{ 'RUEDAS.SUGGESTION' | translate }}: {{ suggested() | number:'1.0-0' }}
                  </span>
                }
              </legend>
              <div class="join w-full">
                <input type="number" class="input input-bordered join-item flex-1" formControlName="loanAmount"
                  [class.input-error]="form.controls.loanAmount.invalid && form.controls.loanAmount.touched" />
                <button type="button" class="btn join-item btn-outline" (click)="getSuggestion()">
                  {{ 'RUEDAS.CALCULATE' | translate }}
                </button>
              </div>
              @if (form.controls.loanAmount.invalid && form.controls.loanAmount.touched) {
                <span class="text-error text-xs mt-1">Monto requerido (mayor a 0)</span>
              }
            </fieldset>
            <fieldset class="fieldset">
              <legend class="fieldset-legend">{{ 'RUEDAS.INTEREST_RATE' | translate }} (%) <span class="text-error">*</span></legend>
              <input type="number" class="input input-bordered w-full" formControlName="interestRate"
                [class.input-error]="form.controls.interestRate.invalid && form.controls.interestRate.touched" />
              @if (form.controls.interestRate.invalid && form.controls.interestRate.touched) {
                <span class="text-error text-xs mt-1">Campo requerido</span>
              }
            </fieldset>
            <fieldset class="fieldset">
              <legend class="fieldset-legend">{{ 'RUEDAS.CONTRIBUTION' | translate }} (Gs) <span class="text-error">*</span></legend>
              <input type="number" class="input input-bordered w-full" formControlName="contributionAmount"
                [class.input-error]="form.controls.contributionAmount.invalid && form.controls.contributionAmount.touched" />
              @if (form.controls.contributionAmount.invalid && form.controls.contributionAmount.touched) {
                <span class="text-error text-xs mt-1">Campo requerido (mayor a 0)</span>
              }
            </fieldset>
            <fieldset class="fieldset">
              <legend class="fieldset-legend">Mes / Año inicio <span class="text-error">*</span></legend>
              <div class="join w-full">
                <select class="select select-bordered join-item flex-1" formControlName="startMonth">
                  @for (m of months; track m.value) {
                    <option [ngValue]="m.value">{{ m.label }}</option>
                  }
                </select>
                <input type="number" class="input input-bordered join-item w-24" formControlName="startYear"
                  [class.input-error]="form.controls.startYear.invalid && form.controls.startYear.touched" />
              </div>
            </fieldset>
          </div>
          </form>

          <!-- Slot assignment -->
          <div class="mt-5">
            <h4 class="font-semibold text-sm mb-2">{{ 'RUEDAS.SLOTS' | translate }}</h4>
            <div class="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto pr-1">
              @for (slot of slots; track slot.position) {
                <div class="flex items-center gap-2 bg-base-200 rounded-lg p-2">
                  <span class="badge badge-xs badge-outline shrink-0">{{ slot.position }}</span>
                  <select class="select select-bordered select-xs flex-1 min-w-0" [(ngModel)]="slot.memberId">
                    <option value="">-</option>
                    @for (m of membersService.members(); track m.id) {
                      <option [value]="m.id">{{ m.firstName }} {{ m.lastName }}</option>
                    }
                  </select>
                </div>
              }
            </div>
          </div>

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
export class CreateRuedaDialogComponent implements OnChanges {
  @Input() show = false;
  @Input() groupId = '';
  @Output() closed = new EventEmitter<void>();
  @Output() saved = new EventEmitter<void>();

  private readonly service = inject(RuedasService);
  readonly membersService = inject(MembersService);
  private readonly fb = inject(FormBuilder);

  saving = signal(false);
  suggested = signal<number | null>(null);

  slots: { position: number; memberId: string }[] = Array.from({ length: 15 }, (_, i) => ({
    position: i + 1,
    memberId: '',
  }));

  months = Array.from({ length: 12 }, (_, i) => ({ value: i + 1, label: String(i + 1) }));

  form: FormGroup<CreateRuedaFormGroup> = this.fb.nonNullable.group({
    type: ['new' as 'new' | 'continua', Validators.required],
    loanAmount: [0, [Validators.required, Validators.min(1)]],
    interestRate: [5, [Validators.required, Validators.min(0)]],
    contributionAmount: [0, [Validators.required, Validators.min(1)]],
    roundingUnit: [0 as 0 | 500 | 1000, Validators.required],
    startMonth: [new Date().getMonth() + 1, Validators.required],
    startYear: [new Date().getFullYear(), [Validators.required, Validators.min(2000)]],
  });

  ngOnChanges(): void {
    if (this.show) {
      this.suggested.set(null);
      this.slots = Array.from({ length: 15 }, (_, i) => ({ position: i + 1, memberId: '' }));
      this.form.reset({
        type: 'new',
        loanAmount: 0,
        interestRate: 5,
        contributionAmount: 0,
        roundingUnit: 0,
        startMonth: new Date().getMonth() + 1,
        startYear: new Date().getFullYear(),
      });
    }
  }

  getSuggestion(): void {
    this.service.suggestLoanAmount(this.groupId).subscribe({
      next: res => this.suggested.set(res.suggested),
    });
  }

  useSuggestion(): void {
    if (this.suggested()) {
      this.form.controls.loanAmount.setValue(this.suggested()!);
    }
  }

  save(): void {
    if (this.form.invalid) return;
    const raw = this.form.getRawValue();
    const filteredSlots = this.slots.filter(s => s.memberId).map(s => ({ position: s.position, memberId: s.memberId }));
    this.saving.set(true);
    this.service.create(this.groupId, { ...raw, slots: filteredSlots }).subscribe({
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
