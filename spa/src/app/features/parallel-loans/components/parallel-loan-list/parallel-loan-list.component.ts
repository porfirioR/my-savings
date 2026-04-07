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
    <div class="p-4">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-xl font-bold">{{ 'PARALLEL_LOANS.TITLE' | translate }}</h2>
        <button class="btn btn-primary btn-sm" (click)="openCreateModal()">
          {{ 'PARALLEL_LOANS.NEW' | translate }}
        </button>
      </div>

      @if (service.loading()) {
        <div class="flex justify-center py-8">
          <span class="loading loading-spinner loading-md"></span>
        </div>
      } @else if (service.loans().length === 0) {
        <div class="text-center py-8 text-base-content/50">
          {{ 'PARALLEL_LOANS.EMPTY' | translate }}
        </div>
      } @else {
        <div class="grid gap-3">
          @for (loan of service.loans(); track loan.id) {
            <div class="card bg-base-200 shadow-sm">
              <div class="card-body p-4">
                <div class="flex justify-between items-start">
                  <div>
                    <h3 class="font-semibold">{{ loan.memberName }}</h3>
                    <p class="text-sm text-base-content/70">
                      {{ 'PARALLEL_LOANS.START_DATE' | translate }}: {{ 'MONTHS.' + loan.startMonth | translate }} {{ loan.startYear }}
                    </p>
                    <div class="mt-1">
                      <progress class="progress progress-primary w-40"
                        [value]="loan.installmentsPaid"
                        [max]="loan.totalInstallments">
                      </progress>
                      <span class="text-xs ml-2">{{ loan.installmentsPaid }}/{{ loan.totalInstallments }}</span>
                    </div>
                  </div>
                  <div class="text-right text-sm">
                    <div>{{ 'PARALLEL_LOANS.AMOUNT' | translate }}: <strong>{{ loan.amount | number:'1.0-0' }} Gs</strong></div>
                    <div>{{ 'PARALLEL_LOANS.INSTALLMENT' | translate }}: <strong>{{ loan.installmentAmount | number:'1.0-0' }} Gs</strong></div>
                    <div>
                      <span class="badge badge-sm" [class.badge-success]="loan.status === 'active'" [class.badge-neutral]="loan.status === 'completed'">
                        {{ ('PARALLEL_LOANS.STATUS_' + loan.status.toUpperCase()) | translate }}
                      </span>
                    </div>
                  </div>
                </div>
                @if (loan.status === 'active') {
                  <div class="card-actions justify-end mt-2">
                    <button class="btn btn-outline btn-xs" (click)="openPaymentsModal(loan)">
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
          <h3 class="font-bold text-lg mb-4">{{ 'PARALLEL_LOANS.NEW' | translate }}</h3>

          <div class="form-control mb-3">
            <label class="label"><span class="label-text">{{ 'PARALLEL_LOANS.MEMBER' | translate }}</span></label>
            <select class="select select-bordered" [(ngModel)]="form.memberId">
              <option value="">-- Seleccionar --</option>
              @for (m of membersService.members(); track m.id) {
                @if (m.isActive) {
                  <option [value]="m.id">{{ m.firstName }} {{ m.lastName }}</option>
                }
              }
            </select>
          </div>

          <div class="form-control mb-3">
            <label class="label"><span class="label-text">{{ 'PARALLEL_LOANS.AMOUNT' | translate }} (Gs)</span></label>
            <input type="number" class="input input-bordered" [(ngModel)]="form.amount" min="0" />
          </div>

          <div class="form-control mb-3">
            <label class="label"><span class="label-text">{{ 'PARALLEL_LOANS.INTEREST' | translate }} (%)</span></label>
            <input type="number" class="input input-bordered" [(ngModel)]="form.interestRate" step="0.5" />
          </div>

          <div class="form-control mb-3">
            <label class="label"><span class="label-text">{{ 'PARALLEL_LOANS.TOTAL_INSTALLMENTS' | translate }}</span></label>
            <input type="number" class="input input-bordered" [(ngModel)]="form.totalInstallments" min="1" />
          </div>

          <div class="grid grid-cols-2 gap-3 mb-4">
            <div class="form-control">
              <label class="label"><span class="label-text">{{ 'PAYMENTS.MONTH' | translate }} inicio</span></label>
              <select class="select select-bordered" [(ngModel)]="form.startMonth">
                @for (m of months; track m.value) {
                  <option [ngValue]="m.value">{{ 'MONTHS.' + m.value | translate }}</option>
                }
              </select>
            </div>
            <div class="form-control">
              <label class="label"><span class="label-text">{{ 'PAYMENTS.YEAR' | translate }}</span></label>
              <input type="number" class="input input-bordered" [(ngModel)]="form.startYear" />
            </div>
          </div>

          <div class="modal-action">
            <button class="btn btn-ghost" (click)="closeCreateModal()">{{ 'APP.CANCEL' | translate }}</button>
            <button class="btn btn-primary" [disabled]="saving()" (click)="save()">
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
          <h3 class="font-bold text-lg mb-4">
            {{ 'PARALLEL_LOANS.PAYMENTS' | translate }} — {{ selectedLoan()?.memberName }}
          </h3>

          <div class="overflow-y-auto max-h-96">
            <table class="table table-sm w-full">
              <thead>
                <tr>
                  <th>#</th>
                  <th>{{ 'CASH_BOX.DATE' | translate }}</th>
                  <th class="text-right">{{ 'PARALLEL_LOANS.INSTALLMENT' | translate }}</th>
                  <th class="text-center">Estado</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                @for (p of service.payments(); track p.id; let i = $index) {
                  <tr [class.opacity-50]="p.status === 'paid'">
                    <td>{{ i + 1 }}</td>
                    <td>{{ 'MONTHS.' + p.month | translate }} {{ p.year }}</td>
                    <td class="text-right">{{ p.amount | number:'1.0-0' }} Gs</td>
                    <td class="text-center">
                      <span class="badge badge-xs" [class.badge-success]="p.status === 'paid'" [class.badge-warning]="p.status === 'pending'">
                        {{ (p.status === 'paid' ? 'PAYMENTS.PAID' : 'PAYMENTS.PENDING') | translate }}
                      </span>
                    </td>
                    <td>
                      @if (p.status === 'pending') {
                        <button class="btn btn-success btn-xs" [disabled]="toggling() === p.id" (click)="markPaid(p.id)">
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

          <div class="modal-action">
            <button class="btn" (click)="closePaymentsModal()">{{ 'APP.CLOSE' | translate }}</button>
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
    this.form = { memberId: '', amount: 0, interestRate: 5, totalInstallments: 15, startMonth: new Date().getMonth() + 1, startYear: new Date().getFullYear() };
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
