import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DecimalPipe } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { RuedasService } from '../../services/ruedas.service';
import { MembersService } from '../../../members/services/members.service';
import { Rueda } from '../../models/rueda.model';
import { CreateRuedaDialogComponent } from '../create-rueda-dialog/create-rueda-dialog.component';
import { EditRuedaDialogComponent } from '../edit-rueda-dialog/edit-rueda-dialog.component';
import { RuedaTimelineComponent } from '../rueda-timeline/rueda-timeline.component';

@Component({
  selector: 'app-rueda-list',
  standalone: true,
  imports: [DecimalPipe, TranslateModule, CreateRuedaDialogComponent, EditRuedaDialogComponent, RuedaTimelineComponent],
  template: `
    <div>
      <div class="flex items-center justify-between mb-2">
        <h2 class="text-2xl font-bold tracking-tight">{{ 'RUEDAS.TITLE' | translate }}</h2>
        <button class="btn btn-primary btn-sm" (click)="showCreateModal.set(true)">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
          </svg>
          {{ 'RUEDAS.NEW' | translate }}
        </button>
      </div>
      <div class="divider mt-0 mb-6"></div>

      @if (service.loading()) {
        <div class="flex justify-center py-16">
          <span class="loading loading-spinner loading-lg text-primary"></span>
        </div>
      } @else if (service.ruedas().length === 0) {
        <div class="text-center py-16 text-base-content/50 text-sm">
          {{ 'RUEDAS.EMPTY' | translate }}
        </div>
      } @else {
        <div class="grid gap-4">
          @for (r of service.ruedas(); track r.id) {
            <div class="card bg-base-200 border border-base-300">
              <div class="card-body p-5">
                <!-- Card header: number + status + actions -->
                <div class="flex items-center justify-between mb-3">
                  <h3 class="font-bold text-base">
                    {{ 'RUEDAS.NUMBER' | translate }} {{ r.ruedaNumber }}
                  </h3>
                  <div class="flex items-center gap-2">
                    <span class="badge badge-sm"
                      [class.badge-warning]="r.status === 'pending'"
                      [class.badge-success]="r.status === 'active'"
                      [class.badge-neutral]="r.status === 'completed'">
                      {{ ('RUEDAS.STATUS_' + r.status.toUpperCase()) | translate }}
                    </span>
                    <!-- Edit button -->
                    <button class="btn btn-ghost btn-xs" (click)="openEdit(r)" [title]="'RUEDAS.EDIT' | translate">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
                      </svg>
                    </button>
                    <!-- Delete button -->
                    <button class="btn btn-ghost btn-xs text-error"
                      [disabled]="deleting() === r.id"
                      (click)="confirmDelete(r)"
                      [title]="'RUEDAS.DELETE' | translate">
                      @if (deleting() === r.id) {
                        <span class="loading loading-spinner loading-xs"></span>
                      } @else {
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9 7h6m2 0a1 1 0 01-1 1H8a1 1 0 01-1-1m2-4h4a1 1 0 011 1v1H8V4a1 1 0 011-1z"/>
                        </svg>
                      }
                    </button>
                  </div>
                </div>
                <p class="text-xs text-base-content/50 -mt-2 mb-3">
                  {{ r.type === 'new' ? ('RUEDAS.TYPE_NEW' | translate) : ('RUEDAS.TYPE_CONTINUA' | translate) }}
                  &bull; {{ 'MONTHS.' + r.startMonth | translate }} {{ r.startYear }}
                </p>
                <!-- Financial info: 3 columns -->
                <div class="grid grid-cols-3 gap-3">
                  <div class="bg-base-100 rounded-lg p-3">
                    <p class="text-xs text-base-content/50 mb-0.5">{{ 'RUEDAS.LOAN_AMOUNT' | translate }}</p>
                    <p class="font-semibold text-sm">{{ r.loanAmount | number:'1.0-0' }} Gs</p>
                  </div>
                  <div class="bg-base-100 rounded-lg p-3">
                    <p class="text-xs text-base-content/50 mb-0.5">{{ 'RUEDAS.INSTALLMENT' | translate }}</p>
                    <p class="font-semibold text-sm">{{ r.installmentAmount | number:'1.0-0' }} Gs</p>
                  </div>
                  <div class="bg-base-100 rounded-lg p-3">
                    <p class="text-xs text-base-content/50 mb-0.5">{{ 'RUEDAS.CONTRIBUTION' | translate }}</p>
                    <p class="font-semibold text-sm">{{ r.contributionAmount | number:'1.0-0' }} Gs</p>
                  </div>
                </div>
                <div class="flex items-center justify-between mt-4">
                  <button class="btn btn-ghost btn-xs gap-1" (click)="toggleTimeline(r.id)">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                    </svg>
                    {{ 'RUEDAS.TIMELINE' | translate }}
                  </button>
                  @if (r.status !== 'completed') {
                    <div class="flex gap-2">
                      @if (r.status === 'pending') {
                        <button class="btn btn-success btn-sm"
                          [disabled]="updating() === r.id"
                          (click)="changeStatus(r.id, 'active')">
                          @if (updating() === r.id) { <span class="loading loading-spinner loading-xs"></span> }
                          @else { {{ 'RUEDAS.ACTIVATE' | translate }} }
                        </button>
                      }
                      @if (r.status === 'active') {
                        <button class="btn btn-neutral btn-sm"
                          [disabled]="updating() === r.id"
                          (click)="changeStatus(r.id, 'completed')">
                          @if (updating() === r.id) { <span class="loading loading-spinner loading-xs"></span> }
                          @else { {{ 'RUEDAS.COMPLETE' | translate }} }
                        </button>
                      }
                    </div>
                  }
                </div>
                @if (timelineRuedaId() === r.id) {
                  <app-rueda-timeline [groupId]="groupId" [ruedaId]="r.id" />
                }
              </div>
            </div>
          }
        </div>
      }
    </div>

    <app-create-rueda-dialog
      [show]="showCreateModal()"
      [groupId]="groupId"
      (closed)="showCreateModal.set(false)"
      (saved)="showCreateModal.set(false)" />

    <app-edit-rueda-dialog
      [show]="showEditModal()"
      [rueda]="selectedRueda()"
      [groupId]="groupId"
      (closed)="closeEdit()"
      (saved)="closeEdit()" />

    <!-- Delete confirm dialog -->
    @if (showDeleteConfirm()) {
      <div class="modal modal-open">
        <div class="modal-box">
          <h3 class="font-bold text-lg mb-2">{{ 'RUEDAS.DELETE' | translate }}</h3>
          <p class="text-sm text-base-content/70">{{ 'RUEDAS.DELETE_CONFIRM' | translate }}</p>
          <div class="modal-action mt-4">
            <button class="btn btn-ghost" (click)="showDeleteConfirm.set(false)">{{ 'APP.CANCEL' | translate }}</button>
            <button class="btn btn-error" [disabled]="deleting() !== ''" (click)="deleteRueda()">
              @if (deleting() !== '') { <span class="loading loading-spinner loading-xs"></span> }
              {{ 'RUEDAS.DELETE' | translate }}
            </button>
          </div>
        </div>
        <div class="modal-backdrop" (click)="showDeleteConfirm.set(false)"></div>
      </div>
    }
  `,
})
export class RuedaListComponent implements OnInit {
  readonly service = inject(RuedasService);
  private readonly membersService = inject(MembersService);
  private readonly route = inject(ActivatedRoute);

  groupId = '';
  updating = signal('');
  deleting = signal('');
  showCreateModal = signal(false);
  showEditModal = signal(false);
  showDeleteConfirm = signal(false);
  selectedRueda = signal<Rueda | null>(null);
  timelineRuedaId = signal<string | null>(null);

  ngOnInit(): void {
    this.groupId = this.route.snapshot.parent?.paramMap.get('groupId') ?? '';
    this.service.loadByGroup(this.groupId);
    this.membersService.loadByGroup(this.groupId);
  }

  toggleTimeline(ruedaId: string): void {
    this.timelineRuedaId.update(id => id === ruedaId ? null : ruedaId);
  }

  openEdit(rueda: Rueda): void {
    this.selectedRueda.set(rueda);
    this.showEditModal.set(true);
  }

  closeEdit(): void {
    this.showEditModal.set(false);
    this.selectedRueda.set(null);
  }

  confirmDelete(rueda: Rueda): void {
    this.selectedRueda.set(rueda);
    this.showDeleteConfirm.set(true);
  }

  deleteRueda(): void {
    const rueda = this.selectedRueda();
    if (!rueda) return;
    this.deleting.set(rueda.id);
    this.service.delete(this.groupId, rueda.id).subscribe({
      next: () => {
        this.deleting.set('');
        this.showDeleteConfirm.set(false);
        this.selectedRueda.set(null);
      },
      error: () => { this.deleting.set(''); },
    });
  }

  changeStatus(ruedaId: string, status: 'active' | 'completed'): void {
    this.updating.set(ruedaId);
    this.service.update(this.groupId, ruedaId, { status }).subscribe({
      next: () => this.updating.set(''),
      error: () => this.updating.set(''),
    });
  }
}
