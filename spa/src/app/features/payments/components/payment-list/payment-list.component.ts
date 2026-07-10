import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { PaymentsService } from '../../services/payments.service';
import { RuedasService } from '../../../ruedas/services/ruedas.service';
import { Rueda } from '../../../ruedas/models/rueda.model';
import { DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastService } from '../../../../core/services/toast.service';

interface ValidMonth {
  month: number;
  year: number;
  label: string;
  index: number; // 1-based position within rueda (1 = junta + mes 1, 2..N = mes 2..N)
}

@Component({
  selector: 'app-payment-list',
  standalone: true,
  imports: [FormsModule, DecimalPipe, TranslateModule],
  template: `
    <div>
      <div class="flex items-center justify-between mb-2">
        <h2 class="text-2xl font-bold tracking-tight">{{ 'PAYMENTS.TITLE' | translate }}</h2>
      </div>
      <div class="divider mt-0 mb-6"></div>

      <!-- Controls bar -->
      <div class="card bg-base-200 border border-base-300 p-4 mb-5">
        <div class="flex flex-wrap gap-3 items-center">
          <!-- Rueda selector -->
          <select class="select select-bordered select-sm" [ngModel]="selectedRuedaId()" (ngModelChange)="onRuedaChange($event)">
            <option value="">-- Rueda --</option>
            @for (r of ruedasService.ruedas(); track r.id) {
              <option [value]="r.id">{{ 'RUEDAS.NUMBER' | translate }} {{ r.ruedaNumber }}</option>
            }
          </select>

          <!-- Month navigation — only visible once a rueda is selected -->
          @if (selectedRueda()) {
            <div class="flex items-center gap-1">
              <button class="btn btn-xs btn-ghost" (click)="prevMonth()" [disabled]="activeMonthIndex() === 0">‹</button>
              <span class="text-sm font-medium px-2 min-w-40 text-center">
                @if (currentValidMonth(); as cm) {
                  @if (cm.index === 1) {
                    {{ 'RUEDAS.TIMELINE_JUNTA' | translate }} - {{ 'RUEDAS.TIMELINE_MONTH' | translate }} 1
                  } @else if (isJuntaNewRueda()) {
                    {{ 'RUEDAS.TIMELINE_JUNTA_NEW' | translate }}
                  } @else {
                    {{ 'RUEDAS.TIMELINE_MONTH' | translate }} {{ cm.index }}/{{ selectedRueda()?.slotCount ?? 10 }}
                  }
                  &mdash; {{ 'MONTHS.' + cm.month | translate }} {{ cm.year }}
                }
              </span>
              <button class="btn btn-xs btn-ghost" (click)="nextMonth()" [disabled]="activeMonthIndex() >= validMonths().length - 1">›</button>
            </div>
          }

          <button class="btn btn-outline btn-sm ml-auto" (click)="generate()"
            [disabled]="!selectedRuedaId() || !currentValidMonth() || generating() || allPaid() || selectedRueda()?.status !== 'active' || isJuntaNewRueda()">
            @if (generating()) { <span class="loading loading-spinner loading-xs"></span> }
            {{ 'PAYMENTS.GENERATE' | translate }}
          </button>
        </div>
        @if (selectedRueda() && selectedRueda()?.status !== 'active') {
          <div class="mt-3 alert alert-warning py-2 px-3 text-sm">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
            </svg>
            {{ 'RUEDAS.ERROR_NOT_ACTIVE' | translate }}
          </div>
        }
        @if (allPaid()) {
          <div class="mt-3 alert alert-success py-2 px-3 text-sm">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
            </svg>
            {{ 'PAYMENTS.ALL_PAID_WARNING' | translate }}
          </div>
        }
        @if (revertError()) {
          <div class="mt-3 alert alert-error py-2 px-3 text-sm">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
            {{ 'PAYMENTS.REVERT_COMPLETED_ERROR' | translate }}
          </div>
        }
      </div>

      <!-- Summary stats -->
      @if (service.payments().length > 0 && selectedRuedaId()) {
        <div class="stats shadow w-full mb-5">
          <div class="stat">
            <div class="stat-title text-xs">{{ 'PAYMENTS.TOTAL_COLLECTED' | translate }}</div>
            <div class="stat-value text-success text-xl">{{ service.summary.totalCollected | number:'1.0-0' }}</div>
            <div class="stat-desc">{{ service.summary.paidCount }} {{ 'PAYMENTS.PAID_SUFFIX' | translate }}</div>
          </div>
          <div class="stat">
            <div class="stat-title text-xs">{{ 'PAYMENTS.TOTAL_PENDING' | translate }}</div>
            <div class="stat-value text-warning text-xl">{{ service.summary.totalPending | number:'1.0-0' }}</div>
            <div class="stat-desc">{{ service.summary.pendingCount }} {{ 'PAYMENTS.PENDING_SUFFIX' | translate }}</div>
          </div>
        </div>
      }

      @if (service.loading()) {
        <div class="flex justify-center py-16">
          <span class="loading loading-spinner loading-lg text-primary"></span>
        </div>
      } @else if (!selectedRuedaId()) {
        <div class="text-center py-16 text-base-content/50 text-sm">
          {{ 'PAYMENTS.SELECT_RUEDA' | translate }}
        </div>
      } @else if (!isJuntaNewRueda() && service.payments().length === 0) {
        <div class="text-center py-16 text-base-content/50 text-sm">
          {{ 'PAYMENTS.EMPTY' | translate }}
        </div>
      } @else {
        @if (currentValidMonth(); as cm) {
          @if (isJuntaNewRueda()) {
            <div class="alert alert-info py-2 px-3 mb-3 text-sm">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              <span>{{ 'RUEDAS.TIMELINE_JUNTA_NEW_BANNER' | translate }}</span>
            </div>
          } @else {
            <div class="alert alert-info py-2 px-3 mb-3 text-sm">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 shrink-0" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
              <span>
                @if (cm.index === 1) {
                  {{ 'RUEDAS.TIMELINE_MONTH' | translate }} 1:
                } @else {
                  {{ 'RUEDAS.TIMELINE_MONTH' | translate }} {{ cm.index }}:
                }
                <strong>{{ getMemberByPosition(cm.index) }}</strong> {{ 'RUEDAS.TAKES_TURN' | translate }}
              </span>
            </div>
          }
        }
        @if (service.payments().length > 0) {
          <div class="overflow-x-auto rounded-box border border-base-300">
            <table class="table table-pin-rows w-full text-sm">
              <thead>
                <tr class="bg-base-200">
                  <th>{{ 'PAYMENTS.MEMBER' | translate }}</th>
                  <th>{{ 'PAYMENTS.TYPE' | translate }}</th>
                  <th class="text-right">{{ 'PAYMENTS.INSTALLMENT' | translate }}</th>
                  <th class="text-right">{{ 'PAYMENTS.CONTRIBUTION' | translate }}</th>
                  <th class="text-right">{{ 'PAYMENTS.TOTAL' | translate }}</th>
                  <th class="text-center">{{ 'PAYMENTS.STATUS' | translate }}</th>
                  @if (!isJuntaNewRueda()) {
                    <th class="text-center">{{ 'APP.ACTIONS' | translate }}</th>
                  }
                </tr>
              </thead>
              <tbody>
                @for (p of service.payments(); track p.id) {
                  <tr class="hover:bg-base-200/50" [class.opacity-60]="p.status === 'paid'">
                    <td class="font-medium">{{ p.memberName }}</td>
                    <td>
                      <span class="badge badge-xs badge-outline whitespace-nowrap"
                        [class.badge-primary]="p.paymentType === 'current_rueda'"
                        [class.badge-warning]="p.paymentType === 'previous_rueda'"
                        [class.badge-ghost]="p.paymentType === 'contribution_only'">
                        @if (p.paymentType === 'current_rueda') { {{ 'PAYMENTS.PAYMENT_TYPE_CURRENT' | translate }} }
                        @else if (p.paymentType === 'previous_rueda') { {{ 'PAYMENTS.PAYMENT_TYPE_PREVIOUS' | translate }} }
                        @else { {{ 'PAYMENTS.PAYMENT_TYPE_CONTRIBUTION' | translate }} }
                      </span>
                    </td>
                    <td class="text-right text-base-content/70">{{ p.installmentAmount | number:'1.0-0' }}</td>
                    <td class="text-right text-base-content/70">{{ p.contributionAmount | number:'1.0-0' }}</td>
                    <td class="text-right font-semibold">{{ p.totalAmount | number:'1.0-0' }}</td>
                    <td class="text-center">
                      <span class="badge badge-sm badge-outline"
                        [class.badge-success]="p.status === 'paid'"
                        [class.badge-warning]="p.status === 'pending'">
                        {{ (p.status === 'paid' ? 'PAYMENTS.PAID' : 'PAYMENTS.PENDING') | translate }}
                      </span>
                    </td>
                    @if (!isJuntaNewRueda()) {
                      <td class="text-center">
                        @if (p.status === 'pending') {
                          <button class="btn btn-circle btn-xs btn-success" [disabled]="toggling() === p.id" (click)="togglePaid(p.id, 'paid')">
                            @if (toggling() === p.id) { <span class="loading loading-spinner loading-xs"></span> }
                            @else { ✓ }
                          </button>
                        } @else {
                          <button class="btn btn-circle btn-xs btn-ghost text-error hover:bg-error hover:text-white" [disabled]="toggling() === p.id" (click)="togglePaid(p.id, 'unpaid')">
                            @if (toggling() === p.id) { <span class="loading loading-spinner loading-xs"></span> }
                            @else {
                              <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12"/>
                              </svg>
                            }
                          </button>
                        }
                      </td>
                    }
                  </tr>
                }
              </tbody>
              <tfoot>
                <tr class="font-bold bg-base-200">
                  <td colspan="4" class="text-right">{{ 'PAYMENTS.TOTAL' | translate }}:</td>
                  <td class="text-right">{{ totalAmount() | number:'1.0-0' }} Gs</td>
                  @if (!isJuntaNewRueda()) {
                    <td colspan="2"></td>
                  } @else {
                    <td></td>
                  }
                </tr>
              </tfoot>
            </table>
          </div>
        }
      }
    </div>
  `,
})
export class PaymentListComponent implements OnInit {
  readonly service = inject(PaymentsService);
  readonly ruedasService = inject(RuedasService);
  private readonly toast = inject(ToastService);
  private readonly route = inject(ActivatedRoute);

  private groupId = '';
  selectedRuedaId = signal('');
  generating = signal(false);
  toggling = signal('');
  revertError = signal(false);
  activeMonthIndex = signal(0);

  /** The selected rueda object */
  selectedRueda = computed<Rueda | null>(() =>
    this.ruedasService.ruedas().find(r => r.id === this.selectedRuedaId()) ?? null
  );

  /** slotCount + 1 valid months: 1 junta + N payment months */
  validMonths = computed<ValidMonth[]>(() => {
    const rueda = this.selectedRueda();
    if (!rueda) return [];
    const slotCount = rueda.slotCount ?? 15;
    const months: ValidMonth[] = [];
    for (let i = 0; i <= slotCount; i++) {
      const totalOffset = rueda.startMonth - 1 + i;
      const month = (totalOffset % 12) + 1;
      const year = rueda.startYear + Math.floor(totalOffset / 12);
      months.push({ month, year, label: `${month}/${year}`, index: i + 1 });
    }
    return months;
  });

  currentValidMonth = computed<ValidMonth | null>(() =>
    this.validMonths()[this.activeMonthIndex()] ?? null
  );

  totalAmount = computed(() =>
    this.service.payments().reduce((s, p) => s + p.totalAmount, 0)
  );

  allPaid = computed(() => {
    const list = this.service.payments();
    return list.length > 0 && list.every(p => p.status === 'paid');
  });

  isJuntaNewRueda = computed(() => {
    const rueda = this.selectedRueda();
    if (!rueda) return false;
    return rueda.type === 'continua' && this.activeMonthIndex() === this.validMonths().length - 1;
  });

  ngOnInit(): void {
    this.groupId = this.route.snapshot.parent?.paramMap.get('groupId') ?? '';
    this.ruedasService.loadByGroup(this.groupId);
    this.service.clearPayments();
  }

  onRuedaChange(ruedaId: string): void {
    this.selectedRuedaId.set(ruedaId);
    this.revertError.set(false);
    if (!ruedaId) {
      this.activeMonthIndex.set(0);
      this.service.clearPayments();
      return;
    }
    // Auto-select the month closest to today, clamped to valid range
    const rueda = this.ruedasService.ruedas().find(r => r.id === ruedaId);
    if (!rueda) return;
    const now = new Date();
    const nowMonth = now.getMonth() + 1;
    const nowYear = now.getFullYear();
    const months = this.validMonths();
    const idx = months.findIndex(m => m.year === nowYear && m.month === nowMonth);
    const maxIdx = Math.max(0, months.length - 2);
    this.activeMonthIndex.set(Math.min(idx >= 0 ? idx : 0, maxIdx));
    this.load();
  }

  prevMonth(): void {
    if (this.activeMonthIndex() > 0) {
      this.activeMonthIndex.update(i => i - 1);
      this.revertError.set(false);
      this.load();
    }
  }

  nextMonth(): void {
    if (this.activeMonthIndex() < this.validMonths().length - 2) {
      this.activeMonthIndex.update(i => i + 1);
      this.revertError.set(false);
      this.load();
    }
  }

  load(): void {
    const cm = this.currentValidMonth();
    if (!this.selectedRuedaId() || !cm) return;
    this.service.loadByMonth(this.groupId, this.selectedRuedaId(), cm.month, cm.year);
  }

  generate(): void {
    const cm = this.currentValidMonth();
    if (!this.selectedRuedaId() || !cm) return;
    this.generating.set(true);
    this.service.generate(this.groupId, this.selectedRuedaId(), { month: cm.month, year: cm.year }).subscribe({
      next: () => {
        this.generating.set(false);
        this.load();
        this.toast.success('TOAST.PAYMENTS_GENERATED');
      },
      error: () => {
        this.generating.set(false);
        this.toast.error('TOAST.PAYMENTS_GENERATE_ERROR');
      },
    });
  }

  getMemberByPosition(position: number): string | null {
    const payments = this.service.payments();

    for (const p of payments) {
      if (p.installmentNumber === position) {
        return p.memberName || null;
      }
    }
    return null;
  }

  togglePaid(paymentId: string, action: 'paid' | 'unpaid'): void {
    if (action === 'unpaid' && this.selectedRueda()?.status === 'completed') {
      this.revertError.set(true);
      return;
    }
    this.revertError.set(false);
    this.toggling.set(paymentId);
    const obs = action === 'paid'
      ? this.service.markPaid(this.groupId, this.selectedRuedaId(), paymentId)
      : this.service.markUnpaid(this.groupId, this.selectedRuedaId(), paymentId);
    obs.subscribe({
      next: () => {
        this.toggling.set('');
        this.ruedasService.loadByGroup(this.groupId);
        this.toast.success(action === 'paid' ? 'TOAST.PAYMENT_REGISTERED' : 'TOAST.PAYMENT_REVERTED');
      },
      error: () => {
        this.toggling.set('');
        this.toast.error(action === 'paid' ? 'TOAST.PAYMENT_REGISTER_ERROR' : 'TOAST.PAYMENT_REVERT_ERROR');
      },
    });
  }
}
