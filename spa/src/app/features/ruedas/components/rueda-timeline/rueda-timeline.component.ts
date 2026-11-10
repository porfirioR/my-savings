import { Component, computed, inject, Input, OnChanges, signal, SimpleChanges } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { RuedasService } from '../../services/ruedas.service';
import { Rueda, RuedaTimelineMonth, RuedaTimelinePayment } from '../../models/rueda.model';
import { PaymentsService } from '../../../payments/services/payments.service';
import { ToastService } from '../../../../core/services/toast.service';
import { backendErrorToastKey } from '../../../../core/services/backend-error.util';
import { RuedaSummaryDialogComponent } from '../rueda-summary-dialog/rueda-summary-dialog.component';

@Component({
  selector: 'app-rueda-timeline',
  standalone: true,
  imports: [DecimalPipe, TranslateModule, RuedaSummaryDialogComponent],
  template: `
    <div class="mt-2">
      @if (loading() && timeline().length === 0) {
        <div class="flex justify-center py-6">
          <span class="loading loading-spinner loading-md text-primary"></span>
        </div>
      }

      @if (!loading() && timeline().length === 0) {
        <p class="text-xs text-base-content/50 text-center py-4">{{ 'RUEDAS.TIMELINE_EMPTY' | translate }}</p>
      }

      @if (timeline().length > 0 && current(); as c) {
        <!-- Month navigation (centered) + share summary (right) -->
        <div class="flex flex-col items-center gap-2 mb-3 sm:grid sm:grid-cols-[1fr_auto_1fr]">
          <div class="hidden sm:block"></div>
          <div class="flex items-center gap-1">
            <button class="btn btn-sm btn-ghost btn-circle" (click)="prev()" [disabled]="activeIndex() === 0">‹</button>
            <span class="text-sm font-semibold text-center min-w-48">
              @if (c.position === 1) {
                {{ 'RUEDAS.TIMELINE_JUNTA' | translate }} - {{ 'RUEDAS.TIMELINE_MONTH' | translate }} 1
              } @else if (isJuntaNewRueda()) {
                {{ 'RUEDAS.TIMELINE_JUNTA_NEW' | translate }}
              } @else {
                {{ 'RUEDAS.TIMELINE_MONTH' | translate }} {{ c.position }}/{{ totalMonths() - 1 }}
              }
              &mdash; {{ 'MONTHS.' + c.calendarMonth | translate }} {{ c.calendarYear }}
            </span>
            <button class="btn btn-sm btn-ghost btn-circle" (click)="next()" [disabled]="activeIndex() >= timeline().length - 1">›</button>
          </div>
          <div class="sm:justify-self-end">
            <button class="btn btn-ghost btn-xs gap-1" [title]="'RUEDAS.SUMMARY_OPEN' | translate" (click)="showSummary.set(true)">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"/>
              </svg>
              {{ 'RUEDAS.SUMMARY_OPEN' | translate }}
            </button>
          </div>
        </div>

        <!-- Month without generated payments: generate them right here -->
        @if (canGenerate()) {
          <div class="alert py-2 px-3 mb-3 text-sm flex flex-wrap justify-between">
            <span>{{ 'RUEDAS.TIMELINE_NO_PAYMENTS_BANNER' | translate }}</span>
            <button class="btn btn-primary btn-xs" [disabled]="generating()" (click)="showGenerateConfirm.set(true)">
              @if (generating()) { <span class="loading loading-spinner loading-xs"></span> }
              {{ 'PAYMENTS.GENERATE' | translate }}
            </button>
          </div>
        }

        <!-- Junta nueva rueda banner -->
        @if (isJuntaNewRueda()) {
          <div class="alert alert-info py-2 px-3 mb-3 text-sm">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            <span>{{ 'RUEDAS.TIMELINE_JUNTA_NEW_BANNER' | translate }}</span>
          </div>
        }

        <!-- Disbursement info (hidden on final junta page) -->
        @if (c.disbursedToMemberId) {
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
        }

        <!-- Summary table: Name | Amount | Cuota | Status -->
        <div class="overflow-x-auto">
          <table class="table table-xs w-full">
            <thead>
              <tr class="text-base-content/60">
                <th class="w-6">#</th>
                <th class="w-8">{{ 'RUEDAS.TAKES_TURN' | translate }}</th>
                <th>{{ 'MEMBERS.TITLE' | translate }}</th>
                <th class="text-right">{{ 'RUEDAS.INSTALLMENT' | translate }} (Gs)</th>
                <th class="text-center">{{ 'RUEDAS.TIMELINE_CUOTA' | translate }}</th>
                <th class="text-center">{{ 'RUEDAS.TIMELINE_STATUS' | translate }}</th>
              </tr>
            </thead>
            <tbody>
              @for (p of c.payments; track p.slotPosition) {
                <tr>
                  <td class="text-base-content/40 text-xs">{{ p.slotPosition }}</td>
                  <td class="text-center">
                    @if (p.memberId === c.disbursedToMemberId) {
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-info inline" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                      </svg>
                    }
                  </td>
                  <td class="font-medium">{{ p.memberName }}</td>
                  <td class="text-right font-mono text-sm">{{ p.amount | number:'1.0-0' }}</td>
                  <td class="text-center">
                    @if (p.cuotaNumber === 0) {
                      <span class="badge badge-xs badge-ghost">—</span>
                    } @else {
                      <span class="text-xs font-semibold"
                        [class.text-warning]="p.paymentType === 'previous_rueda'"
                        [class.text-primary]="p.paymentType === 'current_rueda'">
                        {{ p.cuotaNumber }}/{{ installmentCount() }}
                      </span>
                      @if (p.paymentType === 'previous_rueda') {
                        <span class="badge badge-xs badge-warning ml-1">
                          <span class="sm:hidden">{{ 'RUEDAS.TIMELINE_PREV' | translate }}</span>
                          <span class="hidden sm:inline">{{ 'RUEDAS.TIMELINE_PREV_FULL' | translate }}</span>
                        </span>
                      }
                    }
                  </td>
                  <td class="text-center">
                    @if (!p.hasPaymentRecord || !p.paymentId) {
                      <span class="badge badge-xs badge-ghost" [title]="'RUEDAS.TIMELINE_NO_PAYMENTS' | translate">—</span>
                    } @else if (toggling() === p.paymentId) {
                      <span class="loading loading-spinner loading-xs"></span>
                    } @else if (p.isPaid) {
                      <button class="btn btn-circle btn-xs btn-ghost text-success hover:bg-error hover:text-white"
                        [disabled]="toggling() !== '' || ruedaStatus === 'completed'"
                        [title]="'PAYMENTS.MARK_UNPAID' | translate"
                        (click)="revertTarget.set(p)">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                        </svg>
                      </button>
                    } @else {
                      <button class="btn btn-xs btn-outline btn-success"
                        [disabled]="toggling() !== ''"
                        [title]="'PAYMENTS.MARK_PAID' | translate"
                        (click)="togglePaid(p, 'paid')">
                        {{ 'RUEDAS.TIMELINE_MARK_PAID' | translate }}
                      </button>
                    }
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      }
    </div>

    @if (showGenerateConfirm() && current(); as c) {
      <div class="modal modal-open">
        <div class="modal-box">
          <h3 class="font-bold text-lg mb-2">{{ 'PAYMENTS.CONFIRM_GENERATE_TITLE' | translate }}</h3>
          <p class="text-sm text-base-content/70">
            {{ 'PAYMENTS.CONFIRM_GENERATE_BODY' | translate: { period: ('MONTHS.' + c.calendarMonth | translate) + ' ' + c.calendarYear } }}
          </p>
          <div class="modal-action">
            <button class="btn btn-ghost" (click)="showGenerateConfirm.set(false)">{{ 'APP.CANCEL' | translate }}</button>
            <button class="btn btn-primary" (click)="generate()">{{ 'APP.CONFIRM' | translate }}</button>
          </div>
        </div>
        <div class="modal-backdrop" (click)="showGenerateConfirm.set(false)"></div>
      </div>
    }

    @if (revertTarget(); as rp) {
      <div class="modal modal-open">
        <div class="modal-box">
          <h3 class="font-bold text-lg mb-2">{{ 'PAYMENTS.MARK_UNPAID' | translate }}</h3>
          <p class="text-sm text-base-content/70">
            {{ 'RUEDAS.TIMELINE_UNPAID_CONFIRM' | translate: { name: rp.memberName } }}
          </p>
          <div class="modal-action">
            <button class="btn btn-ghost" (click)="revertTarget.set(null)">{{ 'APP.CANCEL' | translate }}</button>
            <button class="btn btn-error" (click)="confirmRevert()">{{ 'APP.CONFIRM' | translate }}</button>
          </div>
        </div>
        <div class="modal-backdrop" (click)="revertTarget.set(null)"></div>
      </div>
    }

    <app-rueda-summary-dialog
      [show]="showSummary()"
      [month]="current()"
      [ruedaLabel]="ruedaLabel"
      (closed)="showSummary.set(false)" />
  `,
})
export class RuedaTimelineComponent implements OnChanges {
  @Input() groupId = '';
  @Input() ruedaId = '';
  @Input() ruedaLabel = '';
  @Input() ruedaStatus: Rueda['status'] = 'active';

  private readonly service = inject(RuedasService);
  private readonly paymentsService = inject(PaymentsService);
  private readonly toast = inject(ToastService);

  timeline = signal<RuedaTimelineMonth[]>([]);
  loading = signal(false);
  activeIndex = signal(0);
  showSummary = signal(false);
  /** paymentId currently being toggled ('' = none) */
  toggling = signal('');
  showGenerateConfirm = signal(false);
  generating = signal(false);
  /** Payment awaiting revert confirmation (null = modal closed) */
  revertTarget = signal<RuedaTimelinePayment | null>(null);

  confirmRevert(): void {
    const p = this.revertTarget();
    this.revertTarget.set(null);
    if (p) this.togglePaid(p, 'unpaid');
  }

  /** Same rule as the Payments page: active rueda, real month (not the final junta), no list generated yet. */
  canGenerate(): boolean {
    const c = this.current();
    return !!c
      && this.ruedaStatus === 'active'
      && !this.isJuntaNewRueda()
      && c.payments.length > 0
      && c.payments.every(p => !p.hasPaymentRecord);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!changes['ruedaId'] && !changes['groupId']) return;
    this.timeline.set([]);
    this.loadTimeline(false);
  }

  /** @param keepIndex stay on the month being viewed (after generating) instead of jumping to the current one */
  private loadTimeline(keepIndex: boolean): void {
    if (!this.ruedaId || !this.groupId) return;
    this.loading.set(true);
    this.service.getTimeline(this.groupId, this.ruedaId).subscribe({
      next: data => {
        this.timeline.set(data);
        this.loading.set(false);
        if (!keepIndex || this.activeIndex() >= data.length) {
          this.activeIndex.set(this.findCurrentMonthIndex(data));
        }
      },
      error: () => this.loading.set(false),
    });
  }

  generate(): void {
    const c = this.current();
    this.showGenerateConfirm.set(false);
    if (!c || this.generating()) return;
    this.generating.set(true);
    this.paymentsService.generate(this.groupId, this.ruedaId, { month: c.calendarMonth, year: c.calendarYear }).subscribe({
      next: () => {
        this.generating.set(false);
        this.toast.success('TOAST.PAYMENTS_GENERATED');
        this.loadTimeline(true);
      },
      error: (err) => {
        this.generating.set(false);
        this.toast.error(backendErrorToastKey(err, 'TOAST.PAYMENTS_GENERATE_ERROR'));
      },
    });
  }

  /**
   * Marks / unmarks a payment directly from the timeline and patches the local
   * timeline so the table and the "Compartir resumen" dialog reflect it at once.
   */
  togglePaid(p: RuedaTimelinePayment, action: 'paid' | 'unpaid'): void {
    const paymentId = p.paymentId;
    if (!paymentId || this.toggling()) return;
    if (action === 'unpaid' && this.ruedaStatus === 'completed') return;
    this.toggling.set(paymentId);
    const obs = action === 'paid'
      ? this.paymentsService.markPaid(this.groupId, this.ruedaId, paymentId)
      : this.paymentsService.markUnpaid(this.groupId, this.ruedaId, paymentId);
    obs.subscribe({
      next: () => {
        const isPaid = action === 'paid';
        this.timeline.update(tl => tl.map(m => ({
          ...m,
          payments: m.payments.map(x => x.paymentId === paymentId ? { ...x, isPaid } : x),
        })));
        this.toggling.set('');
        this.toast.success(isPaid ? 'TOAST.PAYMENT_REGISTERED' : 'TOAST.PAYMENT_REVERTED');
      },
      error: () => {
        this.toggling.set('');
        this.toast.error(action === 'paid' ? 'TOAST.PAYMENT_REGISTER_ERROR' : 'TOAST.PAYMENT_REVERT_ERROR');
      },
    });
  }

  /** Index of the current calendar month, or the closest past one if the rueda hasn't reached it yet */
  private findCurrentMonthIndex(data: RuedaTimelineMonth[]): number {
    if (data.length === 0) return 0;
    const now = new Date();
    const nowKey = now.getFullYear() * 12 + (now.getMonth() + 1);
    let bestIdx = 0;
    for (let i = 0; i < data.length; i++) {
      const key = data[i].calendarYear * 12 + data[i].calendarMonth;
      if (key <= nowKey) bestIdx = i;
    }
    return bestIdx;
  }

  isJuntaNewRueda = computed(() => {
    const tl = this.timeline();
    const idx = this.activeIndex();
    if (tl.length <= 1) return false;
    if (idx !== tl.length - 1) return false;
    return !tl[idx]?.disbursedToMemberId;
  });

  installmentCount = computed(() => {
    const tl = this.timeline();
    if (tl.length === 0) return 0;
    return tl[tl.length - 1]?.disbursedToMemberId ? tl.length : tl.length - 1;
  });

  current(): RuedaTimelineMonth | null {
    return this.timeline()[this.activeIndex()] ?? null;
  }

  totalMonths(): number {
    return this.timeline().length;
  }

  prev(): void {
    if (this.activeIndex() > 0) this.activeIndex.update(i => i - 1);
  }

  next(): void {
    if (this.activeIndex() < this.timeline().length - 1) this.activeIndex.update(i => i + 1);
  }
}
