import { Component, EventEmitter, inject, Input, OnChanges, Output, signal } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { ContributionsService } from '../../services/contributions.service';
import { ToastService } from '../../../../core/services/toast.service';
import { backendErrorToastKey } from '../../../../core/services/backend-error.util';

interface AddPeriodFormGroup {
  name: FormControl<string>;
  monthlyContributionAmount: FormControl<number>;
  memberCount: FormControl<number | null>;
}

@Component({
  selector: 'app-add-period-dialog',
  standalone: true,
  imports: [ReactiveFormsModule, TranslateModule],
  template: `
    @if (show) {
      <div class="modal modal-open">
        <div class="modal-box">
          <h3 class="font-bold text-lg mb-1">{{ 'CONTRIBUTIONS.ADD_PERIOD' | translate }}</h3>
          <p class="text-sm text-base-content/50 mb-4">{{ 'CONTRIBUTIONS.ADD_PERIOD_SUBTITLE' | translate }}</p>
          <form [formGroup]="form">
            <fieldset class="fieldset mb-3">
              <legend class="fieldset-legend">{{ 'CONTRIBUTIONS.PERIOD_NAME' | translate }} <span class="text-error">*</span></legend>
              <input type="text" class="input input-bordered w-full" formControlName="name"
                [class.input-error]="form.controls.name.invalid && form.controls.name.touched" />
              @if (form.controls.name.invalid && form.controls.name.touched) {
                <span class="text-error text-xs mt-1">{{ 'VALIDATION.REQUIRED' | translate }}</span>
              }
            </fieldset>
            <div class="grid grid-cols-2 gap-3 mb-3">
              <fieldset class="fieldset">
                <legend class="fieldset-legend">{{ 'CONTRIBUTIONS.MONTHLY_AMOUNT' | translate }} (Gs) <span class="text-error">*</span></legend>
                <input type="number" class="input input-bordered w-full" formControlName="monthlyContributionAmount"
                  [class.input-error]="form.controls.monthlyContributionAmount.invalid && form.controls.monthlyContributionAmount.touched" />
                @if (form.controls.monthlyContributionAmount.invalid && form.controls.monthlyContributionAmount.touched) {
                  <span class="text-error text-xs mt-1">{{ 'VALIDATION.AMOUNT_GT_ZERO' | translate }}</span>
                }
              </fieldset>
              <fieldset class="fieldset">
                <legend class="fieldset-legend">{{ 'CONTRIBUTIONS.MEMBER_COUNT' | translate }}</legend>
                <input type="number" class="input input-bordered w-full" formControlName="memberCount" />
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
export class AddPeriodDialogComponent implements OnChanges {
  @Input() show = false;
  @Input() groupId = '';
  @Input() nextPosition = 1;
  @Output() closed = new EventEmitter<void>();
  @Output() saved = new EventEmitter<void>();

  private readonly service = inject(ContributionsService);
  private readonly fb = inject(FormBuilder);
  private readonly toast = inject(ToastService);

  saving = signal(false);

  form: FormGroup<AddPeriodFormGroup> = this.fb.nonNullable.group({
    name: ['', Validators.required],
    monthlyContributionAmount: [0, [Validators.required, Validators.min(0)]],
    memberCount: this.fb.control<number | null>(null),
  });

  ngOnChanges(): void {
    if (this.show) {
      this.form.reset({ name: '', monthlyContributionAmount: 0, memberCount: null });
    }
  }

  save(): void {
    if (this.form.invalid) return;
    this.saving.set(true);
    const raw = this.form.getRawValue();
    this.service.createPeriod(this.groupId, {
      name: raw.name,
      monthlyContributionAmount: raw.monthlyContributionAmount,
      position: this.nextPosition,
      ...(raw.memberCount !== null ? { memberCount: raw.memberCount } : {}),
    }).subscribe({
      next: () => {
        this.saving.set(false);
        this.saved.emit();
        this.toast.success('TOAST.CONTRIBUTION_PERIOD_CREATED');
      },
      error: (err) => {
        this.saving.set(false);
        this.toast.error(backendErrorToastKey(err, 'TOAST.CONTRIBUTION_PERIOD_CREATE_ERROR'));
      },
    });
  }

  onCancel(): void {
    this.closed.emit();
  }
}
