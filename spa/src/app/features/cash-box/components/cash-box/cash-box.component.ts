import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { CashBoxService } from '../../services/cash-box.service';
import { CashMovement } from '../../models/cash-box.model';
import { AddMovementDialogComponent } from '../add-movement-dialog/add-movement-dialog.component';
import { ToastService } from '../../../../core/services/toast.service';

@Component({
  selector: 'app-cash-box',
  standalone: true,
  imports: [DecimalPipe, TranslateModule, AddMovementDialogComponent],
  template: `
    <div>
      <div class="flex items-center justify-between mb-2">
        <h2 class="text-2xl font-bold tracking-tight">{{ 'CASH_BOX.TITLE' | translate }}</h2>
        <button class="btn btn-primary btn-sm" (click)="openCreateModal()">
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
      } @else if (sortedMovements().length === 0) {
        <div class="text-center py-16 text-base-content/50 text-sm">
          {{ 'CASH_BOX.EMPTY' | translate }}
        </div>
      } @else {
        <div class="space-y-2">
          @for (group of groupedByRueda(); track group[0]) {
            <div class="collapse collapse-arrow border border-base-300 rounded-lg">
              <input type="checkbox" />
              <div class="collapse-title font-medium bg-base-200">
                <div class="flex items-center justify-between">
                  <span>{{ group[0] }}</span>
                  <div class="flex gap-4 text-sm mr-8">
                    <span class="text-success">+ {{ group[1].totalIn | number:'1.0-0' }} Gs</span>
                    <span class="text-error">- {{ group[1].totalOut | number:'1.0-0' }} Gs</span>
                  </div>
                </div>
              </div>
              <div class="collapse-content">
                <div class="overflow-x-auto mt-3">
                  <table class="table table-sm w-full text-sm">
                    <thead>
                      <tr class="bg-base-200">
                        <th>{{ 'CASH_BOX.DATE' | translate }}</th>
                        <th>{{ 'CASH_BOX.TYPE' | translate }}</th>
                        <th>{{ 'CASH_BOX.DESCRIPTION' | translate }}</th>
                        <th>{{ 'CASH_BOX.CATEGORY' | translate }}</th>
                        <th class="text-right">{{ 'CASH_BOX.AMOUNT' | translate }}</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      @for (m of group[1].movements; track m.id) {
                        <tr class="hover:bg-base-200/50">
                          <td class="text-base-content/60 whitespace-nowrap">{{ 'MONTHS.' + m.month | translate }} {{ m.year }}</td>
                          <td>
                            <span class="badge badge-xs badge-outline"
                              [class.badge-success]="m.type === 'in'"
                              [class.badge-error]="m.type === 'out'">
                              {{ (m.type === 'in' ? 'CASH_BOX.TYPE_IN' : 'CASH_BOX.TYPE_OUT') | translate }}
                            </span>
                          </td>
                          <td>{{ m.description }}</td>
                          <td class="text-base-content/60">
                            {{ m.category ? ('CASH_BOX.CATEGORY_' + m.category | translate) : '-' }}
                          </td>
                          <td class="text-right font-semibold whitespace-nowrap"
                            [class.text-success]="m.type === 'in'"
                            [class.text-error]="m.type === 'out'">
                            {{ m.type === 'out' ? '-' : '+' }}{{ m.amount | number:'1.0-0' }} Gs
                          </td>
                          <td class="text-right whitespace-nowrap">
                            @if (m.sourceType === 'manual') {
                              @if (deletingId() === m.id) {
                                <span class="text-xs text-error mr-1">{{ 'CASH_BOX.DELETE_CONFIRM_Q' | translate }}</span>
                                <button class="btn btn-error btn-xs mr-1" [disabled]="deleting()" (click)="confirmDelete(m.id)">
                                  @if (deleting()) { <span class="loading loading-spinner loading-xs"></span> }
                                  {{ 'APP.YES' | translate }}
                                </button>
                                <button class="btn btn-ghost btn-xs" (click)="cancelDelete()">{{ 'APP.NO' | translate }}</button>
                              } @else {
                                <button class="btn btn-ghost btn-xs" (click)="openEditModal(m)">
                                  {{ 'APP.EDIT' | translate }}
                                </button>
                                <button class="btn btn-ghost btn-xs text-error" (click)="askDelete(m.id)">
                                  {{ 'APP.DELETE' | translate }}
                                </button>
                              }
                            }
                          </td>
                        </tr>
                      }
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          }
        </div>
      }
    </div>

    <app-add-movement-dialog
      [show]="showModal()"
      [groupId]="groupId"
      [editMovement]="editingMovement()"
      (closed)="closeModal()"
      (saved)="closeModal()" />
  `,
})
export class CashBoxComponent implements OnInit {
  readonly service = inject(CashBoxService);
  private readonly route = inject(ActivatedRoute);
  private readonly toast = inject(ToastService);

  groupId = '';
  showModal = signal(false);
  editingMovement = signal<CashMovement | null>(null);
  deletingId = signal<string | null>(null);
  deleting = signal(false);

  sortedMovements = computed(() =>
    [...this.service.movements()].sort((a, b) => {
      if (a.year !== b.year) return b.year - a.year;
      return b.month - a.month;
    }),
  );

  groupedByRueda = computed(() => {
    const groups = new Map<string, { movements: CashMovement[]; totalIn: number; totalOut: number }>();

    for (const m of this.sortedMovements()) {
      const ruedaMatch = m.description?.match(/Rueda (\d+)/);
      const ruedaKey = ruedaMatch ? `Rueda ${ruedaMatch[1]}` : 'Otros';

      if (!groups.has(ruedaKey)) {
        groups.set(ruedaKey, { movements: [], totalIn: 0, totalOut: 0 });
      }

      const group = groups.get(ruedaKey)!;
      group.movements.push(m);
      if (m.type === 'in') group.totalIn += m.amount;
      else group.totalOut += m.amount;
    }

    return Array.from(groups.entries()).sort((a, b) => {
      const aNum = parseInt(a[0].split(' ')[1]) || Infinity;
      const bNum = parseInt(b[0].split(' ')[1]) || Infinity;
      return bNum - aNum;
    });
  });

  ngOnInit(): void {
    this.groupId = this.route.snapshot.parent?.paramMap.get('groupId') ?? '';
    this.service.loadBalance(this.groupId);
    this.service.loadMovements(this.groupId);
  }

  openCreateModal(): void {
    this.editingMovement.set(null);
    this.showModal.set(true);
  }

  openEditModal(movement: CashMovement): void {
    this.editingMovement.set(movement);
    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
    this.editingMovement.set(null);
  }

  askDelete(id: string): void {
    this.deletingId.set(id);
  }

  cancelDelete(): void {
    this.deletingId.set(null);
  }

  confirmDelete(id: string): void {
    this.deleting.set(true);
    this.service.deleteMovement(this.groupId, id).subscribe({
      next: () => {
        this.deletingId.set(null);
        this.deleting.set(false);
        this.toast.success('TOAST.MOVEMENT_DELETED');
      },
      error: () => {
        this.deleting.set(false);
        this.toast.error('TOAST.MOVEMENT_DELETE_ERROR');
      },
    });
  }
}
