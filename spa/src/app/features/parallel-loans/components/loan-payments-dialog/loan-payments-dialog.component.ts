import { Component, EventEmitter, inject, Input, OnChanges, Output, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { ParallelLoansService } from '../../services/parallel-loans.service';
import { ParallelLoan } from '../../models/parallel-loan.model';

@Component({
  selector: 'app-loan-payments-dialog',
  standalone: true,
  imports: [TranslateModule, DecimalPipe],
  template: `
    @if (show) {
      <div class="modal modal-open">
        <div class="modal-box w-11/12 max-w-lg">
          <h3 class="font-bold text-lg mb-1">
            {{ 'PARALLEL_LOANS.PAYMENTS' | translate }}
          </h3>
          <p class="text-sm text-base-content/50 mb-4">{{ loan?.memberName }}</p>

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

  toggling = signal('');

  ngOnChanges(): void {
    if (this.show && this.loan) {
      this.service.loadPayments(this.groupId, this.loan.id);
    }
  }

  markPaid(paymentId: string): void {
    if (!this.loan) return;
    this.toggling.set(paymentId);
    this.service.markPayment(this.groupId, this.loan.id, paymentId).subscribe({
      next: () => this.toggling.set(''),
      error: () => this.toggling.set(''),
    });
  }

  onClose(): void {
    this.closed.emit();
  }
}
