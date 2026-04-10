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

      @if (!loading() && timeline().length === 0) {
        <p class="text-xs text-base-content/50 text-center py-4">{{ 'RUEDAS.TIMELINE_EMPTY' | translate }}</p>
      }

      @if (timeline().length > 0 && current(); as c) {
        <!-- Month navigation -->
        <div class="flex items-center gap-2 mb-3">
          <button class="btn btn-xs btn-ghost" (click)="prev()" [disabled]="activeIndex() === 0">‹</button>
          <span class="text-sm font-medium flex-1 text-center">
            {{ 'RUEDAS.TIMELINE_MONTH' | translate }} {{ c.position }}/{{ timeline().length }}
            — {{ 'MONTHS.' + c.calendarMonth | translate }} {{ c.calendarYear }}
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
            <strong>{{ c.disbursedToMemberName }}</strong>:
            {{ c.disbursedAmount | number:'1.0-0' }} Gs
            <span class="text-base-content/60 ml-1">({{ 'RUEDAS.TIMELINE_TOTAL' | translate }}: {{ c.totalCollected | number:'1.0-0' }} Gs)</span>
          </span>
        </div>

        <!-- Summary table: Name | Amount | Cuota | Status -->
        <div class="overflow-x-auto">
          <table class="table table-xs w-full">
            <thead>
              <tr class="text-base-content/60">
                <th class="w-6">#</th>
                <th>{{ 'MEMBERS.TITLE' | translate }}</th>
                <th class="text-right">{{ 'RUEDAS.INSTALLMENT' | translate }} (Gs)</th>
                <th class="text-center">{{ 'RUEDAS.TIMELINE_CUOTA' | translate }}</th>
                <th class="text-center">{{ 'RUEDAS.TIMELINE_STATUS' | translate }}</th>
              </tr>
            </thead>
            <tbody>
              @for (p of c.payments; track p.slotPosition) {
                <tr [class.opacity-50]="p.isPaid">
                  <td class="text-base-content/40 text-xs">{{ p.slotPosition }}</td>
                  <td class="font-medium">{{ p.memberName }}</td>
                  <td class="text-right font-mono text-sm">{{ p.amount | number:'1.0-0' }}</td>
                  <td class="text-center">
                    @if (p.cuotaNumber === 0) {
                      <span class="badge badge-xs badge-ghost">—</span>
                    } @else {
                      <span class="text-xs font-semibold"
                        [class.text-warning]="p.paymentType === 'previous_rueda'"
                        [class.text-primary]="p.paymentType === 'current_rueda'">
                        {{ p.cuotaNumber }}/15
                      </span>
                    }
                    @if (p.paymentType === 'previous_rueda') {
                      <span class="badge badge-xs badge-warning ml-1">{{ 'RUEDAS.TIMELINE_PREV' | translate }}</span>
                    }
                  </td>
                  <td class="text-center">
                    @if (!p.hasPaymentRecord) {
                      <span class="badge badge-xs badge-ghost">—</span>
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

  current(): RuedaTimelineMonth | null {
    return this.timeline()[this.activeIndex()] ?? null;
  }

  prev(): void {
    if (this.activeIndex() > 0) this.activeIndex.update(i => i - 1);
  }

  next(): void {
    if (this.activeIndex() < this.timeline().length - 1) this.activeIndex.update(i => i + 1);
  }
}
