import { Component, inject, OnInit, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { CashBoxService } from '../../services/cash-box.service';
import { CreateMovementRequest } from '../../models/cash-box.model';

@Component({
  selector: 'app-cash-box',
  standalone: true,
  imports: [FormsModule, DecimalPipe, TranslateModule],
  template: `
    <div>
      <div class="flex items-center justify-between mb-2">
        <h2 class="text-2xl font-bold tracking-tight">{{ 'CASH_BOX.TITLE' | translate }}</h2>
        <button class="btn btn-primary btn-sm" (click)="openModal()">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
          </svg>
          {{ 'CASH_BOX.ADD_MOVEMENT' | translate }}
        </button>
      </div>
      <div class="divider mt-0 mb-6"></div>

      <!-- Stats -->
      <div class="stats stats-vertical md:stats-horizontal shadow w-full mb-6">
        <div class="stat">
          <div class="stat-title">{{ 'CASH_BOX.TYPE_IN' | translate }}</div>
          <div class="stat-value text-success text-xl">{{ service.balance().totalIn | number:'1.0-0' }} Gs</div>
        </div>
        <div class="stat">
          <div class="stat-title">{{ 'CASH_BOX.TYPE_OUT' | translate }}</div>
          <div class="stat-value text-error text-xl">{{ service.balance().totalOut | number:'1.0-0' }} Gs</div>
        </div>
        <div class="stat">
          <div class="stat-title">{{ 'CASH_BOX.BALANCE' | translate }}</div>
          <div class="stat-value text-xl"
            [class.text-success]="service.balance().balance >= 0"
            [class.text-error]="service.balance().balance < 0">
            {{ service.balance().balance | number:'1.0-0' }} Gs
          </div>
        </div>
      </div>

      <!-- Movements list -->
      <h3 class="font-semibold text-base mb-3">{{ 'CASH_BOX.MOVEMENTS' | translate }}</h3>

      @if (service.loading()) {
        <div class="flex justify-center py-16">
          <span class="loading loading-spinner loading-lg text-primary"></span>
        </div>
      } @else if (service.movements().length === 0) {
        <div class="text-center py-16 text-base-content/50 text-sm">
          {{ 'CASH_BOX.EMPTY' | translate }}
        </div>
      } @else {
        <div class="overflow-x-auto rounded-box border border-base-300">
          <table class="table table-pin-rows w-full text-sm">
            <thead>
              <tr class="bg-base-200">
                <th>{{ 'CASH_BOX.DATE' | translate }}</th>
                <th>Tipo</th>
                <th>{{ 'CASH_BOX.DESCRIPTION' | translate }}</th>
                <th>{{ 'CASH_BOX.CATEGORY' | translate }}</th>
                <th class="text-right">{{ 'CASH_BOX.AMOUNT' | translate }}</th>
              </tr>
            </thead>
            <tbody>
              @for (m of service.movements(); track m.id) {
                <tr class="hover:bg-base-200/50">
                  <td class="text-base-content/60">{{ 'MONTHS.' + m.month | translate }} {{ m.year }}</td>
                  <td>
                    <span class="badge badge-sm badge-outline"
                      [class.badge-success]="m.type === 'in'"
                      [class.badge-error]="m.type === 'out'">
                      {{ (m.type === 'in' ? 'CASH_BOX.TYPE_IN' : 'CASH_BOX.TYPE_OUT') | translate }}
                    </span>
                  </td>
                  <td>{{ m.description }}</td>
                  <td class="text-base-content/60">{{ m.category || '-' }}</td>
                  <td class="text-right font-semibold"
                    [class.text-success]="m.type === 'in'"
                    [class.text-error]="m.type === 'out'">
                    {{ m.type === 'out' ? '-' : '+' }}{{ m.amount | number:'1.0-0' }} Gs
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      }
    </div>

    <!-- Add Movement Modal -->
    @if (showModal()) {
      <div class="modal modal-open">
        <div class="modal-box">
          <h3 class="font-bold text-lg mb-1">{{ 'CASH_BOX.ADD_MOVEMENT' | translate }}</h3>
          <p class="text-sm text-base-content/50 mb-4">Registra un nuevo movimiento en la caja.</p>

          <fieldset class="fieldset mb-3">
            <legend class="fieldset-legend">Tipo</legend>
            <div class="join w-full">
              <button type="button" class="btn join-item flex-1"
                [class.btn-success]="form.type === 'in'"
                [class.btn-outline]="form.type !== 'in'"
                (click)="form.type = 'in'">
                {{ 'CASH_BOX.TYPE_IN' | translate }}
              </button>
              <button type="button" class="btn join-item flex-1"
                [class.btn-error]="form.type === 'out'"
                [class.btn-outline]="form.type !== 'out'"
                (click)="form.type = 'out'">
                {{ 'CASH_BOX.TYPE_OUT' | translate }}
              </button>
            </div>
          </fieldset>

          <fieldset class="fieldset mb-3">
            <legend class="fieldset-legend">{{ 'CASH_BOX.AMOUNT' | translate }} (Gs)</legend>
            <input type="number" class="input input-bordered w-full" [(ngModel)]="form.amount" min="0" />
          </fieldset>

          <fieldset class="fieldset mb-3">
            <legend class="fieldset-legend">{{ 'CASH_BOX.DESCRIPTION' | translate }}</legend>
            <input type="text" class="input input-bordered w-full" [(ngModel)]="form.description" />
          </fieldset>

          <fieldset class="fieldset mb-3">
            <legend class="fieldset-legend">{{ 'CASH_BOX.CATEGORY' | translate }}</legend>
            <select class="select select-bordered w-full" [(ngModel)]="form.category">
              <option value="contribution">Aporte</option>
              <option value="rueda_collection">Cobro rueda</option>
              <option value="rueda_disbursement">Desembolso rueda</option>
              <option value="parallel_loan_payment">Pago préstamo paralelo</option>
              <option value="parallel_loan_disbursement">Desembolso préstamo paralelo</option>
              <option value="member_entry">Ingreso de miembro</option>
              <option value="member_exit">Salida de miembro</option>
              <option value="adjustment">Ajuste</option>
            </select>
          </fieldset>

          <div class="grid grid-cols-2 gap-3 mb-4">
            <fieldset class="fieldset">
              <legend class="fieldset-legend">{{ 'PAYMENTS.MONTH' | translate }}</legend>
              <select class="select select-bordered w-full" [(ngModel)]="form.month">
                @for (m of months; track m.value) {
                  <option [ngValue]="m.value">{{ 'MONTHS.' + m.value | translate }}</option>
                }
              </select>
            </fieldset>
            <fieldset class="fieldset">
              <legend class="fieldset-legend">{{ 'PAYMENTS.YEAR' | translate }}</legend>
              <input type="number" class="input input-bordered w-full" [(ngModel)]="form.year" />
            </fieldset>
          </div>

          <div class="divider my-2"></div>
          <div class="modal-action mt-0">
            <button class="btn btn-ghost" (click)="closeModal()">{{ 'APP.CANCEL' | translate }}</button>
            <button class="btn btn-primary" [disabled]="saving()" (click)="save()">
              @if (saving()) { <span class="loading loading-spinner loading-xs"></span> }
              {{ 'APP.SAVE' | translate }}
            </button>
          </div>
        </div>
        <div class="modal-backdrop" (click)="closeModal()"></div>
      </div>
    }
  `,
})
export class CashBoxComponent implements OnInit {
  readonly service = inject(CashBoxService);
  private readonly route = inject(ActivatedRoute);

  private groupId = '';
  saving = signal(false);
  showModal = signal(false);

  form: CreateMovementRequest = {
    type: 'in',
    amount: 0,
    description: '',
    category: 'adjustment',
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
  };

  months = Array.from({ length: 12 }, (_, i) => ({ value: i + 1 }));

  ngOnInit(): void {
    this.groupId = this.route.snapshot.parent?.paramMap.get('groupId') ?? '';
    this.service.loadBalance(this.groupId);
    this.service.loadMovements(this.groupId);
  }

  openModal(): void {
    this.form = { type: 'in', amount: 0, description: '', category: '', month: new Date().getMonth() + 1, year: new Date().getFullYear() };
    this.showModal.set(true);
  }

  closeModal(): void { this.showModal.set(false); }

  save(): void {
    if (!this.form.amount || !this.form.description) return;
    this.saving.set(true);
    this.service.addMovement(this.groupId, this.form).subscribe({
      next: () => { this.saving.set(false); this.closeModal(); },
      error: () => this.saving.set(false),
    });
  }
}
