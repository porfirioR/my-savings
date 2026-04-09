import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { ParallelLoansService } from '../../services/parallel-loans.service';
import { MembersService } from '../../../members/services/members.service';
import { CreateParallelLoanRequest, ParallelLoan } from '../../models/parallel-loan.model';
import { DecimalPipe } from '@angular/common';

@Component({
  selector: 'app-parallel-loan-list',
  standalone: true,
  imports: [FormsModule, DecimalPipe, TranslateModule],
  template: `
    <div>
      <div class="flex items-center justify-between mb-2">
        <h2 class="text-2xl font-bold tracking-tight">{{ 'PARALLEL_LOANS.TITLE' | translate }}</h2>
        <button class="btn btn-primary btn-sm" (click)="openCreateModal()">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
          </svg>
          {{ 'PARALLEL_LOANS.NEW' | translate }}
        </button>
      </div>
      <div class="divider mt-0 mb-6"></div>

      @if (service.loading()) {
        <div class="flex justify-center py-16">
          <span class="loading loading-spinner loading-lg text-primary"></span>
        </div>
      } @else if (service.loans().length === 0) {
        <div class="text-center py-16 text-base-content/50 text-sm">
          {{ 'PARALLEL_LOANS.EMPTY' | translate }}
        </div>
      } @else {
        <div class="grid gap-4">
          @for (loan of service.loans(); track loan.id) {
            <div class="card bg-base-200 border border-base-300">
              <div class="card-body p-5">
                <!-- Header: name + status badge -->
                <div class="flex items-start justify-between mb-1">
                  <h3 class="font-bold text-base">{{ loan.memberName }}</h3>
                  <span class="badge badge-sm"
                    [class.badge-success]="loan.status === 'active'"
                    [class.badge-neutral]="loan.status === 'completed'">
                    {{ ('PARALLEL_LOANS.STATUS_' + loan.status.toUpperCase()) | translate }}
                  </span>
                </div>
                <p class="text-xs text-base-content/50 mb-3">
                  {{ 'PARALLEL_LOANS.START_DATE' | translate }}: {{ 'MONTHS.' + loan.startMonth | translate }} {{ loan.startYear }}
                </p>

                <!-- Financial details -->
                <div class="grid grid-cols-2 gap-3 mb-4">
                  <div class="bg-base-100 rounded-lg p-3">
                    <p class="text-xs text-base-content/50 mb-0.5">{{ 'PARALLEL_LOANS.AMOUNT' | translate }}</p>
                    <p class="font-semibold text-sm">{{ loan.amount | number:'1.0-0' }} Gs</p>
                  </div>
                  <div class="bg-base-100 rounded-lg p-3">
                    <p class="text-xs text-base-content/50 mb-0.5">{{ 'PARALLEL_LOANS.INSTALLMENT' | translate }}</p>
                    <p class="font-semibold text-sm">{{ loan.installmentAmount | number:'1.0-0' }} Gs</p>
                  </div>
                </div>

                <!-- Progress bar -->
                <div class="flex items-center gap-3">
                  <progress class="progress progress-primary flex-1"
                    [value]="loan.installmentsPaid"
                    [max]="loan.totalInstallments">
                  </progress>
                  <span class="text-xs text-base-content/60 shrink-0">{{ loan.installmentsPaid }}/{{ loan.totalInstallments }}</span>
                </div>

                @if (loan.status === 'active') {
                  <div class="card-actions justify-end mt-3">
                    <button class="btn btn-outline btn-sm" (click)="openPaymentsModal(loan)">
                      {{ 'PARALLEL_LOANS.PAYMENTS' | translate }}
                    </button>
                  </div>
                }
              </div>
            </div>
          }
        </div>
      }
    </div>

    <!-- Create Loan Modal -->
    @if (showCreateModal()) {
      <div class="modal modal-open">
        <div class="modal-box">
          <h3 class="font-bold text-lg mb-1">{{ 'PARALLEL_LOANS.NEW' | translate }}</h3>
          <p class="text-sm text-base-content/50 mb-4">Configura los datos del nuevo préstamo.</p>

          <form #loanForm="ngForm">
          <fieldset class="fieldset mb-3">
            <legend class="fieldset-legend">{{ 'PARALLEL_LOANS.MEMBER' | translate }} <span class="text-error">*</span></legend>
            <select class="select select-bordered w-full" name="memberId"
              [(ngModel)]="form.memberId" required #memberId="ngModel"
              [class.select-error]="memberId.invalid && memberId.touched">
              <option value="">-- Seleccionar --</option>
              @for (m of membersService.members(); track m.id) {
                @if (m.isActive) {
                  <option [value]="m.id">{{ m.firstName }} {{ m.lastName }}</option>
                }
              }
            </select>
            @if (memberId.invalid && memberId.touched) {
              <span class="text-error text-xs mt-1">Selecciona un miembro</span>
            }
          </fieldset>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
            <fieldset class="fieldset">
              <legend class="fieldset-legend">{{ 'PARALLEL_LOANS.AMOUNT' | translate }} (Gs) <span class="text-error">*</span></legend>
              <input type="number" class="input input-bordered w-full" name="amount"
                [(ngModel)]="form.amount" required min="1" #loanAmount="ngModel"
                [class.input-error]="loanAmount.invalid && loanAmount.touched" />
              @if (loanAmount.invalid && loanAmount.touched) {
                <span class="text-error text-xs mt-1">Monto requerido (mayor a 0)</span>
              }
            </fieldset>
            <fieldset class="fieldset">
              <legend class="fieldset-legend">{{ 'PARALLEL_LOANS.INTEREST' | translate }} (%) <span class="text-error">*</span></legend>
              <input type="number" class="input input-bordered w-full" name="interestRate"
                [(ngModel)]="form.interestRate" required min="0" step="0.5" #interestRate="ngModel"
                [class.input-error]="interestRate.invalid && interestRate.touched" />
              @if (interestRate.invalid && interestRate.touched) {
                <span class="text-error text-xs mt-1">Campo requerido</span>
              }
            </fieldset>
            <fieldset class="fieldset">
              <legend class="fieldset-legend">{{ 'PARALLEL_LOANS.TOTAL_INSTALLMENTS' | translate }} <span class="text-error">*</span></legend>
              <input type="number" class="input input-bordered w-full" name="totalInstallments"
                [(ngModel)]="form.totalInstallments" required min="1" #totalInstallments="ngModel"
                [class.input-error]="totalInstallments.invalid && totalInstallments.touched" />
              @if (totalInstallments.invalid && totalInstallments.touched) {
                <span class="text-error text-xs mt-1">Mínimo 1 cuota</span>
              }
            </fieldset>
            <fieldset class="fieldset">
              <legend class="fieldset-legend">{{ 'RUEDAS.ROUNDING' | translate }} (Gs) <span class="text-error">*</span></legend>
              <select class="select select-bordered w-full" name="roundingUnit"
                [(ngModel)]="form.roundingUnit" required>
                <option [ngValue]="500">500</option>
                <option [ngValue]="1000">1000</option>
              </select>
            </fieldset>
            <fieldset class="fieldset">
              <legend class="fieldset-legend">{{ 'PAYMENTS.MONTH' | translate }} inicio <span class="text-error">*</span></legend>
              <select class="select select-bordered w-full" name="startMonth"
                [(ngModel)]="form.startMonth" required>
                @for (m of months; track m.value) {
                  <option [ngValue]="m.value">{{ 'MONTHS.' + m.value | translate }}</option>
                }
              </select>
            </fieldset>
            <fieldset class="fieldset">
              <legend class="fieldset-legend">{{ 'PAYMENTS.YEAR' | translate }} <span class="text-error">*</span></legend>
              <input type="number" class="input input-bordered w-full" name="startYear"
                [(ngModel)]="form.startYear" required min="2000" #startYear="ngModel"
                [class.input-error]="startYear.invalid && startYear.touched" />
              @if (startYear.invalid && startYear.touched) {
                <span class="text-error text-xs mt-1">Año inválido</span>
              }
            </fieldset>
          </div>
          </form>

          <div class="divider my-2"></div>
          <div class="modal-action mt-0">
            <button class="btn btn-ghost" (click)="closeCreateModal()">{{ 'APP.CANCEL' | translate }}</button>
            <button class="btn btn-primary" [disabled]="loanForm.invalid || saving()" (click)="save()">
              @if (saving()) { <span class="loading loading-spinner loading-xs"></span> }
              {{ 'APP.SAVE' | translate }}
            </button>
          </div>
        </div>
        <div class="modal-backdrop" (click)="closeCreateModal()"></div>
      </div>
    }

    <!-- Payments Schedule Modal -->
    @if (showPaymentsModal()) {
      <div class="modal modal-open">
        <div class="modal-box w-11/12 max-w-lg">
          <h3 class="font-bold text-lg mb-1">
            {{ 'PARALLEL_LOANS.PAYMENTS' | translate }}
          </h3>
          <p class="text-sm text-base-content/50 mb-4">{{ selectedLoan()?.memberName }}</p>

          <div class="overflow-y-auto max-h-96 rounded-box border border-base-300">
            <table class="table table-sm w-full">
              <thead>
                <tr class="bg-base-200">
                  <th class="w-10">#</th>
                  <th>{{ 'CASH_BOX.DATE' | translate }}</th>
                  <th class="text-right">{{ 'PARALLEL_LOANS.INSTALLMENT' | translate }}</th>
                  <th class="text-center">Estado</th>
                  <th class="w-12"></th>
                </tr>
              </thead>
              <tbody>
                @for (p of service.payments(); track p.id; let i = $index) {
                  <tr class="hover:bg-base-200/50" [class.opacity-50]="p.status === 'paid'">
                    <td class="text-base-content/40 text-xs">{{ i + 1 }}</td>
                    <td class="text-base-content/70">{{ 'MONTHS.' + p.month | translate }} {{ p.year }}</td>
                    <td class="text-right font-medium">{{ p.amount | number:'1.0-0' }} Gs</td>
                    <td class="text-center">
                      <span class="badge badge-xs badge-outline"
                        [class.badge-success]="p.status === 'paid'"
                        [class.badge-warning]="p.status === 'pending'">
                        {{ (p.status === 'paid' ? 'PAYMENTS.PAID' : 'PAYMENTS.PENDING') | translate }}
                      </span>
                    </td>
                    <td class="text-center">
                      @if (p.status === 'pending') {
                        <button class="btn btn-circle btn-xs btn-success" [disabled]="toggling() === p.id" (click)="markPaid(p.id)">
                          @if (toggling() === p.id) { <span class="loading loading-spinner loading-xs"></span> }
                          @else { ✓ }
                        </button>
                      }
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>

          <div class="divider my-2"></div>
          <div class="modal-action mt-0">
            <button class="btn btn-ghost" (click)="closePaymentsModal()">{{ 'APP.CLOSE' | translate }}</button>
          </div>
        </div>
        <div class="modal-backdrop" (click)="closePaymentsModal()"></div>
      </div>
    }
  `,
})
export class ParallelLoanListComponent implements OnInit {
  readonly service = inject(ParallelLoansService);
  readonly membersService = inject(MembersService);
  private readonly route = inject(ActivatedRoute);

  private groupId = '';
  saving = signal(false);
  toggling = signal('');
  showCreateModal = signal(false);
  showPaymentsModal = signal(false);
  selectedLoan = signal<ParallelLoan | null>(null);

  form: CreateParallelLoanRequest = {
    memberId: '',
    amount: 0,
    interestRate: 5,
    totalInstallments: 15,
    roundingUnit: 500,
    startMonth: new Date().getMonth() + 1,
    startYear: new Date().getFullYear(),
  };

  months = Array.from({ length: 12 }, (_, i) => ({ value: i + 1 }));

  ngOnInit(): void {
    this.groupId = this.route.snapshot.parent?.paramMap.get('groupId') ?? '';
    this.service.loadByGroup(this.groupId);
    this.membersService.loadByGroup(this.groupId);
  }

  openCreateModal(): void {
    this.form = { memberId: '', amount: 0, interestRate: 5, totalInstallments: 15, roundingUnit: 500, startMonth: new Date().getMonth() + 1, startYear: new Date().getFullYear() };
    this.showCreateModal.set(true);
  }

  closeCreateModal(): void { this.showCreateModal.set(false); }

  openPaymentsModal(loan: ParallelLoan): void {
    this.selectedLoan.set(loan);
    this.service.loadPayments(this.groupId, loan.id);
    this.showPaymentsModal.set(true);
  }

  closePaymentsModal(): void { this.showPaymentsModal.set(false); this.selectedLoan.set(null); }

  save(): void {
    if (!this.form.memberId || !this.form.amount) return;
    this.saving.set(true);
    this.service.create(this.groupId, this.form).subscribe({
      next: () => { this.saving.set(false); this.closeCreateModal(); },
      error: () => this.saving.set(false),
    });
  }

  markPaid(paymentId: string): void {
    const loan = this.selectedLoan();
    if (!loan) return;
    this.toggling.set(paymentId);
    this.service.markPayment(this.groupId, loan.id, paymentId).subscribe({
      next: () => this.toggling.set(''),
      error: () => this.toggling.set(''),
    });
  }
}
