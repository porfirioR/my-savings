import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { MembersService } from '../../services/members.service';
import { MemberReplacementsService } from '../../../member-replacements/services/member-replacements.service';
import { ContributionsService } from '../../../contributions/services/contributions.service';
import { AccumulatedContributionBreakdownItem } from '../../../contributions/models/contribution.model';
import { RuedasService } from '../../../ruedas/services/ruedas.service';
import { RemainingLoanBalance } from '../../../ruedas/models/rueda.model';
import { ExitMemberFormGroup, ReplacementFormGroup } from '../../../../core/forms';
import { ToastService } from '../../../../core/services/toast.service';
import { backendErrorToastKey } from '../../../../core/services/backend-error.util';
import { LocaleNumberPipe } from '../../../../core/pipes/locale-number.pipe';

@Component({
  selector: 'app-member-exit-page',
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule, TranslateModule, LocaleNumberPipe, RouterLink],
  template: `
    <div>
      <a [routerLink]="['..', '..']" class="inline-flex items-center gap-1.5 text-sm text-base-content/60 hover:text-base-content transition-colors mb-3">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
        </svg>
        {{ 'NAV.MEMBERS' | translate }}
      </a>
      <h2 class="text-2xl font-bold tracking-tight mb-1">{{ 'MEMBERS.EXIT' | translate }} &mdash; {{ memberName() }}</h2>
      <p class="text-sm text-base-content/50 mb-6">{{ 'MEMBERS.EXIT_SUBTITLE' | translate }}</p>

      <div class="card bg-base-200 border border-base-300 p-4 mb-5">
          <form [formGroup]="form">
            <p class="text-xs font-semibold uppercase text-base-content/40 mb-2">{{ 'MEMBERS.CONTRIBUTIONS_SECTION' | translate }}</p>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
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
                <div class="flex gap-2">
                  <input type="number" class="input input-bordered w-full" formControlName="leftYear"
                    [class.input-error]="form.controls.leftYear.invalid && form.controls.leftYear.touched" />
                  <button type="button" class="btn btn-outline whitespace-nowrap" [disabled]="searchingContributions()" (click)="searchAccumulated()">
                    @if (searchingContributions()) { <span class="loading loading-spinner loading-xs"></span> }
                    {{ 'MEMBERS.SEARCH_CONTRIBUTIONS' | translate }}
                  </button>
                </div>
                @if (form.controls.leftYear.invalid && form.controls.leftYear.touched) {
                  <span class="text-error text-xs mt-1">{{ 'VALIDATION.YEAR_INVALID' | translate }}</span>
                }
              </fieldset>
            </div>

            @if (breakdown()) {
              <div class="flex justify-center mb-3">
                <button type="button" class="btn btn-ghost btn-xs gap-1" (click)="showBreakdown.set(!showBreakdown())">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                  </svg>
                  {{ (showBreakdown() ? 'MEMBERS.HIDE_DETAILS' : 'MEMBERS.SHOW_DETAILS') | translate }}
                </button>
              </div>
            }

            @if (breakdown() && showBreakdown()) {
              <div class="mb-4 overflow-x-auto">
                <table class="table table-xs w-full">
                  <tbody>
                    @for (item of breakdown(); track item.columnId) {
                      <tr>
                        <td>{{ item.label }}</td>
                        <td class="text-right font-mono">{{ item.amount | localeNumber }} Gs</td>
                      </tr>
                    }
                    <tr class="font-semibold border-t border-base-300">
                      <td>{{ 'APP.TOTAL' | translate }}</td>
                      <td class="text-right font-mono">{{ breakdownTotal() | localeNumber }} Gs</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            }

            <fieldset class="fieldset sm:w-1/2">
              <legend class="fieldset-legend">{{ 'MEMBERS.ACCUMULATED_CONTRIBUTIONS' | translate }} <span class="text-error">*</span></legend>
              <input type="number" class="input input-bordered w-full" formControlName="accumulatedContributions"
                [class.input-error]="form.controls.accumulatedContributions.invalid && form.controls.accumulatedContributions.touched" />
              @if (form.controls.accumulatedContributions.invalid && form.controls.accumulatedContributions.touched) {
                <span class="text-error text-xs mt-1">{{ 'VALIDATION.REQUIRED' | translate }}</span>
              }
            </fieldset>

            <div class="divider my-4"></div>

            <p class="text-xs font-semibold uppercase text-base-content/40 mb-2">{{ 'MEMBERS.LOAN_SECTION' | translate }}</p>
            <fieldset class="fieldset sm:w-1/2">
              <legend class="fieldset-legend">{{ 'MEMBERS.REMAINING_LOAN_BALANCE' | translate }} <span class="text-error">*</span></legend>
              <div class="flex gap-2">
                <input type="number" class="input input-bordered w-full" formControlName="remainingLoanBalance"
                  [class.input-error]="form.controls.remainingLoanBalance.invalid && form.controls.remainingLoanBalance.touched" />
                <button type="button" class="btn btn-outline whitespace-nowrap" [disabled]="searchingLoanBalance()" (click)="searchRemainingLoanBalance()">
                  @if (searchingLoanBalance()) { <span class="loading loading-spinner loading-xs"></span> }
                  {{ 'MEMBERS.SEARCH_LOAN_BALANCE' | translate }}
                </button>
              </div>
              @if (form.controls.remainingLoanBalance.invalid && form.controls.remainingLoanBalance.touched) {
                <span class="text-error text-xs mt-1">{{ 'VALIDATION.REQUIRED' | translate }}</span>
              }
            </fieldset>

            @if (loanBalanceDetail()) {
              <div class="flex justify-center mt-3">
                <button type="button" class="btn btn-ghost btn-xs gap-1" (click)="showLoanDetail.set(!showLoanDetail())">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                  </svg>
                  {{ (showLoanDetail() ? 'MEMBERS.HIDE_DETAILS' : 'MEMBERS.SHOW_DETAILS') | translate }}
                </button>
              </div>
            }

            @if (loanBalanceDetail(); as detail) {
              @if (showLoanDetail()) {
                <div class="mt-3 overflow-x-auto">
                  @if (paidInstallmentRows().length === 0) {
                    <p class="text-xs text-base-content/50">{{ 'MEMBERS.LOAN_NONE_PAID' | translate }}</p>
                  } @else {
                    <table class="table table-xs w-full">
                      <tbody>
                        @for (row of paidInstallmentRows(); track row.installmentNumber) {
                          <tr>
                            <td>{{ 'MONTHS.' + row.month | translate }} {{ row.year }} &mdash; {{ 'MEMBERS.LOAN_INSTALLMENT_LABEL' | translate }} {{ row.installmentNumber }}/{{ detail.totalInstallments }}</td>
                            <td class="text-right font-mono">{{ row.amount | localeNumber }} Gs</td>
                          </tr>
                        }
                        <tr class="font-semibold border-t border-base-300">
                          <td>{{ 'APP.TOTAL' | translate }}</td>
                          <td class="text-right font-mono">{{ (detail.paidInstallments * detail.installmentAmount) | localeNumber }} Gs</td>
                        </tr>
                      </tbody>
                    </table>
                  }
                </div>
              }
            }
          </form>
        </div>

        <div class="card bg-base-200 border border-base-300 p-4 mb-5">
          <label class="label cursor-pointer justify-start gap-3 mb-2">
            <input type="checkbox" class="checkbox checkbox-sm checkbox-primary" [(ngModel)]="replaceEnabled" [ngModelOptions]="{ standalone: true }" (ngModelChange)="onReplaceToggle($event)" />
            <span class="label-text font-medium">{{ 'MEMBERS.REPLACE_TOGGLE' | translate }}</span>
          </label>

          @if (replaceEnabled) {
            <p class="text-xs text-base-content/50 mb-3">{{ 'MEMBERS.REPLACE_HINT' | translate }}</p>
            <form [formGroup]="replacementForm">
              <p class="text-xs font-semibold uppercase text-base-content/40 mb-2">{{ 'MEMBERS.OUTGOING_SECTION' | translate }}</p>
              <fieldset class="fieldset mb-4 sm:w-1/2">
                <legend class="fieldset-legend">{{ 'MEMBERS.OUTGOING_MONTHLY_AMOUNT' | translate }}</legend>
                <div class="relative">
                  <div class="input input-bordered w-full flex items-center bg-base-200 text-base-content/70">
                    {{ replacementForm.controls.outgoingMonthlyAmount.value | localeNumber }}
                  </div>
                  @if (outgoingAmountLoading()) {
                    <span class="loading loading-spinner loading-xs absolute right-3 top-1/2 -translate-y-1/2"></span>
                  }
                </div>
                <p class="text-xs text-base-content/40 mt-1">{{ 'MEMBERS.OUTGOING_MONTHLY_AMOUNT_HINT' | translate }}</p>
              </fieldset>

              <p class="text-xs font-semibold uppercase text-base-content/40 mb-2">{{ 'MEMBERS.INCOMING_SECTION' | translate }}</p>
              <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
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
                <fieldset class="fieldset">
                  <legend class="fieldset-legend">{{ 'MEMBERS.PHONE' | translate }}</legend>
                  <input type="text" class="input input-bordered w-full" formControlName="incomingPhone" />
                </fieldset>
              </div>
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
                <p class="text-xs font-medium text-success mb-3">{{ 'MEMBERS.INCOMING_MONTHLY_PREVIEW' | translate:{ amount: (incomingMonthlyPreview() | localeNumber) } }}</p>
              }
            </form>
          }
        </div>

      @if (errorMsg()) {
        <div class="alert alert-error mb-5">
          <span>{{ errorMsg()! | translate }}</span>
        </div>
      }

      <div class="flex justify-end gap-2">
        <a [routerLink]="['..', '..']" class="btn btn-ghost">{{ 'APP.CANCEL' | translate }}</a>
        <button class="btn btn-primary" [disabled]="form.invalid || (replaceEnabled && replacementForm.invalid) || saving()" (click)="processExit()">
          @if (saving()) { <span class="loading loading-spinner loading-xs"></span> }
          {{ 'APP.CONFIRM' | translate }}
        </button>
      </div>
    </div>
  `,
})
export class MemberExitPageComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly service = inject(MembersService);
  private readonly replacementsService = inject(MemberReplacementsService);
  private readonly contributionsService = inject(ContributionsService);
  private readonly ruedasService = inject(RuedasService);
  private readonly fb = inject(FormBuilder);
  private readonly toast = inject(ToastService);

  groupId = '';
  memberId = '';

  saving = signal(false);
  errorMsg = signal<string | null>(null);
  outgoingAmountLoading = signal(false);
  searchingContributions = signal(false);
  breakdown = signal<AccumulatedContributionBreakdownItem[] | null>(null);
  showBreakdown = signal(false);
  searchingLoanBalance = signal(false);
  loanBalanceDetail = signal<RemainingLoanBalance | null>(null);
  showLoanDetail = signal(false);
  replaceEnabled = true;
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

  memberName(): string {
    const m = this.service.members().find((m) => m.id === this.memberId);
    return m ? `${m.firstName} ${m.lastName}` : '';
  }

  breakdownTotal(): number {
    return (this.breakdown() ?? []).reduce((sum, item) => sum + item.amount, 0);
  }

  ngOnInit(): void {
    this.groupId = this.route.snapshot.parent?.paramMap.get('groupId') ?? '';
    this.memberId = this.route.snapshot.paramMap.get('memberId') ?? '';
    if (this.service.members().length === 0) {
      this.service.loadByGroup(this.groupId);
    }
    this.onReplaceToggle(this.replaceEnabled);
  }

  searchAccumulated(): void {
    if (this.form.controls.leftMonth.invalid || this.form.controls.leftYear.invalid) return;
    const { leftMonth, leftYear } = this.form.getRawValue();
    this.searchingContributions.set(true);
    this.contributionsService.getAccumulated(this.groupId, this.memberId, leftMonth, leftYear).subscribe({
      next: (result) => {
        this.searchingContributions.set(false);
        this.form.controls.accumulatedContributions.setValue(result.total);
        this.breakdown.set(result.breakdown);
        this.showBreakdown.set(false);
      },
      error: (err) => {
        this.searchingContributions.set(false);
        this.errorMsg.set(backendErrorToastKey(err, 'MEMBERS.SEARCH_CONTRIBUTIONS_ERROR'));
      },
    });
  }

  searchRemainingLoanBalance(): void {
    if (this.form.controls.leftMonth.invalid || this.form.controls.leftYear.invalid) return;
    const { leftMonth, leftYear } = this.form.getRawValue();
    this.searchingLoanBalance.set(true);
    this.ruedasService.getRemainingLoanBalance(this.groupId, this.memberId, leftMonth, leftYear).subscribe({
      next: (result) => {
        this.searchingLoanBalance.set(false);
        this.form.controls.remainingLoanBalance.setValue(result.remainingBalance);
        this.loanBalanceDetail.set(result);
        this.showLoanDetail.set(false);
      },
      error: (err) => {
        this.searchingLoanBalance.set(false);
        this.errorMsg.set(backendErrorToastKey(err, 'MEMBERS.SEARCH_LOAN_BALANCE_ERROR'));
      },
    });
  }

  paidInstallmentRows(): { month: number; year: number; installmentNumber: number; amount: number }[] {
    const detail = this.loanBalanceDetail();
    if (!detail || !detail.startMonth || !detail.startYear || detail.paidInstallments <= 0) return [];

    const rows: { month: number; year: number; installmentNumber: number; amount: number }[] = [];
    for (let i = 0; i < detail.paidInstallments; i++) {
      const offset = (detail.startMonth - 1) + i;
      rows.push({
        month: (offset % 12) + 1,
        year: detail.startYear + Math.floor(offset / 12),
        installmentNumber: i + 1,
        amount: detail.installmentAmount,
      });
    }
    return rows;
  }

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
          this.toast.success('TOAST.MEMBER_REPLACEMENT_CREATED');
          this.goBack();
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
          this.toast.success('TOAST.MEMBER_EXITED');
          this.goBack();
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

  private goBack(): void {
    this.router.navigate(['/groups', this.groupId, 'members']);
  }
}
