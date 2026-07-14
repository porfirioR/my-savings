import { Component, EventEmitter, inject, Input, OnChanges, Output, signal } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { ContributionsService } from '../../services/contributions.service';
import { ToastService } from '../../../../core/services/toast.service';
import { backendErrorToastKey } from '../../../../core/services/backend-error.util';

interface EditContributionFormGroup {
  amount: FormControl<number>;
  description: FormControl<string>;
}

@Component({
  selector: 'app-edit-contribution-dialog',
  standalone: true,
  imports: [ReactiveFormsModule, TranslateModule],
  template: `
    @if (show) {
      <div class="modal modal-open">
        <div class="modal-box">
          <h3 class="font-bold text-lg mb-1">{{ 'CONTRIBUTIONS.EDIT_CONTRIBUTION' | translate }}</h3>
          <p class="text-sm text-base-content/50 mb-4">{{ memberName }} &mdash; {{ periodName }}</p>
          <form [formGroup]="form">
            <fieldset class="fieldset mb-3">
              <legend class="fieldset-legend">{{ 'CONTRIBUTIONS.AMOUNT' | translate }} (Gs) <span class="text-error">*</span></legend>
              <input type="number" class="input input-bordered w-full" formControlName="amount"
                [class.input-error]="form.controls.amount.invalid && form.controls.amount.touched" />
              @if (form.controls.amount.invalid && form.controls.amount.touched) {
                <span class="text-error text-xs mt-1">{{ 'VALIDATION.AMOUNT_GT_ZERO' | translate }}</span>
              }
            </fieldset>
            <fieldset class="fieldset mb-4">
              <legend class="fieldset-legend">{{ 'CONTRIBUTIONS.DESCRIPTION' | translate }}</legend>
              <input type="text" class="input input-bordered w-full" formControlName="description"
                [placeholder]="'CONTRIBUTIONS.DESCRIPTION_PLACEHOLDER' | translate" />
            </fieldset>
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
export class EditContributionDialogComponent implements OnChanges {
  @Input() show = false;
  @Input() groupId = '';
  @Input() memberId = '';
  @Input() memberName = '';
  @Input() periodId = '';
  @Input() periodName = '';
  @Input() currentAmount = 0;
  @Output() closed = new EventEmitter<void>();
  @Output() saved = new EventEmitter<void>();

  private readonly service = inject(ContributionsService);
  private readonly fb = inject(FormBuilder);
  private readonly toast = inject(ToastService);

  saving = signal(false);

  form: FormGroup<EditContributionFormGroup> = this.fb.nonNullable.group({
    amount: [0, [Validators.required, Validators.min(0)]],
    description: [''],
  });

  ngOnChanges(): void {
    if (this.show) {
      this.form.reset({ amount: this.currentAmount, description: '' });
    }
  }

  save(): void {
    if (this.form.invalid) return;
    this.saving.set(true);
    const raw = this.form.getRawValue();
    this.service.upsertManualContribution(this.groupId, {
      memberId: this.memberId,
      contributionPeriodId: this.periodId,
      amount: raw.amount,
      ...(raw.description ? { description: raw.description } : {}),
    }).subscribe({
      next: () => {
        this.saving.set(false);
        this.saved.emit();
        this.toast.success('TOAST.CONTRIBUTION_SAVED');
      },
      error: (err) => {
        this.saving.set(false);
        this.toast.error(backendErrorToastKey(err, 'TOAST.CONTRIBUTION_SAVE_ERROR'));
      },
    });
  }

  onCancel(): void {
    this.closed.emit();
  }
}
