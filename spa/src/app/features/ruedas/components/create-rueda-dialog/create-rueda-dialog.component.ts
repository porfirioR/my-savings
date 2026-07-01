import { Component, computed, EventEmitter, inject, Input, OnChanges, OnDestroy, Output, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { Subject, merge } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { RuedasService } from '../../services/ruedas.service';
import { MembersService } from '../../../members/services/members.service';
import { CashBoxService } from '../../../cash-box/services/cash-box.service';
import { RuedaSimulatorComponent } from '../rueda-simulator/rueda-simulator.component';
import { CreateRuedaFormGroup } from '../../../../core/forms';

@Component({
  selector: 'app-create-rueda-dialog',
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule, TranslateModule, DecimalPipe, RuedaSimulatorComponent],
  template: `
    @if (show) {
      <div class="modal modal-open">
        <div class="modal-box w-11/12 max-w-4xl max-h-[90vh] overflow-y-auto">
          <h3 class="font-bold text-lg mb-1">{{ 'RUEDAS.NEW' | translate }}</h3>
          <p class="text-sm text-base-content/50 mb-4">{{ 'RUEDAS.NEW_SUBTITLE' | translate }}</p>

          <form [formGroup]="form">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">

            <!-- 1. Tipo -->
            <fieldset class="fieldset">
              <legend class="fieldset-legend">{{ 'RUEDAS.TYPE' | translate }} <span class="text-error">*</span></legend>
              <select class="select select-bordered w-full" formControlName="type">
                <option value="new">{{ 'RUEDAS.TYPE_NEW' | translate }}</option>
                <option value="continua">{{ 'RUEDAS.TYPE_CONTINUA' | translate }}</option>
              </select>
            </fieldset>

            <!-- 2. Mes / Año inicio -->
            <fieldset class="fieldset">
              <legend class="fieldset-legend">
                {{ 'RUEDAS.START_MONTH_YEAR' | translate }} <span class="text-error">*</span>
                @if (prevRuedaLocked()) { <span class="badge badge-xs badge-neutral ml-1">auto</span> }
              </legend>
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

            <!-- Rueda anterior (solo si continua) -->
            @if (form.controls.type.value === 'continua') {
              <fieldset class="fieldset sm:col-span-2">
                <legend class="fieldset-legend">{{ 'RUEDAS.PREVIOUS_RUEDA' | translate }} <span class="text-error">*</span></legend>
                <select class="select select-bordered w-full" formControlName="previousRuedaId"
                  [class.select-error]="form.controls.previousRuedaId.invalid && form.controls.previousRuedaId.touched">
                  <option value="">{{ 'RUEDAS.PREVIOUS_RUEDA_NONE' | translate }}</option>
                  @for (r of service.ruedas(); track r.id) {
                    @if (r.status === 'completed') {
                      <option [value]="r.id">
                        {{ 'RUEDAS.NUMBER' | translate }} {{ r.ruedaNumber }}
                        — {{ 'MONTHS.' + r.startMonth | translate }} {{ r.startYear }}
                        @if (ruedaEndDates().get(r.id); as end) {
                          — {{ 'MONTHS.' + end.month | translate }} {{ end.year }}
                        }
                      </option>
                    }
                  }
                </select>
                @if (form.controls.previousRuedaId.invalid && form.controls.previousRuedaId.touched) {
                  <span class="text-error text-xs mt-1">{{ 'VALIDATION.REQUIRED' | translate }}</span>
                }
                @if (loadingPrevRueda()) {
                  <span class="text-xs text-base-content/50 mt-1 flex items-center gap-1">
                    <span class="loading loading-spinner loading-xs"></span> Cargando datos de la rueda anterior...
                  </span>
                }
              </fieldset>
            }

            <!-- 3. Aporte mensual -->
            <fieldset class="fieldset">
              <legend class="fieldset-legend">{{ 'RUEDAS.CONTRIBUTION' | translate }} (Gs) <span class="text-error">*</span></legend>
              <input type="number" class="input input-bordered w-full" formControlName="contributionAmount"
                [class.input-error]="form.controls.contributionAmount.invalid && form.controls.contributionAmount.touched" />
              @if (form.controls.contributionAmount.invalid && form.controls.contributionAmount.touched) {
                <span class="text-error text-xs mt-1">{{ 'VALIDATION.AMOUNT_GT_ZERO' | translate }}</span>
              }
            </fieldset>

            <!-- 4. Tasa de interés -->
            <fieldset class="fieldset">
              <legend class="fieldset-legend">{{ 'RUEDAS.INTEREST_RATE' | translate }} (%) <span class="text-error">*</span></legend>
              <input type="number" class="input input-bordered w-full" formControlName="interestRate"
                [class.input-error]="form.controls.interestRate.invalid && form.controls.interestRate.touched" />
              @if (form.controls.interestRate.invalid && form.controls.interestRate.touched) {
                <span class="text-error text-xs mt-1">{{ 'VALIDATION.REQUIRED' | translate }}</span>
              }
            </fieldset>

            <!-- 5. Redondeo -->
            <fieldset class="fieldset">
              <legend class="fieldset-legend">{{ 'RUEDAS.ROUNDING' | translate }}</legend>
              <select class="select select-bordered w-full" formControlName="roundingUnit">
                <option [ngValue]="0">{{ 'RUEDAS.ROUNDING_NONE' | translate }}</option>
                <option [ngValue]="500">500 Gs</option>
                <option [ngValue]="1000">1.000 Gs</option>
              </select>
            </fieldset>

            <!-- 6. Monto préstamo — al final, con botón calcular -->
            <fieldset class="fieldset sm:col-span-2">
              <legend class="fieldset-legend">
                {{ 'RUEDAS.LOAN_AMOUNT' | translate }} (Gs) <span class="text-error">*</span>
                @if (suggested()) {
                  <span class="text-info cursor-pointer ml-2 font-normal" (click)="useSuggestion()">
                    {{ 'RUEDAS.SUGGESTION' | translate }}: {{ suggested() | number:'1.0-0' }} Gs
                  </span>
                }
              </legend>
              <div class="join w-full">
                <input type="number" class="input input-bordered join-item flex-1" formControlName="loanAmount"
                  [class.input-error]="form.controls.loanAmount.invalid && form.controls.loanAmount.touched" />
                <button type="button" class="btn join-item btn-outline"
                  [disabled]="!form.controls.contributionAmount.value || memberCount === 0"
                  (click)="getSuggestion()">
                  {{ 'RUEDAS.CALCULATE' | translate }}
                </button>
              </div>
              @if (form.controls.loanAmount.invalid && form.controls.loanAmount.touched) {
                <span class="text-error text-xs mt-1">{{ 'VALIDATION.AMOUNT_GT_ZERO' | translate }}</span>
              }
              @if (prevRuedaLocked()) {
                <div class="mt-2 space-y-2">
                  <div class="flex flex-wrap gap-x-4 gap-y-1 text-xs text-base-content/50">
                    <span>Caja actual: <span class="font-semibold" [class.text-success]="cashBoxService.balance().balance >= 0" [class.text-error]="cashBoxService.balance().balance < 0">{{ cashBoxService.balance().balance | number:'1.0-0' }} Gs</span></span>
                    <span>Cuotas ant.: <span class="font-semibold text-warning">{{ sumPrevLoanAmounts | number:'1.0-0' }} Gs</span></span>
                    <span>{{ memberCount }} × {{ (form.controls.contributionAmount.value ?? 0) | number:'1.0-0' }} Gs aporte</span>
                  </div>
                  <p class="text-xs text-base-content/40 italic">Expandí "Ver flujo detallado" para simular el saldo mes a mes.</p>

                  <app-rueda-simulator
                    [previousRuedaInstallment]="sumPrevLoanAmounts / (previousRuedaMemberCount || 1)"
                    [previousRuedaMembers]="previousRuedaMembers"
                    [newLoanAmount]="form.controls.loanAmount.value ?? 0"
                    [newInterestRate]="form.controls.interestRate.value ?? 0"
                    [newContributionAmount]="form.controls.contributionAmount.value ?? 0"
                    [newRoundingUnit]="form.controls.roundingUnit.value ?? 0"
                    [newMemberCount]="memberCount"
                    [startMonth]="form.controls.startMonth.value ?? 1"
                    [startYear]="form.controls.startYear.value ?? 2026"
                    [initialCashBalance]="cashBoxService.balance().balance">
                  </app-rueda-simulator>
                </div>
              } @else {
                <p class="text-xs text-base-content/40 mt-1">
                  {{ memberCount }} miembros × {{ (form.controls.contributionAmount.value ?? 0) | number:'1.0-0' }} Gs aporte
                </p>
              }
            </fieldset>

          </div>
          </form>

          <!-- Slot assignment -->
          <div class="mt-5">
            <div class="flex items-center gap-3 mb-2 flex-wrap">
              <h4 class="font-semibold text-sm">{{ 'RUEDAS.SLOTS' | translate }}</h4>

              @if (!prevRuedaLocked()) {
                <!-- Member count selector -->
                <div class="flex items-center gap-1">
                  <input type="number" class="input input-bordered input-xs w-16 text-center"
                    [(ngModel)]="memberCount"
                    [min]="1" [max]="maxMemberCount"
                    (change)="onMemberCountChange()" />
                  <span class="text-xs text-base-content/40">/ {{ maxMemberCount }}</span>
                </div>

                <!-- Mode buttons -->
                <div class="join ml-auto">
                  <button type="button" class="btn btn-xs join-item"
                    [class.btn-primary]="form.controls.slotAmountMode.value === 'constant'"
                    [class.btn-outline]="form.controls.slotAmountMode.value !== 'constant'"
                    (click)="setSlotMode('constant')">
                    {{ 'RUEDAS.SLOT_MODE_CONSTANT' | translate }}
                  </button>
                  <button type="button" class="btn btn-xs join-item"
                    [class.btn-primary]="form.controls.slotAmountMode.value === 'variable'"
                    [class.btn-outline]="form.controls.slotAmountMode.value !== 'variable'"
                    (click)="setSlotMode('variable')">
                    {{ 'RUEDAS.SLOT_MODE_VARIABLE' | translate }}
                  </button>
                </div>
              } @else {
                <span class="badge badge-neutral badge-sm ml-auto">{{ memberCount }} turnos (rueda anterior)</span>
              }
            </div>

            <!-- Mode hint -->
            <p class="text-xs text-base-content/50 mb-2">
              @if (form.controls.slotAmountMode.value === 'constant') {
                {{ 'RUEDAS.SLOT_MODE_CONSTANT_HINT' | translate }}
              } @else {
                {{ 'RUEDAS.SLOT_MODE_VARIABLE_HINT' | translate }}
              }
            </p>

            <div class="grid gap-2 max-h-56 overflow-y-auto pr-1"
              [class.grid-cols-3]="form.controls.slotAmountMode.value === 'constant' && !prevRuedaLocked()"
              [class.grid-cols-1]="form.controls.slotAmountMode.value === 'variable' || prevRuedaLocked()">
              @for (slot of slots; track slot.position) {
                <div class="flex items-center gap-2 bg-base-200 rounded-lg p-2">
                  <span class="badge badge-xs badge-outline shrink-0">{{ slot.position }}</span>
                  @if (prevRuedaLocked()) {
                    <span class="text-sm flex-1">{{ getMemberName(slot.memberId) }}</span>
                  } @else {
                    <select class="select select-bordered select-xs flex-1 min-w-0" [(ngModel)]="slot.memberId">
                      <option value="">-</option>
                      @for (m of sortedActiveMembers; track m.id) {
                        <option [value]="m.id">{{ m.position }}. {{ m.firstName }} {{ m.lastName }}</option>
                      }
                    </select>
                    @if (form.controls.slotAmountMode.value === 'variable') {
                      <input type="number" class="input input-bordered input-xs w-36"
                        [(ngModel)]="slot.loanAmount"
                        [placeholder]="'RUEDAS.LOAN_AMOUNT' | translate" />
                    }
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
                @if (!prevRuedaLocked()) {
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
                } @else {
                  <span class="badge badge-warning badge-sm">auto</span>
                }
              </div>
              <p class="text-xs text-base-content/50 mb-2">{{ 'RUEDAS.PREV_AMOUNTS_HINT' | translate }}</p>

              @if (prevRuedaLocked()) {
                <div class="grid gap-1 max-h-40 overflow-y-auto pr-1">
                  @for (slot of slots; track slot.position) {
                    <div class="flex items-center gap-2 bg-base-200 rounded-lg px-2 py-1">
                      <span class="badge badge-xs badge-warning shrink-0">{{ slot.position }}</span>
                      <span class="text-xs flex-1">{{ getMemberName(slot.memberId) }}</span>
                      <span class="text-sm font-semibold text-warning">{{ slot.previousLoanAmount | number:'1.0-0' }} Gs</span>
                    </div>
                  }
                </div>
              } @else if (prevAmountMode === 'constant') {
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
export class CreateRuedaDialogComponent implements OnChanges, OnDestroy {
  @Input() show = false;
  @Input() groupId = '';
  @Output() closed = new EventEmitter<void>();
  @Output() saved = new EventEmitter<void>();

  readonly service = inject(RuedasService);
  readonly membersService = inject(MembersService);
  readonly cashBoxService = inject(CashBoxService);
  private readonly fb = inject(FormBuilder);

  saving = signal(false);
  suggested = signal<number | null>(null);
  loadingPrevRueda = signal(false);
  prevRuedaLocked = signal(false);

  /** Map of ruedaId → calculated end date (final junta month) */
  ruedaEndDates = computed(() => {
    const map = new Map<string, { month: number; year: number }>();
    for (const r of this.service.ruedas()) {
      if (r.status !== 'completed') continue;
      if (r.endMonth && r.endYear) {
        map.set(r.id, { month: r.endMonth, year: r.endYear });
      } else if (r.slotCount) {
        const offset = r.startMonth - 1 + r.slotCount;
        map.set(r.id, { month: (offset % 12) + 1, year: r.startYear + Math.floor(offset / 12) });
      }
    }
    return map;
  });

  slots: { position: number; memberId: string; loanAmount: number; previousLoanAmount: number }[] = [];
  memberCount = 0;

  prevAmountMode: 'constant' | 'variable' = 'constant';
  constantPrevAmount = 0;

  months = Array.from({ length: 12 }, (_, i) => ({ value: i + 1 }));

  private readonly destroy$ = new Subject<void>();

  form: FormGroup<CreateRuedaFormGroup> = this.fb.nonNullable.group({
    type: ['new' as 'new' | 'continua', Validators.required],
    loanAmount: [0, [Validators.required, Validators.min(1)]],
    interestRate: [10, [Validators.required, Validators.min(0)]],
    contributionAmount: [0, [Validators.required, Validators.min(0)]],
    roundingUnit: [500 as 0 | 500 | 1000, Validators.required],
    startMonth: [new Date().getMonth() + 1, Validators.required],
    startYear: [new Date().getFullYear(), [Validators.required, Validators.min(2000)]],
    slotAmountMode: ['constant' as 'constant' | 'variable', Validators.required],
    previousRuedaId: [''],
  });

  get maxMemberCount(): number {
    return this.membersService.members().filter(m => m.isActive).length;
  }

  get sumPrevLoanAmounts(): number {
    return this.slots.reduce((s, slot) => s + (slot.previousLoanAmount ?? 0), 0);
  }

  get previousRuedaMemberCount(): number {
    return this.slots.length;
  }

  get previousRuedaMembers(): Array<{ memberId: string; installmentAmount: number }> {
    return this.slots.map(s => ({
      memberId: s.memberId,
      installmentAmount: s.previousLoanAmount ?? 0,
    }));
  }

  ngOnChanges(): void {
    if (this.show) {
      this.suggested.set(null);
      this.prevAmountMode = 'constant';
      this.constantPrevAmount = 0;
      this.memberCount = this.maxMemberCount;
      this.buildSlots();
      this.form.reset({
        type: 'new',
        loanAmount: 0,
        interestRate: 10,
        contributionAmount: 0,
        roundingUnit: 500,
        startMonth: new Date().getMonth() + 1,
        startYear: new Date().getFullYear(),
        slotAmountMode: 'constant',
        previousRuedaId: '',
      });
      this.setupReactiveRecalculation();
    } else {
      this.destroy$.next();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private addMonths(month: number, year: number, n: number): { month: number; year: number } {
    const total = (year * 12 + month - 1) + n;
    return { month: (total % 12) + 1, year: Math.floor(total / 12) };
  }

  private onPreviousRuedaSelected(ruedaId: string): void {
    this.loadingPrevRueda.set(true);
    this.cashBoxService.loadBalance(this.groupId);
    this.service.getById(this.groupId, ruedaId).subscribe({
      next: (prev) => {
        const prevSlots = (prev.slots ?? []).sort((a, b) => a.position - b.position);

        // Auto-fill start date: last slot + 1 month (new rueda opens the same month as the previous rueda's final junta)
        const last = prevSlots[prevSlots.length - 1];
        if (last) {
          const { month, year } = this.addMonths(last.loanMonth, last.loanYear, 1);
          this.form.controls.startMonth.setValue(month, { emitEvent: false });
          this.form.controls.startYear.setValue(year, { emitEvent: false });
        }

        // Lock date and mode controls
        this.form.controls.startMonth.disable();
        this.form.controls.startYear.disable();
        this.form.controls.slotAmountMode.setValue('constant', { emitEvent: false });
        this.form.controls.slotAmountMode.disable();

        // Copy slots from previous rueda with auto-filled previousLoanAmount
        this.memberCount = prevSlots.length;
        this.slots = prevSlots.map(s => ({
          position: s.position,
          memberId: s.memberId ?? '',
          loanAmount: 0,
          previousLoanAmount: s.installmentAmount,
        }));

        // Apply constant prev amount mode (all filled individually but same)
        this.prevAmountMode = 'variable';
        this.prevRuedaLocked.set(true);
        this.loadingPrevRueda.set(false);
      },
      error: () => this.loadingPrevRueda.set(false),
    });
  }

  private onPreviousRuedaCleared(): void {
    this.form.controls.startMonth.enable();
    this.form.controls.startYear.enable();
    this.form.controls.slotAmountMode.enable();
    this.form.controls.startMonth.setValue(new Date().getMonth() + 1, { emitEvent: false });
    this.form.controls.startYear.setValue(new Date().getFullYear(), { emitEvent: false });
    this.prevRuedaLocked.set(false);
    this.memberCount = this.maxMemberCount;
    this.buildSlots();
  }

  private setupReactiveRecalculation(): void {
    this.destroy$.next(); // cancel any previous subscriptions

    // Contribution changes → update suggested loan amount + recalculate
    this.form.controls.contributionAmount.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(contribution => {
        if (this.form.controls.slotAmountMode.value === 'variable') {
          const base = this.memberCount * (contribution ?? 0);
          if (base > 0) {
            this.form.controls.loanAmount.setValue(base, { emitEvent: false });
            this.recalculateVariableAmounts();
          }
        }
      });

    // Interest rate or rounding changes → recalculate slot amounts
    merge(
      this.form.controls.interestRate.valueChanges,
      this.form.controls.roundingUnit.valueChanges,
    )
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        if (this.form.controls.slotAmountMode.value === 'variable') {
          this.recalculateVariableAmounts();
        }
      });

    // Type changes → update previousRuedaId validator
    this.form.controls.type.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(type => {
        const prevControl = this.form.controls.previousRuedaId;
        if (type === 'continua') {
          prevControl.setValidators([Validators.required]);
        } else {
          prevControl.setValidators([]);
        }
        prevControl.updateValueAndValidity({ emitEvent: false });
      });

    // Previous rueda selection → auto-fill date/slots (only for continua type)
    this.form.controls.previousRuedaId.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(ruedaId => {
        if (ruedaId) {
          this.onPreviousRuedaSelected(ruedaId);
        } else {
          this.onPreviousRuedaCleared();
        }
      });
  }

  get sortedActiveMembers() {
    return this.membersService.members()
      .filter(m => m.isActive)
      .sort((a, b) => a.position - b.position);
  }

  private buildSlots(): void {
    const active = this.sortedActiveMembers.slice(0, this.memberCount);
    this.slots = Array.from({ length: this.memberCount }, (_, i) => ({
      position: i + 1,
      memberId: active[i]?.id ?? '',
      loanAmount: 0,
      previousLoanAmount: 0,
    }));
  }

  onMemberCountChange(): void {
    this.memberCount = Math.max(1, Math.min(this.memberCount, this.maxMemberCount));
    this.buildSlots();

    if (this.form.controls.slotAmountMode.value === 'variable') {
      const contribution = this.form.controls.contributionAmount.value ?? 0;
      if (contribution > 0) {
        this.form.controls.loanAmount.setValue(this.memberCount * contribution, { emitEvent: false });
      }
      this.recalculateVariableAmounts();
    }
  }

  setSlotMode(mode: 'constant' | 'variable'): void {
    this.form.controls.slotAmountMode.setValue(mode);
    if (mode === 'variable') {
      const contribution = this.form.controls.contributionAmount.value ?? 0;
      if (contribution > 0 && this.memberCount > 0) {
        const base = this.memberCount * contribution;
        this.form.controls.loanAmount.setValue(base, { emitEvent: false });
      }
      this.recalculateVariableAmounts();
    } else {
      this.slots.forEach(s => s.loanAmount = 0);
    }
  }

  recalculateVariableAmounts(): void {
    const { interestRate, roundingUnit, contributionAmount } = this.form.getRawValue();
    const N = this.slots.length;
    if (N === 0) return;

    const rate = 1 + (interestRate / 100);
    const C = contributionAmount ?? 0;
    const ceil = (n: number, unit: number) =>
      unit === 0 ? Math.ceil(n) : Math.ceil(n / unit) * unit;

    let accumulated = 0;
    this.slots.forEach((slot, index) => {
      const remainingContributors = N - index;
      slot.loanAmount = remainingContributors * C + accumulated;
      accumulated += ceil(slot.loanAmount * rate / N, roundingUnit);
    });
  }

  getSuggestion(): void {
    if (this.memberCount <= 0) return;

    if (this.prevRuedaLocked()) {
      const suggestion = this.computeContinuaSuggestion();
      this.suggested.set(suggestion > 0 ? suggestion : null);
      return;
    }

    const contribution = this.form.controls.contributionAmount.value ?? 0;
    if (contribution <= 0) return;
    this.suggested.set(this.memberCount * contribution);
  }

  private computeContinuaSuggestion(): number {
    const B0 = this.cashBoxService.balance().balance;
    const sumPrev = this.sumPrevLoanAmounts;
    const C = this.form.controls.contributionAmount.value ?? 0;
    const N = this.memberCount;
    return Math.max(0, B0 + sumPrev + N * C);
  }

  useSuggestion(): void {
    const val = this.suggested();
    if (!val) return;
    this.form.controls.loanAmount.setValue(val);
    this.suggested.set(null);
    if (this.form.controls.slotAmountMode.value === 'variable') {
      this.recalculateVariableAmounts();
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
