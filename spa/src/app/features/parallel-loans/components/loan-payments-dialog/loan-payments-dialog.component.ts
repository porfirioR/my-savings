import { Component, EventEmitter, inject, Input, OnChanges, Output, signal } from '@angular/core';
import { DecimalPipe, SlicePipe } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { ParallelLoansService } from '../../services/parallel-loans.service';
import { ParallelLoan } from '../../models/parallel-loan.model';
import { ToastService } from '../../../../core/services/toast.service';

@Component({
  selector: 'app-loan-payments-dialog',
  standalone: true,
  imports: [TranslateModule, DecimalPipe, SlicePipe],
  template: `
    @if (show) {
      <div class="modal modal-open">
        <div class="modal-box w-11/12 max-w-2xl">
          <h3 class="font-bold text-lg mb-1">
            {{ 'PARALLEL_LOANS.PAYMENTS' | translate }}
          </h3>
          <p class="text-sm text-base-content/50 mb-4">{{ loan?.memberName }}</p>

          <div class="overflow-y-auto max-h-[60vh] rounded-box border border-base-300">
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
                    <td class="text-base-content/70">
                      <span class="sm:hidden">{{ 'MONTHS.' + p.month | translate | slice:0:3 }} {{ p.year }}</span>
                      <span class="hidden sm:inline">{{ 'MONTHS.' + p.month | translate }} {{ p.year }}</span>
                    </td>
                    <td class="text-right font-medium whitespace-nowrap">{{ p.amount | number:'1.0-0' }} Gs</td>
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
                      } @else if (confirmingRevertId() === p.id) {
                        <div class="flex items-center gap-1 justify-center">
                          <button class="btn btn-xs btn-error" [disabled]="toggling() === p.id" (click)="confirmRevert(p.id)">
                            @if (toggling() === p.id) { <span class="loading loading-spinner loading-xs"></span> }
                            @else { Sí }
                          </button>
                          <button class="btn btn-xs btn-ghost" (click)="cancelRevert()">No</button>
                        </div>
                      } @else {
                        <button class="btn btn-xs btn-ghost text-warning opacity-60 hover:opacity-100"
                          title="Revertir pago"
                          (click)="askRevert(p.id)">↩</button>
                      }
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>

          <div class="divider my-2"></div>
          <div class="modal-action mt-0">
            <button class="btn btn-ghost" (click)="onClose()">{{ 'APP.CLOSE' | translate }}</button>
          </div>
        </div>
        <div class="modal-backdrop" (click)="onClose()"></div>
      </div>
    }
  `,
})
export class LoanPaymentsDialogComponent implements OnChanges {
  @Input() show = false;
  @Input() groupId = '';
  @Input() loan: ParallelLoan | null = null;
  @Output() closed = new EventEmitter<void>();

  readonly service = inject(ParallelLoansService);
  private readonly toast = inject(ToastService);

  toggling = signal('');
  confirmingRevertId = signal('');

  ngOnChanges(): void {
    if (this.show && this.loan) {
      this.service.loadPayments(this.groupId, this.loan.id);
      this.confirmingRevertId.set('');
    }
  }

  markPaid(paymentId: string): void {
    if (!this.loan) return;
    this.toggling.set(paymentId);
    this.service.markPayment(this.groupId, this.loan.id, paymentId).subscribe({
      next: () => {
        this.toggling.set('');
        this.toast.success('TOAST.PAYMENT_REGISTERED');
      },
      error: () => {
        this.toggling.set('');
        this.toast.error('TOAST.PAYMENT_REGISTER_ERROR');
      },
    });
  }

  askRevert(paymentId: string): void {
    this.confirmingRevertId.set(paymentId);
  }

  cancelRevert(): void {
    this.confirmingRevertId.set('');
  }

  confirmRevert(paymentId: string): void {
    if (!this.loan) return;
    this.toggling.set(paymentId);
    this.confirmingRevertId.set('');
    this.service.unmarkPayment(this.groupId, this.loan.id, paymentId).subscribe({
      next: () => {
        this.toggling.set('');
        this.toast.success('TOAST.PAYMENT_REVERTED');
      },
      error: () => {
        this.toggling.set('');
        this.toast.error('TOAST.PAYMENT_REVERT_ERROR');
      },
    });
  }

  onClose(): void {
    this.confirmingRevertId.set('');
    this.closed.emit();
  }
}
