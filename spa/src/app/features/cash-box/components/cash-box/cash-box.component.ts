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
    <div class="p-4">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-xl font-bold">{{ 'CASH_BOX.TITLE' | translate }}</h2>
        <button class="btn btn-primary btn-sm" (click)="openModal()">
          {{ 'CASH_BOX.ADD_MOVEMENT' | translate }}
        </button>
      </div>

      <!-- Balance card -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
        <div class="stat bg-success/10 rounded-box p-4">
          <div class="stat-title">{{ 'CASH_BOX.TYPE_IN' | translate }}</div>
          <div class="stat-value text-success text-xl">{{ service.balance().totalIn | number:'1.0-0' }} Gs</div>
        </div>
        <div class="stat bg-error/10 rounded-box p-4">
          <div class="stat-title">{{ 'CASH_BOX.TYPE_OUT' | translate }}</div>
          <div class="stat-value text-error text-xl">{{ service.balance().totalOut | number:'1.0-0' }} Gs</div>
        </div>
        <div class="stat bg-primary/10 rounded-box p-4">
          <div class="stat-title">{{ 'CASH_BOX.BALANCE' | translate }}</div>
          <div class="stat-value text-primary text-xl"
            [class.text-success]="service.balance().balance >= 0"
            [class.text-error]="service.balance().balance < 0">
            {{ service.balance().balance | number:'1.0-0' }} Gs
          </div>
        </div>
      </div>

      <!-- Movements list -->
      <h3 class="font-semibold mb-2">{{ 'CASH_BOX.MOVEMENTS' | translate }}</h3>

      @if (service.loading()) {
        <div class="flex justify-center py-8">
          <span class="loading loading-spinner loading-md"></span>
        </div>
      } @else if (service.movements().length === 0) {
        <div class="text-center py-8 text-base-content/50">
          {{ 'CASH_BOX.EMPTY' | translate }}
        </div>
      } @else {
        <div class="overflow-x-auto">
          <table class="table table-zebra w-full text-sm">
            <thead>
              <tr>
                <th>{{ 'CASH_BOX.DATE' | translate }}</th>
                <th>{{ 'CASH_BOX.TYPE_IN' | translate }} / {{ 'CASH_BOX.TYPE_OUT' | translate }}</th>
                <th>{{ 'CASH_BOX.DESCRIPTION' | translate }}</th>
                <th>{{ 'CASH_BOX.CATEGORY' | translate }}</th>
                <th class="text-right">{{ 'CASH_BOX.AMOUNT' | translate }}</th>
              </tr>
            </thead>
            <tbody>
              @for (m of service.movements(); track m.id) {
                <tr>
                  <td>{{ 'MONTHS.' + m.month | translate }} {{ m.year }}</td>
                  <td>
                    <span class="badge badge-sm" [class.badge-success]="m.type === 'in'" [class.badge-error]="m.type === 'out'">
                      {{ (m.type === 'in' ? 'CASH_BOX.TYPE_IN' : 'CASH_BOX.TYPE_OUT') | translate }}
                    </span>
                  </td>
                  <td>{{ m.description }}</td>
                  <td>{{ m.category ?? '-' }}</td>
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
          <h3 class="font-bold text-lg mb-4">{{ 'CASH_BOX.ADD_MOVEMENT' | translate }}</h3>

          <div class="form-control mb-3">
            <label class="label"><span class="label-text">Tipo</span></label>
            <div class="join">
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
          </div>

          <div class="form-control mb-3">
            <label class="label"><span class="label-text">{{ 'CASH_BOX.AMOUNT' | translate }} (Gs)</span></label>
            <input type="number" class="input input-bordered" [(ngModel)]="form.amount" min="0" />
          </div>

          <div class="form-control mb-3">
            <label class="label"><span class="label-text">{{ 'CASH_BOX.DESCRIPTION' | translate }}</span></label>
            <input type="text" class="input input-bordered" [(ngModel)]="form.description" />
          </div>

          <div class="form-control mb-3">
            <label class="label"><span class="label-text">{{ 'CASH_BOX.CATEGORY' | translate }}</span></label>
            <input type="text" class="input input-bordered" [(ngModel)]="form.category" />
          </div>

          <div class="grid grid-cols-2 gap-3 mb-4">
            <div class="form-control">
              <label class="label"><span class="label-text">{{ 'PAYMENTS.MONTH' | translate }}</span></label>
              <select class="select select-bordered" [(ngModel)]="form.month">
                @for (m of months; track m.value) {
                  <option [ngValue]="m.value">{{ 'MONTHS.' + m.value | translate }}</option>
                }
              </select>
            </div>
            <div class="form-control">
              <label class="label"><span class="label-text">{{ 'PAYMENTS.YEAR' | translate }}</span></label>
              <input type="number" class="input input-bordered" [(ngModel)]="form.year" />
            </div>
          </div>

          <div class="modal-action">
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
    category: '',
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
