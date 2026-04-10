import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DecimalPipe } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { ParallelLoansService } from '../../services/parallel-loans.service';
import { MembersService } from '../../../members/services/members.service';
import { ParallelLoan } from '../../models/parallel-loan.model';
import { CreateParallelLoanDialogComponent } from '../create-parallel-loan-dialog/create-parallel-loan-dialog.component';
import { LoanPaymentsDialogComponent } from '../loan-payments-dialog/loan-payments-dialog.component';

@Component({
  selector: 'app-parallel-loan-list',
  standalone: true,
  imports: [DecimalPipe, TranslateModule, CreateParallelLoanDialogComponent, LoanPaymentsDialogComponent],
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

    <app-create-parallel-loan-dialog
      [show]="showCreateModal()"
      [groupId]="groupId"
      (closed)="closeCreateModal()"
      (saved)="closeCreateModal()" />

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
  showCreateModal = signal(false);
  showPaymentsModal = signal(false);
  selectedLoan = signal<ParallelLoan | null>(null);

  ngOnInit(): void {
    this.groupId = this.route.snapshot.parent?.paramMap.get('groupId') ?? '';
    this.service.loadByGroup(this.groupId);
    this.membersService.loadByGroup(this.groupId);
  }

  openCreateModal(): void {
    this.showCreateModal.set(true);
  }

  closeCreateModal(): void {
    this.showCreateModal.set(false);
  }

  openPaymentsModal(loan: ParallelLoan): void {
    this.selectedLoan.set(loan);
    this.showPaymentsModal.set(true);
  }

  closePaymentsModal(): void {
    this.showPaymentsModal.set(false);
    this.selectedLoan.set(null);
  }
}
