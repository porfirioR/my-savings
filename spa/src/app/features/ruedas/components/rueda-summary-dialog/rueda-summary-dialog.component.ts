import { Component, EventEmitter, Input, Output } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { RuedaTimelineMonth } from '../../models/rueda.model';

@Component({
  selector: 'app-rueda-summary-dialog',
  standalone: true,
  imports: [DecimalPipe, TranslateModule],
  template: `
    @if (show && month) {
      <div class="modal modal-open">
        <div class="modal-box max-w-md p-0 overflow-hidden">
          <div class="p-4 pb-2 flex items-center justify-between">
            <div>
              <h3 class="font-bold text-base">{{ ruedaLabel }}</h3>
              <p class="text-xs text-base-content/50">
                {{ 'MONTHS.' + month.calendarMonth | translate }} {{ month.calendarYear }}
              </p>
            </div>
            <button class="btn btn-ghost btn-xs btn-circle" (click)="onClose()">✕</button>
          </div>

          <table class="table table-sm w-full">
            <thead>
              <tr class="bg-base-200">
                <th class="text-left">{{ 'RUEDAS.SUMMARY_PERSON' | translate }}</th>
                <th class="text-right">{{ 'RUEDAS.SUMMARY_INSTALLMENT' | translate }}</th>
                <th class="text-right">{{ 'RUEDAS.SUMMARY_CURRENT_TURN' | translate }}</th>
                <th class="text-center">{{ 'RUEDAS.SUMMARY_PAID' | translate }}</th>
              </tr>
            </thead>
            <tbody>
              @for (p of sortedPayments(); track p.slotPosition) {
                <tr [class.bg-success/25]="p.memberId === month.disbursedToMemberId">
                  <td class="font-medium">{{ p.memberName }}</td>
                  <td class="text-right font-mono">{{ p.amount | number:'1.0-0' }}</td>
                  <td class="text-right">{{ p.cuotaNumber || '—' }}</td>
                  <td class="text-center">
                    @if (!p.hasPaymentRecord) {
                      <span class="text-base-content/30">—</span>
                    } @else if (p.isPaid) {
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-success inline" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                      </svg>
                    } @else {
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-error inline" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                      </svg>
                    }
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
        <div class="modal-backdrop" (click)="onClose()"></div>
      </div>
    }
  `,
})
export class RuedaSummaryDialogComponent {
  @Input() show = false;
  @Input() month: RuedaTimelineMonth | null = null;
  @Input() ruedaLabel = '';
  @Output() closed = new EventEmitter<void>();

  sortedPayments() {
    return [...(this.month?.payments ?? [])].sort((a, b) => a.slotPosition - b.slotPosition);
  }

  onClose(): void {
    this.closed.emit();
  }
}
