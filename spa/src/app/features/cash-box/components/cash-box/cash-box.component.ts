import { Component, inject, OnInit, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { CashBoxService } from '../../services/cash-box.service';
import { AddMovementDialogComponent } from '../add-movement-dialog/add-movement-dialog.component';

@Component({
  selector: 'app-cash-box',
  standalone: true,
  imports: [DecimalPipe, TranslateModule, AddMovementDialogComponent],
  template: `
    <div>
      <div class="flex items-center justify-between mb-2">
        <h2 class="text-2xl font-bold tracking-tight">{{ 'CASH_BOX.TITLE' | translate }}</h2>
        <button class="btn btn-primary btn-sm" (click)="showModal.set(true)">
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

    <app-add-movement-dialog
      [show]="showModal()"
      [groupId]="groupId"
      (closed)="showModal.set(false)"
      (saved)="showModal.set(false)" />
  `,
})
export class CashBoxComponent implements OnInit {
  readonly service = inject(CashBoxService);
  private readonly route = inject(ActivatedRoute);

  groupId = '';
  showModal = signal(false);

  ngOnInit(): void {
    this.groupId = this.route.snapshot.parent?.paramMap.get('groupId') ?? '';
    this.service.loadBalance(this.groupId);
    this.service.loadMovements(this.groupId);
  }
}
