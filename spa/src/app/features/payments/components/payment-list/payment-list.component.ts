import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { PaymentsService } from '../../services/payments.service';
import { RuedasService } from '../../../ruedas/services/ruedas.service';
import { DecimalPipe } from '@angular/common';

@Component({
  selector: 'app-payment-list',
  standalone: true,
  imports: [FormsModule, DecimalPipe, TranslateModule],
  template: `
    <div class="p-4">
      <div class="flex flex-wrap justify-between items-center mb-4 gap-2">
        <h2 class="text-xl font-bold">{{ 'PAYMENTS.TITLE' | translate }}</h2>

        <!-- Month/Year + Rueda selector -->
        <div class="flex flex-wrap gap-2 items-center">
          <select class="select select-bordered select-sm" [(ngModel)]="selectedRuedaId" (ngModelChange)="onRuedaChange()">
            <option value="">-- Rueda --</option>
            @for (r of ruedasService.ruedas(); track r.id) {
              <option [value]="r.id">{{ 'RUEDAS.NUMBER' | translate }} {{ r.ruedaNumber }}</option>
            }
          </select>
          <select class="select select-bordered select-sm" [(ngModel)]="selectedMonth" (ngModelChange)="load()">
            @for (m of months; track m.value) {
              <option [ngValue]="m.value">{{ 'MONTHS.' + m.value | translate }}</option>
            }
          </select>
          <input type="number" class="input input-bordered input-sm w-24" [(ngModel)]="selectedYear" (change)="load()" />
          <button class="btn btn-outline btn-sm" (click)="generate()" [disabled]="!selectedRuedaId || generating()">
            @if (generating()) { <span class="loading loading-spinner loading-xs"></span> }
            {{ 'PAYMENTS.GENERATE' | translate }}
          </button>
        </div>
      </div>

      <!-- Summary cards -->
      @if (service.payments().length > 0) {
        <div class="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          <div class="stat bg-base-200 rounded-box p-3">
            <div class="stat-title text-xs">{{ 'PAYMENTS.TOTAL_COLLECTED' | translate }}</div>
            <div class="stat-value text-success text-lg">{{ service.summary.totalCollected | number:'1.0-0' }}</div>
            <div class="stat-desc">{{ service.summary.paidCount }} pagos</div>
          </div>
          <div class="stat bg-base-200 rounded-box p-3">
            <div class="stat-title text-xs">{{ 'PAYMENTS.TOTAL_PENDING' | translate }}</div>
            <div class="stat-value text-warning text-lg">{{ service.summary.totalPending | number:'1.0-0' }}</div>
            <div class="stat-desc">{{ service.summary.pendingCount }} pendientes</div>
          </div>
        </div>
      }

      @if (service.loading()) {
        <div class="flex justify-center py-8">
          <span class="loading loading-spinner loading-md"></span>
        </div>
      } @else if (service.payments().length === 0) {
        <div class="text-center py-8 text-base-content/50">
          {{ 'PAYMENTS.EMPTY' | translate }}
        </div>
      } @else {
        <div class="overflow-x-auto">
          <table class="table table-zebra w-full text-sm">
            <thead>
              <tr>
                <th>{{ 'PAYMENTS.MEMBER' | translate }}</th>
                <th>Tipo</th>
                <th class="text-right">{{ 'PAYMENTS.INSTALLMENT' | translate }}</th>
                <th class="text-right">{{ 'PAYMENTS.CONTRIBUTION' | translate }}</th>
                <th class="text-right">{{ 'PAYMENTS.TOTAL' | translate }}</th>
                <th class="text-center">{{ 'PAYMENTS.STATUS' | translate }}</th>
                <th class="text-center">{{ 'APP.ACTIONS' | translate }}</th>
              </tr>
            </thead>
            <tbody>
              @for (p of service.payments(); track p.id) {
                <tr [class.opacity-60]="p.status === 'paid'">
                  <td class="font-medium">{{ p.memberName }}</td>
                  <td>
                    <span class="badge badge-xs"
                      [class.badge-primary]="p.paymentType === 'current_rueda'"
                      [class.badge-secondary]="p.paymentType === 'previous_rueda'"
                      [class.badge-ghost]="p.paymentType === 'contribution_only'">
                      @if (p.paymentType === 'current_rueda') { {{ 'PAYMENTS.PAYMENT_TYPE_CURRENT' | translate }} }
                      @else if (p.paymentType === 'previous_rueda') { {{ 'PAYMENTS.PAYMENT_TYPE_PREVIOUS' | translate }} }
                      @else { {{ 'PAYMENTS.PAYMENT_TYPE_CONTRIBUTION' | translate }} }
                    </span>
                  </td>
                  <td class="text-right">{{ p.installmentAmount | number:'1.0-0' }}</td>
                  <td class="text-right">{{ p.contributionAmount | number:'1.0-0' }}</td>
                  <td class="text-right font-semibold">{{ p.totalAmount | number:'1.0-0' }}</td>
                  <td class="text-center">
                    <span class="badge badge-sm" [class.badge-success]="p.status === 'paid'" [class.badge-warning]="p.status === 'pending'">
                      {{ (p.status === 'paid' ? 'PAYMENTS.PAID' : 'PAYMENTS.PENDING') | translate }}
                    </span>
                  </td>
                  <td class="text-center">
                    @if (p.status === 'pending') {
                      <button class="btn btn-success btn-xs" [disabled]="toggling() === p.id" (click)="togglePaid(p.id, 'paid')">
                        @if (toggling() === p.id) { <span class="loading loading-spinner loading-xs"></span> }
                        @else { ✓ }
                      </button>
                    } @else {
                      <button class="btn btn-ghost btn-xs" [disabled]="toggling() === p.id" (click)="togglePaid(p.id, 'unpaid')">
                        @if (toggling() === p.id) { <span class="loading loading-spinner loading-xs"></span> }
                        @else { ✗ }
                      </button>
                    }
                  </td>
                </tr>
              }
            </tbody>
            <tfoot>
              <tr class="font-bold">
                <td colspan="4" class="text-right">Total:</td>
                <td class="text-right">{{ totalAmount() | number:'1.0-0' }} Gs</td>
                <td colspan="2"></td>
              </tr>
            </tfoot>
          </table>
        </div>
      }
    </div>
  `,
})
export class PaymentListComponent implements OnInit {
  readonly service = inject(PaymentsService);
  readonly ruedasService = inject(RuedasService);
  private readonly route = inject(ActivatedRoute);

  private groupId = '';
  selectedRuedaId = '';
  selectedMonth = new Date().getMonth() + 1;
  selectedYear = new Date().getFullYear();
  generating = signal(false);
  toggling = signal('');

  months = Array.from({ length: 12 }, (_, i) => ({ value: i + 1 }));

  totalAmount = computed(() =>
    this.service.payments().reduce((s, p) => s + p.totalAmount, 0)
  );

  ngOnInit(): void {
    this.groupId = this.route.snapshot.parent?.paramMap.get('groupId') ?? '';
    this.ruedasService.loadByGroup(this.groupId);
  }

  onRuedaChange(): void {
    if (this.selectedRuedaId) this.load();
  }

  load(): void {
    if (!this.selectedRuedaId) return;
    this.service.loadByMonth(this.groupId, this.selectedRuedaId, this.selectedMonth, this.selectedYear);
  }

  generate(): void {
    if (!this.selectedRuedaId) return;
    this.generating.set(true);
    this.service.generate(this.groupId, this.selectedRuedaId, { month: this.selectedMonth, year: this.selectedYear }).subscribe({
      next: () => this.generating.set(false),
      error: () => this.generating.set(false),
    });
  }

  togglePaid(paymentId: string, action: 'paid' | 'unpaid'): void {
    this.toggling.set(paymentId);
    const obs = action === 'paid'
      ? this.service.markPaid(this.groupId, this.selectedRuedaId, paymentId)
      : this.service.markUnpaid(this.groupId, this.selectedRuedaId, paymentId);
    obs.subscribe({
      next: () => this.toggling.set(''),
      error: () => this.toggling.set(''),
    });
  }
}
