import { Component, EventEmitter, inject, Input, OnChanges, Output, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { MembersService } from '../../services/members.service';
import { MemberReplacementsService } from '../../../member-replacements/services/member-replacements.service';
import { ExitMemberFormGroup, ReplacementFormGroup } from '../../../../core/forms';
import { ToastService } from '../../../../core/services/toast.service';
import { backendErrorToastKey } from '../../../../core/services/backend-error.util';

@Component({
  selector: 'app-exit-member-dialog',
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule, TranslateModule, DecimalPipe],
  template: `
    @if (show) {
      <div class="modal modal-open">
        <div class="modal-box max-w-lg">
          <h3 class="font-bold text-lg mb-1">{{ 'MEMBERS.EXIT' | translate }}</h3>
          <p class="text-sm text-base-content/50 mb-4">{{ 'MEMBERS.EXIT_SUBTITLE' | translate }}</p>
          <form [formGroup]="form">
            <div class="grid grid-cols-2 gap-3 mb-3">
              <fieldset class="fieldset">
                <legend class="fieldset-legend">{{ 'MEMBERS.LEFT' | translate }} {{ 'PAYMENTS.MONTH' | translate }} <span class="text-error">*</span></legend>
                <select class="select select-bordered w-full" formControlName="leftMonth">
                  @for (m of months; track m) {
                    <option [ngValue]="m">{{ 'MONTHS.' + m | translate }}</option>
                  }
                </select>
              </fieldset>
              <fieldset class="fieldset">
                <legend class="fieldset-legend">{{ 'PAYMENTS.YEAR' | translate }} <span class="text-error">*</span></legend>
                <input type="number" class="input input-bordered w-full" formControlName="leftYear"
                  [class.input-error]="form.controls.leftYear.invalid && form.controls.leftYear.touched" />
                @if (form.controls.leftYear.invalid && form.controls.leftYear.touched) {
                  <span class="text-error text-xs mt-1">{{ 'VALIDATION.YEAR_INVALID' | translate }}</span>
                }
              </fieldset>
            </div>
            <fieldset class="fieldset mb-3">
              <legend class="fieldset-legend">{{ 'MEMBERS.ACCUMULATED_CONTRIBUTIONS' | translate }} <span class="text-error">*</span></legend>
              <input type="number" class="input input-bordered w-full" formControlName="accumulatedContributions"
                [class.input-error]="form.controls.accumulatedContributions.invalid && form.controls.accumulatedContributions.touched" />
              @if (form.controls.accumulatedContributions.invalid && form.controls.accumulatedContributions.touched) {
                <span class="text-error text-xs mt-1">{{ 'VALIDATION.REQUIRED' | translate }}</span>
              }
            </fieldset>
            <fieldset class="fieldset mb-4">
              <legend class="fieldset-legend">{{ 'MEMBERS.REMAINING_LOAN_BALANCE' | translate }} <span class="text-error">*</span></legend>
              <input type="number" class="input input-bordered w-full" formControlName="remainingLoanBalance"
                [class.input-error]="form.controls.remainingLoanBalance.invalid && form.controls.remainingLoanBalance.touched" />
              @if (form.controls.remainingLoanBalance.invalid && form.controls.remainingLoanBalance.touched) {
                <span class="text-error text-xs mt-1">{{ 'VALIDATION.REQUIRED' | translate }}</span>
              }
            </fieldset>
          </form>

          <div class="divider my-2"></div>

          <label class="label cursor-pointer justify-start gap-3 mb-2">
            <input type="checkbox" class="checkbox checkbox-sm checkbox-primary" [(ngModel)]="replaceEnabled" [ngModelOptions]="{ standalone: true }" (ngModelChange)="onReplaceToggle($event)" />
            <span class="label-text font-medium">{{ 'MEMBERS.REPLACE_TOGGLE' | translate }}</span>
          </label>

          @if (replaceEnabled) {
            <p class="text-xs text-base-content/50 mb-3">{{ 'MEMBERS.REPLACE_HINT' | translate }}</p>
            <form [formGroup]="replacementForm">
              <p class="text-xs font-semibold uppercase text-base-content/40 mb-2">{{ 'MEMBERS.OUTGOING_SECTION' | translate }}</p>
              <fieldset class="fieldset mb-4">
                <legend class="fieldset-legend">{{ 'MEMBERS.OUTGOING_MONTHLY_AMOUNT' | translate }}</legend>
                <div class="relative">
                  <div class="input input-bordered w-full flex items-center bg-base-200 text-base-content/70">
                    {{ replacementForm.controls.outgoingMonthlyAmount.value | number:'1.0-0' }}
                  </div>
                  @if (outgoingAmountLoading()) {
                    <span class="loading loading-spinner loading-xs absolute right-3 top-1/2 -translate-y-1/2"></span>
                  }
                </div>
                <p class="text-xs text-base-content/40 mt-1">{{ 'MEMBERS.OUTGOING_MONTHLY_AMOUNT_HINT' | translate }}</p>
              </fieldset>

              <p class="text-xs font-semibold uppercase text-base-content/40 mb-2">{{ 'MEMBERS.INCOMING_SECTION' | translate }}</p>
              <div class="grid grid-cols-2 gap-3 mb-3">
                <fieldset class="fieldset">
                  <legend class="fieldset-legend">{{ 'MEMBERS.FIRST_NAME' | translate }} <span class="text-error">*</span></legend>
                  <input type="text" class="input input-bordered w-full" formControlName="incomingFirstName"
                    [class.input-error]="replacementForm.controls.incomingFirstName.invalid && replacementForm.controls.incomingFirstName.touched" />
                </fieldset>
                <fieldset class="fieldset">
                  <legend class="fieldset-legend">{{ 'MEMBERS.LAST_NAME' | translate }} <span class="text-error">*</span></legend>
                  <input type="text" class="input input-bordered w-full" formControlName="incomingLastName"
                    [class.input-error]="replacementForm.controls.incomingLastName.invalid && replacementForm.controls.incomingLastName.touched" />
                </fieldset>
              </div>
              <fieldset class="fieldset mb-3">
                <legend class="fieldset-legend">{{ 'MEMBERS.PHONE' | translate }}</legend>
                <input type="text" class="input input-bordered w-full" formControlName="incomingPhone" />
              </fieldset>
              <div class="grid grid-cols-2 gap-3 mb-1">
                <fieldset class="fieldset">
                  <legend class="fieldset-legend">{{ 'MEMBERS.INCOMING_TOTAL_AMOUNT' | translate }} <span class="text-error">*</span></legend>
                  <input type="number" class="input input-bordered w-full" formControlName="incomingTotalAmount"
                    [class.input-error]="replacementForm.controls.incomingTotalAmount.invalid && replacementForm.controls.incomingTotalAmount.touched" />
                </fieldset>
                <fieldset class="fieldset">
                  <legend class="fieldset-legend">{{ 'MEMBERS.INCOMING_INSTALLMENTS' | translate }} <span class="text-error">*</span></legend>
                  <input type="number" class="input input-bordered w-full" formControlName="incomingInstallments"
                    [class.input-error]="replacementForm.controls.incomingInstallments.invalid && replacementForm.controls.incomingInstallments.touched" />
                </fieldset>
              </div>
              <p class="text-xs text-base-content/40 mb-1">{{ 'MEMBERS.INCOMING_INSTALLMENTS_HINT' | translate }}</p>
              @if (incomingMonthlyPreview() > 0) {
                <p class="text-xs font-medium text-success mb-3">{{ 'MEMBERS.INCOMING_MONTHLY_PREVIEW' | translate:{ amount: (incomingMonthlyPreview() | number:'1.0-0') } }}</p>
              }
            </form>
          }

          @if (errorMsg()) {
            <div class="alert alert-error mb-3">
              <span>{{ errorMsg()! | translate }}</span>
            </div>
          }
          <div class="divider my-2"></div>
          <div class="modal-action mt-0">
            <button class="btn btn-ghost" (click)="onClose()">{{ 'APP.CLOSE' | translate }}</button>
            <button class="btn btn-warning" [disabled]="form.invalid || (replaceEnabled && replacementForm.invalid) || saving()" (click)="processExit()">
              @if (saving()) { <span class="loading loading-spinner loading-xs"></span> }
              {{ 'APP.CONFIRM' | translate }}
            </button>
          </div>
        </div>
        <div class="modal-backdrop" (click)="onClose()"></div>
      </div>
    }
  `,
})
export class ExitMemberDialogComponent implements OnChanges {
  @Input() show = false;
  @Input() groupId = '';
  @Input() memberId = '';
  @Output() closed = new EventEmitter<void>();
  @Output() saved = new EventEmitter<void>();

  private readonly service = inject(MembersService);
  private readonly replacementsService = inject(MemberReplacementsService);
  private readonly fb = inject(FormBuilder);
  private readonly toast = inject(ToastService);

  saving = signal(false);
  errorMsg = signal<string | null>(null);
  outgoingAmountLoading = signal(false);
  replaceEnabled = false;
  months = Array.from({ length: 12 }, (_, i) => i + 1);

  form: FormGroup<ExitMemberFormGroup> = this.fb.nonNullable.group({
    leftMonth: [new Date().getMonth() + 1, Validators.required],
    leftYear: [new Date().getFullYear(), [Validators.required, Validators.min(2000)]],
    accumulatedContributions: [0, [Validators.required, Validators.min(0)]],
    remainingLoanBalance: [0, [Validators.required, Validators.min(0)]],
  });

  replacementForm: FormGroup<ReplacementFormGroup> = this.fb.nonNullable.group({
    incomingFirstName: ['', Validators.required],
    incomingLastName: ['', Validators.required],
    incomingPhone: [''],
    outgoingMonthlyAmount: [{ value: 0, disabled: true }],
    incomingTotalAmount: [0, [Validators.required, Validators.min(0)]],
    incomingInstallments: [1, [Validators.required, Validators.min(1)]],
  });

  incomingMonthlyPreview(): number {
    const { incomingTotalAmount, incomingInstallments } = this.replacementForm.getRawValue();
    return incomingInstallments > 0 ? Math.round(incomingTotalAmount / incomingInstallments) : 0;
  }

  onReplaceToggle(enabled: boolean): void {
    if (!enabled) return;
    this.outgoingAmountLoading.set(true);
    this.replacementsService.previewOutgoingAmount(this.groupId, this.memberId).subscribe({
      next: ({ outgoingMonthlyAmount }) => {
        this.outgoingAmountLoading.set(false);
        this.replacementForm.controls.outgoingMonthlyAmount.setValue(outgoingMonthlyAmount);
      },
      error: (err) => {
        this.outgoingAmountLoading.set(false);
        this.errorMsg.set(this.resolveErrorKey(err));
      },
    });
  }

  ngOnChanges(): void {
    if (this.show) {
      this.errorMsg.set(null);
      this.replaceEnabled = false;
      this.form.reset({
        leftMonth: new Date().getMonth() + 1,
        leftYear: new Date().getFullYear(),
        accumulatedContributions: 0,
        remainingLoanBalance: 0,
      });
      this.replacementForm.reset({
        incomingFirstName: '',
        incomingLastName: '',
        incomingPhone: '',
        outgoingMonthlyAmount: 0,
        incomingTotalAmount: 0,
        incomingInstallments: 1,
      });
    }
  }

  processExit(): void {
    if (this.form.invalid || (this.replaceEnabled && this.replacementForm.invalid)) return;
    this.errorMsg.set(null);
    this.saving.set(true);

    if (this.replaceEnabled) {
      const exit = this.form.getRawValue();
      const replacement = this.replacementForm.getRawValue();
      this.replacementsService.create(this.groupId, { outgoingMemberId: this.memberId, ...exit, ...replacement }).subscribe({
        next: () => {
          this.saving.set(false);
          this.saved.emit();
          this.toast.success('TOAST.MEMBER_REPLACEMENT_CREATED');
          this.onClose();
        },
        error: (err) => {
          this.saving.set(false);
          this.errorMsg.set(this.resolveErrorKey(err));
        },
      });
    } else {
      this.service.exit(this.groupId, this.memberId, this.form.getRawValue()).subscribe({
        next: () => {
          this.saving.set(false);
          this.saved.emit();
          this.toast.success('TOAST.MEMBER_EXITED');
          this.onClose();
        },
        error: (err) => {
          this.saving.set(false);
          this.errorMsg.set(this.resolveErrorKey(err));
        },
      });
    }
  }

  private resolveErrorKey(err: any): string {
    const msg = err?.error?.message;
    if (msg === 'ACTIVE_PARALLEL_LOANS') return 'MEMBERS.EXIT_ACTIVE_LOANS_ERROR';
    if (msg === 'NO_ACTIVE_SLOT') return 'MEMBERS.REPLACE_NO_ACTIVE_SLOT_ERROR';
    return 'MEMBERS.EXIT_ERROR';
  }

  onClose(): void {
    this.closed.emit();
  }
}
