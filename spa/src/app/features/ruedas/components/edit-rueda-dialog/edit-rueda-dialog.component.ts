import { Component, EventEmitter, inject, Input, OnChanges, Output, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { RuedasService } from '../../services/ruedas.service';
import { MembersService } from '../../../members/services/members.service';
import { Rueda, RuedaSlot } from '../../models/rueda.model';
import { UpdateRuedaFormGroup } from '../../../../core/forms';

interface SlotRow {
  position: number;
  memberId: string | null;
  memberName: string;
  loanAmount: number;
  previousLoanAmount: number | null;
}

@Component({
  selector: 'app-edit-rueda-dialog',
  standalone: true,
  imports: [ReactiveFormsModule, TranslateModule, DecimalPipe],
  template: `
    @if (show) {
      <div class="modal modal-open">
        <div class="modal-box w-11/12 max-w-3xl max-h-[90vh] overflow-y-auto">
          <h3 class="font-bold text-lg mb-1">{{ 'RUEDAS.EDIT' | translate }}</h3>
          <p class="text-sm text-base-content/50 mb-4">
            {{ 'RUEDAS.EDIT_SUBTITLE' | translate }} &mdash; {{ 'RUEDAS.NUMBER' | translate }} {{ rueda?.ruedaNumber }}
          </p>

          @if (loading()) {
            <div class="flex justify-center py-8">
              <span class="loading loading-spinner loading-md text-primary"></span>
            </div>
          } @else {
            <form [formGroup]="form">
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">

                <!-- Type -->
                <fieldset class="fieldset">
                  <legend class="fieldset-legend">{{ 'RUEDAS.TYPE' | translate }} <span class="text-error">*</span></legend>
                  <select class="select select-bordered w-full" formControlName="type">
                    <option value="new">{{ 'RUEDAS.TYPE_NEW' | translate }}</option>
                    <option value="continua">{{ 'RUEDAS.TYPE_CONTINUA' | translate }}</option>
                  </select>
                </fieldset>

                <!-- Slot amount mode -->
                <fieldset class="fieldset">
                  <legend class="fieldset-legend">{{ 'RUEDAS.SLOT_MODE_CONSTANT' | translate }} / {{ 'RUEDAS.SLOT_MODE_VARIABLE' | translate }}</legend>
                  <select class="select select-bordered w-full" formControlName="slotAmountMode">
                    <option value="constant">{{ 'RUEDAS.SLOT_MODE_CONSTANT' | translate }}</option>
                    <option value="variable">{{ 'RUEDAS.SLOT_MODE_VARIABLE' | translate }}</option>
                  </select>
                </fieldset>

                <!-- Loan amount -->
                <fieldset class="fieldset">
                  <legend class="fieldset-legend">{{ 'RUEDAS.LOAN_AMOUNT' | translate }} (Gs) <span class="text-error">*</span></legend>
                  <input type="number" class="input input-bordered w-full" formControlName="loanAmount"
                    [class.input-error]="form.controls.loanAmount.invalid && form.controls.loanAmount.touched" />
                  @if (form.controls.loanAmount.invalid && form.controls.loanAmount.touched) {
                    <span class="text-error text-xs mt-1">{{ 'VALIDATION.AMOUNT_GT_ZERO' | translate }}</span>
                  }
                </fieldset>

                <!-- Interest rate -->
                <fieldset class="fieldset">
                  <legend class="fieldset-legend">{{ 'RUEDAS.INTEREST_RATE' | translate }} (%) <span class="text-error">*</span></legend>
                  <input type="number" class="input input-bordered w-full" formControlName="interestRate"
                    [class.input-error]="form.controls.interestRate.invalid && form.controls.interestRate.touched" />
                  @if (form.controls.interestRate.invalid && form.controls.interestRate.touched) {
                    <span class="text-error text-xs mt-1">{{ 'VALIDATION.REQUIRED' | translate }}</span>
                  }
                </fieldset>

                <!-- Contribution -->
                <fieldset class="fieldset">
                  <legend class="fieldset-legend">{{ 'RUEDAS.CONTRIBUTION' | translate }} (Gs) <span class="text-error">*</span></legend>
                  <input type="number" class="input input-bordered w-full" formControlName="contributionAmount"
                    [class.input-error]="form.controls.contributionAmount.invalid && form.controls.contributionAmount.touched" />
                  @if (form.controls.contributionAmount.invalid && form.controls.contributionAmount.touched) {
                    <span class="text-error text-xs mt-1">{{ 'VALIDATION.AMOUNT_GT_ZERO' | translate }}</span>
                  }
                </fieldset>

                <!-- Rounding -->
                <fieldset class="fieldset">
                  <legend class="fieldset-legend">{{ 'RUEDAS.ROUNDING' | translate }}</legend>
                  <select class="select select-bordered w-full" formControlName="roundingUnit">
                    <option [ngValue]="0">{{ 'RUEDAS.ROUNDING_NONE' | translate }}</option>
                    <option [ngValue]="500">500 Gs</option>
                    <option [ngValue]="1000">1.000 Gs</option>
                  </select>
                </fieldset>

                <!-- Start month/year -->
                <fieldset class="fieldset">
                  <legend class="fieldset-legend">{{ 'RUEDAS.START_MONTH_YEAR' | translate }} <span class="text-error">*</span></legend>
                  <div class="join w-full">
                    <select class="select select-bordered join-item flex-1" formControlName="startMonth">
                      @for (m of months; track m) {
                        <option [ngValue]="m">{{ 'MONTHS.' + m | translate }}</option>
                      }
                    </select>
                    <input type="number" class="input input-bordered join-item w-24" formControlName="startYear"
                      [class.input-error]="form.controls.startYear.invalid && form.controls.startYear.touched" />
                  </div>
                </fieldset>

                <!-- Notes -->
                <fieldset class="fieldset sm:col-span-2">
                  <legend class="fieldset-legend">{{ 'RUEDAS.NOTES' | translate }}</legend>
                  <textarea class="textarea textarea-bordered w-full" formControlName="notes" rows="2"></textarea>
                </fieldset>

              </div>
            </form>

            <!-- Slots table -->
            @if (slots().length > 0) {
              <div class="mt-5">
                <h4 class="font-semibold text-sm mb-2">{{ 'RUEDAS.SLOTS' | translate }}</h4>
                <div class="overflow-x-auto">
                  <table class="table table-xs w-full">
                    <thead>
                      <tr>
                        <th class="w-10">#</th>
                        <th>{{ 'MEMBERS.TITLE' | translate }}</th>
                        <th class="text-right">{{ 'RUEDAS.LOAN_AMOUNT' | translate }}</th>
                        <th class="text-right w-44">{{ 'RUEDAS.PREV_LOAN_AMOUNT' | translate }}</th>
                      </tr>
                    </thead>
                    <tbody>
                      @for (row of slots(); track row.position) {
                        <tr>
                          <td class="text-base-content/50">{{ row.position }}</td>
                          <td>{{ row.memberName || '—' }}</td>
                          <td class="text-right">{{ row.loanAmount | number:'1.0-0' }}</td>
                          <td>
                            <input type="number" class="input input-bordered input-xs w-full text-right"
                              [value]="row.previousLoanAmount ?? ''"
                              (change)="onPrevLoanChange(row.position, $event)" />
                          </td>
                        </tr>
                      }
                    </tbody>
                  </table>
                </div>
                <p class="text-xs text-base-content/40 mt-1">{{ 'RUEDAS.PREV_AMOUNTS_HINT' | translate }}</p>
              </div>
            }
          }

          <div class="divider my-3"></div>
          <div class="modal-action mt-0">
            <button class="btn btn-ghost" (click)="onCancel()">{{ 'APP.CANCEL' | translate }}</button>
            <button class="btn btn-primary" [disabled]="form.invalid || saving() || loading()" (click)="save()">
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
  readonly membersService = inject(MembersService);
  private readonly fb = inject(FormBuilder);

  saving = signal(false);
  loading = signal(false);
  slots = signal<SlotRow[]>([]);

  months = Array.from({ length: 12 }, (_, i) => i + 1);

  form: FormGroup<UpdateRuedaFormGroup> = this.fb.nonNullable.group({
    type: ['new' as 'new' | 'continua', Validators.required],
    loanAmount: [0, [Validators.required, Validators.min(1)]],
    interestRate: [5, [Validators.required, Validators.min(0)]],
    contributionAmount: [0, [Validators.required, Validators.min(1)]],
    roundingUnit: [0 as 0 | 500 | 1000, Validators.required],
    startMonth: [new Date().getMonth() + 1, Validators.required],
    startYear: [new Date().getFullYear(), [Validators.required, Validators.min(2000)]],
    slotAmountMode: ['constant' as 'constant' | 'variable', Validators.required],
    notes: [''],
  });

  ngOnChanges(): void {
    if (this.show && this.rueda) {
      this.loadFullRueda(this.rueda.id);
    }
  }

  private loadFullRueda(ruedaId: string): void {
    this.loading.set(true);
    this.service.getById(this.groupId, ruedaId).subscribe({
      next: (full) => {
        this.form.reset({
          type: full.type,
          loanAmount: full.loanAmount,
          interestRate: full.interestRate,
          contributionAmount: full.contributionAmount,
          roundingUnit: (full.roundingUnit as 0 | 500 | 1000),
          startMonth: full.startMonth,
          startYear: full.startYear,
          slotAmountMode: full.slotAmountMode,
          notes: full.notes ?? '',
        });

        const members = this.membersService.members();
        this.slots.set(
          (full.slots ?? []).map(s => ({
            position: s.position,
            memberId: s.memberId,
            memberName: this.resolveMemberName(s, members),
            loanAmount: s.loanAmount,
            previousLoanAmount: s.previousLoanAmount ?? null,
          }))
        );

        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  private resolveMemberName(slot: RuedaSlot, members: { id: string; firstName: string; lastName: string }[]): string {
    if (slot.memberName) return slot.memberName;
    const m = members.find(m => m.id === slot.memberId);
    return m ? `${m.firstName} ${m.lastName}` : '';
  }

  onPrevLoanChange(position: number, event: Event): void {
    const input = event.target as HTMLInputElement;
    const value = input.value === '' ? null : Number(input.value);
    this.slots.update(rows => rows.map(r =>
      r.position === position ? { ...r, previousLoanAmount: value } : r
    ));
  }

  save(): void {
    if (this.form.invalid || !this.rueda) return;
    const raw = this.form.getRawValue();
    const slotsPayload = this.slots().map(s => ({
      position: s.position,
      previousLoanAmount: s.previousLoanAmount,
    }));

    this.saving.set(true);
    this.service.update(this.groupId, this.rueda.id, {
      ...raw,
      slots: slotsPayload,
    }).subscribe({
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
