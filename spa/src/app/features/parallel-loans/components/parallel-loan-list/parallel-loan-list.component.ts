import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DecimalPipe, LowerCasePipe } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { ParallelLoansService } from '../../services/parallel-loans.service';
import { MembersService } from '../../../members/services/members.service';
import { ParallelLoan } from '../../models/parallel-loan.model';
import { CreateParallelLoanDialogComponent } from '../create-parallel-loan-dialog/create-parallel-loan-dialog.component';
import { LoanPaymentsDialogComponent } from '../loan-payments-dialog/loan-payments-dialog.component';

@Component({
  selector: 'app-parallel-loan-list',
  standalone: true,
  imports: [DecimalPipe, LowerCasePipe, TranslateModule, CreateParallelLoanDialogComponent, LoanPaymentsDialogComponent],
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
      } @else if (sortedLoans().length === 0) {
        <div class="text-center py-16 text-base-content/50 text-sm">
          {{ 'PARALLEL_LOANS.EMPTY' | translate }}
        </div>
      } @else if (useAccordion()) {
        <!-- Accordion mode: more than 3 loans -->
        <div class="flex flex-col gap-2">
          @for (loan of sortedLoans(); track loan.id) {
            <div class="collapse collapse-arrow bg-base-200 border border-base-300 rounded-xl">
              <input type="checkbox" />
              <div class="collapse-title flex items-center gap-3 pr-10 min-h-0 py-3">
                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-2 flex-wrap">
                    <span class="font-bold text-sm">{{ loan.memberName }}</span>
                    <span class="badge badge-xs"
                      [class.badge-success]="loan.status === 'active'"
                      [class.badge-neutral]="loan.status === 'completed'">
                      {{ ('PARALLEL_LOANS.STATUS_' + loan.status.toUpperCase()) | translate }}
                    </span>
                  </div>
                  <p class="text-xs text-base-content/50 mt-0.5">
                    {{ 'MONTHS.' + loan.startMonth | translate }} {{ loan.startYear }}
                    &nbsp;·&nbsp;
                    {{ loan.installmentsPaid }}/{{ loan.totalInstallments }} {{ 'PARALLEL_LOANS.PAID_INSTALLMENTS' | translate | lowercase }}
                  </p>
                </div>
                <span class="text-sm font-semibold shrink-0">{{ loan.amount | number:'1.0-0' }} Gs</span>
              </div>
              <div class="collapse-content px-4 pb-4 pt-0">
                <div class="grid grid-cols-2 gap-3 mb-3">
                  <div class="bg-base-100 rounded-lg p-3">
                    <p class="text-xs text-base-content/50 mb-0.5">{{ 'PARALLEL_LOANS.AMOUNT' | translate }}</p>
                    <p class="font-semibold text-sm">{{ loan.amount | number:'1.0-0' }} Gs</p>
                  </div>
                  <div class="bg-base-100 rounded-lg p-3">
                    <p class="text-xs text-base-content/50 mb-0.5">{{ 'PARALLEL_LOANS.INSTALLMENT' | translate }}</p>
                    <p class="font-semibold text-sm">{{ loan.installmentAmount | number:'1.0-0' }} Gs</p>
                  </div>
                </div>
                <div class="grid grid-cols-3 gap-2 mb-3">
                  <div class="bg-base-100 rounded-lg p-2 text-center">
                    <p class="text-xs text-base-content/50 mb-0.5">{{ 'PARALLEL_LOANS.PAID_AMOUNT' | translate }}</p>
                    <p class="font-semibold text-xs text-success">{{ loan.installmentsPaid * loan.installmentAmount | number:'1.0-0' }} Gs</p>
                  </div>
                  <div class="bg-base-100 rounded-lg p-2 text-center">
                    <p class="text-xs text-base-content/50 mb-0.5">{{ 'PARALLEL_LOANS.REMAINING_AMOUNT' | translate }}</p>
                    <p class="font-semibold text-xs text-warning">{{ (loan.totalInstallments - loan.installmentsPaid) * loan.installmentAmount | number:'1.0-0' }} Gs</p>
                  </div>
                  <div class="bg-base-100 rounded-lg p-2 text-center">
                    <p class="text-xs text-base-content/50 mb-0.5">{{ 'PARALLEL_LOANS.GAIN' | translate }}</p>
                    <p class="font-semibold text-xs text-info">{{ loan.totalToReturn - loan.amount | number:'1.0-0' }} Gs</p>
                  </div>
                </div>
                <div class="flex items-center gap-3 mb-3">
                  <progress class="progress progress-primary flex-1"
                    [value]="loan.installmentsPaid"
                    [max]="loan.totalInstallments">
                  </progress>
                  <span class="text-xs text-base-content/60 shrink-0">{{ loan.installmentsPaid }}/{{ loan.totalInstallments }}</span>
                </div>
                @if (loan.status === 'active') {
                  <div class="flex justify-end gap-2">
                    @if (loan.installmentsPaid === 0) {
                      <button class="btn btn-ghost btn-sm" (click)="openEditModal(loan)">
                        {{ 'PARALLEL_LOANS.EDIT_BTN' | translate }}
                      </button>
                    }
                    <button class="btn btn-outline btn-sm" (click)="openPaymentsModal(loan)">
                      {{ 'PARALLEL_LOANS.PAYMENTS' | translate }}
                    </button>
                  </div>
                }
              </div>
            </div>
          }
        </div>
      } @else {
        <!-- Card mode: 3 or fewer loans -->
        <div class="grid gap-4">
          @for (loan of sortedLoans(); track loan.id) {
            <div class="card bg-base-200 border border-base-300">
              <div class="card-body p-5">
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
                <div class="grid grid-cols-2 gap-3 mb-3">
                  <div class="bg-base-100 rounded-lg p-3">
                    <p class="text-xs text-base-content/50 mb-0.5">{{ 'PARALLEL_LOANS.AMOUNT' | translate }}</p>
                    <p class="font-semibold text-sm">{{ loan.amount | number:'1.0-0' }} Gs</p>
                  </div>
                  <div class="bg-base-100 rounded-lg p-3">
                    <p class="text-xs text-base-content/50 mb-0.5">{{ 'PARALLEL_LOANS.INSTALLMENT' | translate }}</p>
                    <p class="font-semibold text-sm">{{ loan.installmentAmount | number:'1.0-0' }} Gs</p>
                  </div>
                </div>
                <div class="grid grid-cols-3 gap-2 mb-3">
                  <div class="bg-base-100 rounded-lg p-2 text-center">
                    <p class="text-xs text-base-content/50 mb-0.5">{{ 'PARALLEL_LOANS.PAID_AMOUNT' | translate }}</p>
                    <p class="font-semibold text-xs text-success">{{ loan.installmentsPaid * loan.installmentAmount | number:'1.0-0' }} Gs</p>
                  </div>
                  <div class="bg-base-100 rounded-lg p-2 text-center">
                    <p class="text-xs text-base-content/50 mb-0.5">{{ 'PARALLEL_LOANS.REMAINING_AMOUNT' | translate }}</p>
                    <p class="font-semibold text-xs text-warning">{{ (loan.totalInstallments - loan.installmentsPaid) * loan.installmentAmount | number:'1.0-0' }} Gs</p>
                  </div>
                  <div class="bg-base-100 rounded-lg p-2 text-center">
                    <p class="text-xs text-base-content/50 mb-0.5">{{ 'PARALLEL_LOANS.GAIN' | translate }}</p>
                    <p class="font-semibold text-xs text-info">{{ loan.totalToReturn - loan.amount | number:'1.0-0' }} Gs</p>
                  </div>
                </div>
                <div class="flex items-center gap-3 mb-3">
                  <progress class="progress progress-primary flex-1"
                    [value]="loan.installmentsPaid"
                    [max]="loan.totalInstallments">
                  </progress>
                  <span class="text-xs text-base-content/60 shrink-0">{{ loan.installmentsPaid }}/{{ loan.totalInstallments }}</span>
                </div>
                @if (loan.status === 'active') {
                  <div class="card-actions justify-end">
                    @if (loan.installmentsPaid === 0) {
                      <button class="btn btn-ghost btn-sm" (click)="openEditModal(loan)">
                        {{ 'PARALLEL_LOANS.EDIT_BTN' | translate }}
                      </button>
                    }
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

    <app-create-parallel-loan-dialog
      [show]="showLoanDialog()"
      [groupId]="groupId"
      [editLoan]="editingLoan()"
      (closed)="closeLoanDialog()"
      (saved)="onLoanSaved()" />

    <app-loan-payments-dialog
      [show]="showPaymentsModal()"
      [groupId]="groupId"
      [loan]="selectedLoan()"
      (closed)="closePaymentsModal()" />
  `,
})
export class ParallelLoanListComponent implements OnInit {
  readonly service = inject(ParallelLoansService);
  private readonly membersService = inject(MembersService);
  private readonly route = inject(ActivatedRoute);

  groupId = '';
  showLoanDialog = signal(false);
  showPaymentsModal = signal(false);
  editingLoan = signal<ParallelLoan | null>(null);
  selectedLoan = signal<ParallelLoan | null>(null);

  sortedLoans = computed(() =>
    [...this.service.loans()].sort((a, b) => {
      if (a.status !== b.status) return a.status === 'active' ? -1 : 1;
      if (a.startYear !== b.startYear) return a.startYear - b.startYear;
      return a.startMonth - b.startMonth;
    }),
  );

  useAccordion = computed(() => this.service.loans().length > 3);

  ngOnInit(): void {
    this.groupId = this.route.snapshot.parent?.paramMap.get('groupId') ?? '';
    this.service.loadByGroup(this.groupId);
    this.membersService.loadByGroup(this.groupId);
  }

  openCreateModal(): void {
    this.editingLoan.set(null);
    this.showLoanDialog.set(true);
  }

  openEditModal(loan: ParallelLoan): void {
    this.editingLoan.set(loan);
    this.showLoanDialog.set(true);
  }

  closeLoanDialog(): void {
    this.showLoanDialog.set(false);
    this.editingLoan.set(null);
  }

  onLoanSaved(): void {
    this.showLoanDialog.set(false);
    this.editingLoan.set(null);
  }

  openPaymentsModal(loan: ParallelLoan): void {
    this.selectedLoan.set(loan);
    this.showPaymentsModal.set(true);
  }

  closePaymentsModal(): void {
    this.showPaymentsModal.set(false);
    this.selectedLoan.set(null);
    this.service.loadByGroup(this.groupId);
  }
}
