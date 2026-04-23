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
          <p class="text-sm text-base-content/50 mb-4">{{ 'RUEDAS.NEW_SUBTITLE' | translate }}</p>

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

            @if (form.controls.type.value === 'continua') {
              <fieldset class="fieldset sm:col-span-2">
                <legend class="fieldset-legend">{{ 'RUEDAS.PREVIOUS_RUEDA' | translate }}</legend>
                <select class="select select-bordered w-full" formControlName="previousRuedaId">
                  <option value="">{{ 'RUEDAS.PREVIOUS_RUEDA_NONE' | translate }}</option>
                  @for (r of service.ruedas(); track r.id) {
                    @if (r.status === 'completed') {
                      <option [value]="r.id">
                        {{ 'RUEDAS.NUMBER' | translate }} {{ r.ruedaNumber }}
                        — {{ 'MONTHS.' + r.startMonth | translate }} {{ r.startYear }}
                      </option>
                    }
                  }
                </select>
              </fieldset>
            }

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
          </div>
          </form>

          <!-- Slot assignment -->
          <div class="mt-5">
            <div class="flex items-center justify-between mb-2">
              <h4 class="font-semibold text-sm">{{ 'RUEDAS.SLOTS' | translate }}</h4>
              <div class="join">
                <button type="button" class="btn btn-xs join-item"
                  [class.btn-primary]="form.controls.slotAmountMode.value === 'constant'"
                  [class.btn-outline]="form.controls.slotAmountMode.value !== 'constant'"
                  (click)="form.controls.slotAmountMode.setValue('constant')">
                  {{ 'RUEDAS.SLOT_MODE_CONSTANT' | translate }}
                </button>
                <button type="button" class="btn btn-xs join-item"
                  [class.btn-primary]="form.controls.slotAmountMode.value === 'variable'"
                  [class.btn-outline]="form.controls.slotAmountMode.value !== 'variable'"
                  (click)="form.controls.slotAmountMode.setValue('variable')">
                  {{ 'RUEDAS.SLOT_MODE_VARIABLE' | translate }}
                </button>
              </div>
            </div>
            <div class="grid gap-2 max-h-56 overflow-y-auto pr-1"
              [class.grid-cols-3]="form.controls.slotAmountMode.value === 'constant'"
              [class.grid-cols-1]="form.controls.slotAmountMode.value === 'variable'">
              @for (slot of slots; track slot.position) {
                <div class="flex items-center gap-2 bg-base-200 rounded-lg p-2">
                  <span class="badge badge-xs badge-outline shrink-0">{{ slot.position }}</span>
                  <select class="select select-bordered select-xs flex-1 min-w-0" [(ngModel)]="slot.memberId">
                    <option value="">-</option>
                    @for (m of membersService.members(); track m.id) {
                      <option [value]="m.id">{{ m.firstName }} {{ m.lastName }}</option>
                    }
                  </select>
                  @if (form.controls.slotAmountMode.value === 'variable') {
                    <input type="number" class="input input-bordered input-xs w-32"
                      [(ngModel)]="slot.loanAmount"
                      [placeholder]="'RUEDAS.LOAN_AMOUNT' | translate" />
                  }
                </div>
              }
            </div>
          </div>

          <!-- Previous rueda amounts (continua only) -->
          @if (form.controls.type.value === 'continua') {
            <div class="mt-4">
              <div class="flex items-center justify-between mb-2">
                <h4 class="font-semibold text-sm">{{ 'RUEDAS.PREV_AMOUNTS_TITLE' | translate }}</h4>
                <div class="join">
                  <button type="button" class="btn btn-xs join-item"
                    [class.btn-warning]="prevAmountMode === 'constant'"
                    [class.btn-outline]="prevAmountMode !== 'constant'"
                    (click)="setPrevAmountMode('constant')">
                    {{ 'RUEDAS.SLOT_MODE_CONSTANT' | translate }}
                  </button>
                  <button type="button" class="btn btn-xs join-item"
                    [class.btn-warning]="prevAmountMode === 'variable'"
                    [class.btn-outline]="prevAmountMode !== 'variable'"
                    (click)="setPrevAmountMode('variable')">
                    {{ 'RUEDAS.SLOT_MODE_VARIABLE' | translate }}
                  </button>
                </div>
              </div>
              <p class="text-xs text-base-content/50 mb-2">{{ 'RUEDAS.PREV_AMOUNTS_HINT' | translate }}</p>
              @if (prevAmountMode === 'constant') {
                <input type="number" class="input input-bordered input-sm w-full"
                  [(ngModel)]="constantPrevAmount"
                  (input)="applyConstantPrevAmount()"
                  [placeholder]="'RUEDAS.PREV_LOAN_AMOUNT' | translate" />
              } @else {
                <div class="grid gap-1 max-h-40 overflow-y-auto pr-1">
                  @for (slot of slots; track slot.position) {
                    <div class="flex items-center gap-2 bg-base-200 rounded-lg px-2 py-1">
                      <span class="badge badge-xs badge-warning shrink-0">{{ slot.position }}</span>
                      <span class="text-xs flex-1">{{ getMemberName(slot.memberId) }}</span>
                      <input type="number" class="input input-bordered input-xs w-32"
                        [(ngModel)]="slot.previousLoanAmount"
                        [placeholder]="'RUEDAS.PREV_LOAN_AMOUNT' | translate" />
                    </div>
                  }
                </div>
              }
            </div>
          }

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

  readonly service = inject(RuedasService);
  readonly membersService = inject(MembersService);
  private readonly fb = inject(FormBuilder);

  saving = signal(false);
  suggested = signal<number | null>(null);

  slots: { position: number; memberId: string; loanAmount: number; previousLoanAmount: number }[] = Array.from(
    { length: 15 },
    (_, i) => ({ position: i + 1, memberId: '', loanAmount: 0, previousLoanAmount: 0 }),
  );

  prevAmountMode: 'constant' | 'variable' = 'constant';
  constantPrevAmount = 0;

  months = Array.from({ length: 12 }, (_, i) => ({ value: i + 1 }));

  form: FormGroup<CreateRuedaFormGroup> = this.fb.nonNullable.group({
    type: ['new' as 'new' | 'continua', Validators.required],
    loanAmount: [0, [Validators.required, Validators.min(1)]],
    interestRate: [5, [Validators.required, Validators.min(0)]],
    contributionAmount: [0, [Validators.required, Validators.min(1)]],
    roundingUnit: [0 as 0 | 500 | 1000, Validators.required],
    startMonth: [new Date().getMonth() + 1, Validators.required],
    startYear: [new Date().getFullYear(), [Validators.required, Validators.min(2000)]],
    slotAmountMode: ['constant' as 'constant' | 'variable', Validators.required],
    previousRuedaId: [''],
  });

  ngOnChanges(): void {
    if (this.show) {
      this.suggested.set(null);
      this.prevAmountMode = 'constant';
      this.constantPrevAmount = 0;
      this.slots = Array.from({ length: 15 }, (_, i) => ({
        position: i + 1,
        memberId: '',
        loanAmount: 0,
        previousLoanAmount: 0,
      }));
      this.form.reset({
        type: 'new',
        loanAmount: 0,
        interestRate: 5,
        contributionAmount: 0,
        roundingUnit: 0,
        startMonth: new Date().getMonth() + 1,
        startYear: new Date().getFullYear(),
        slotAmountMode: 'constant',
        previousRuedaId: '',
      });
    }
  }

  setPrevAmountMode(mode: 'constant' | 'variable'): void {
    this.prevAmountMode = mode;
    if (mode === 'constant') {
      this.applyConstantPrevAmount();
    }
  }

  applyConstantPrevAmount(): void {
    const amount = this.constantPrevAmount;
    this.slots.forEach(s => s.previousLoanAmount = amount);
  }

  getMemberName(memberId: string): string {
    if (!memberId) return '—';
    const m = this.membersService.members().find(m => m.id === memberId);
    return m ? `${m.firstName} ${m.lastName}` : '—';
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
    const isVariable = raw.slotAmountMode === 'variable';
    const isContinua = raw.type === 'continua';
    const filteredSlots = this.slots
      .filter(s => s.memberId)
      .map(s => ({
        position: s.position,
        memberId: s.memberId,
        ...(isVariable && s.loanAmount > 0 ? { loanAmount: s.loanAmount } : {}),
        ...(isContinua && s.previousLoanAmount > 0 ? { previousLoanAmount: s.previousLoanAmount } : {}),
      }));

    const { previousRuedaId, ...restRaw } = raw;
    const payload = {
      ...restRaw,
      slots: filteredSlots,
      ...(previousRuedaId ? { previousRuedaId } : {}),
    };

    this.saving.set(true);
    this.service.create(this.groupId, payload).subscribe({
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
