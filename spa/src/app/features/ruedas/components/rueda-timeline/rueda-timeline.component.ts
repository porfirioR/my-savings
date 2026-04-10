import { Component, inject, Input, OnChanges, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { RuedasService } from '../../services/ruedas.service';
import { RuedaTimelineMonth } from '../../models/rueda.model';

@Component({
  selector: 'app-rueda-timeline',
  standalone: true,
  imports: [DecimalPipe, TranslateModule],
  template: `
    <div class="mt-4">
      <div class="flex items-center justify-between mb-3">
        <h4 class="font-semibold text-sm">{{ 'RUEDAS.TIMELINE' | translate }}</h4>
        @if (loading()) {
          <span class="loading loading-spinner loading-xs text-primary"></span>
        }
      </div>

      @if (timeline().length > 0) {
        <!-- Month navigation -->
        <div class="flex items-center gap-2 mb-3">
          <button class="btn btn-xs btn-ghost" (click)="prev()" [disabled]="activeIndex() === 0">‹</button>
          <span class="text-sm font-medium flex-1 text-center">
            {{ 'RUEDAS.TIMELINE_MONTH' | translate }} {{ activeIndex() + 1 }} /15
            — {{ 'MONTHS.' + current().calendarMonth | translate }} {{ current().calendarYear }}
          </span>
          <button class="btn btn-xs btn-ghost" (click)="next()" [disabled]="activeIndex() === timeline().length - 1">›</button>
        </div>

        <!-- Disbursement info -->
        <div class="alert alert-info py-2 px-3 mb-3 text-sm">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          <span>
            {{ 'RUEDAS.TIMELINE_DISBURSED' | translate }}
            <strong>{{ current().disbursedToMemberName }}</strong>:
            {{ current().disbursedAmount | number:'1.0-0' }} Gs
          </span>
        </div>

        <!-- Payment table -->
        <div class="overflow-x-auto">
          <table class="table table-xs">
            <thead>
              <tr>
                <th>{{ 'RUEDAS.SLOTS' | translate }}</th>
                <th>{{ 'MEMBERS.TITLE' | translate }}</th>
                <th>{{ 'RUEDAS.TIMELINE_PAYMENT_TYPE' | translate }}</th>
                <th class="text-right">{{ 'RUEDAS.LOAN_AMOUNT' | translate }}</th>
              </tr>
            </thead>
            <tbody>
              @for (p of current().payments; track p.slotPosition) {
                <tr>
                  <td class="text-base-content/50">{{ p.slotPosition }}</td>
                  <td>{{ p.memberName }}</td>
                  <td>
                    <span class="badge badge-xs"
                      [class.badge-primary]="p.type === 'contribution'"
                      [class.badge-warning]="p.type === 'installment'">
                      {{ (p.type === 'contribution' ? 'RUEDAS.TIMELINE_CONTRIBUTION' : 'RUEDAS.TIMELINE_INSTALLMENT') | translate }}
                    </span>
                  </td>
                  <td class="text-right font-mono">{{ p.amount | number:'1.0-0' }}</td>
                </tr>
              }
            </tbody>
            <tfoot>
              <tr class="font-semibold">
                <td colspan="3" class="text-right text-sm">{{ 'RUEDAS.TIMELINE_TOTAL' | translate }}</td>
                <td class="text-right font-mono">{{ current().totalCollected | number:'1.0-0' }}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      }
    </div>
  `,
})
export class RuedaTimelineComponent implements OnChanges {
  @Input() groupId = '';
  @Input() ruedaId = '';

  private readonly service = inject(RuedasService);

  timeline = signal<RuedaTimelineMonth[]>([]);
  loading = signal(false);
  activeIndex = signal(0);

  ngOnChanges(): void {
    if (this.ruedaId && this.groupId) {
      this.loading.set(true);
      this.activeIndex.set(0);
      this.service.getTimeline(this.groupId, this.ruedaId).subscribe({
        next: data => { this.timeline.set(data); this.loading.set(false); },
        error: () => this.loading.set(false),
      });
    }
  }

  current(): RuedaTimelineMonth {
    return this.timeline()[this.activeIndex()];
  }

  prev(): void {
    if (this.activeIndex() > 0) this.activeIndex.update(i => i - 1);
  }

  next(): void {
    if (this.activeIndex() < this.timeline().length - 1) this.activeIndex.update(i => i + 1);
  }
}
