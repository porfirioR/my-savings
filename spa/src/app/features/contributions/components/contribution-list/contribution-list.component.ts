import { Component, inject, OnInit, signal } from '@angular/core';
import { Observable } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { DecimalPipe } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { ContributionsService } from '../../services/contributions.service';
import { ContributionColumn, MemberContributionRow } from '../../models/contribution.model';
import { FormsModule } from '@angular/forms';
import { AddPeriodDialogComponent } from '../add-period-dialog/add-period-dialog.component';
import { EditContributionDialogComponent } from '../edit-contribution-dialog/edit-contribution-dialog.component';
import { ToastService } from '../../../../core/services/toast.service';
import { backendErrorToastKey } from '../../../../core/services/backend-error.util';

@Component({
  selector: 'app-contribution-list',
  standalone: true,
  imports: [DecimalPipe, TranslateModule, FormsModule, AddPeriodDialogComponent, EditContributionDialogComponent],
  template: `
    <div>
      <div class="flex items-center justify-between mb-2">
        <h2 class="text-2xl font-bold tracking-tight">{{ 'CONTRIBUTIONS.TITLE' | translate }}</h2>
        <button class="btn btn-primary btn-sm" (click)="showAddPeriod.set(true)">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
          </svg>
          {{ 'CONTRIBUTIONS.ADD_PERIOD' | translate }}
        </button>
      </div>
      <div class="divider mt-0 mb-6"></div>

      @if (service.loading()) {
        <div class="flex justify-center py-16">
          <span class="loading loading-spinner loading-lg text-primary"></span>
        </div>
      } @else if (columns().length === 0) {
        <div class="text-center py-16 text-base-content/50 text-sm">
          {{ 'CONTRIBUTIONS.EMPTY' | translate }}
        </div>
      } @else {
        <div class="overflow-x-auto rounded-box border border-base-300">
          <table class="table table-sm w-full">
            <thead>
              <tr class="bg-base-200">
                <th class="sticky left-0 bg-base-200 z-10">{{ 'CONTRIBUTIONS.MEMBER' | translate }}</th>
                @for (col of columns(); track col.id) {
                  <th class="text-right whitespace-nowrap">
                    <div class="flex flex-col items-end gap-0.5">
                      @if (renamingId() === col.id) {
                        <input type="text" class="input input-bordered input-xs w-32 text-right font-normal"
                          [(ngModel)]="labelDraft"
                          (keydown.enter)="confirmRename(col)"
                          (keydown.escape)="renamingId.set(null)"
                          (blur)="confirmRename(col)" />
                      } @else {
                        <span class="cursor-pointer hover:underline" [title]="'CONTRIBUTIONS.RENAME_HINT' | translate" (click)="startRename(col)">{{ col.label }}</span>
                      }
                      <span class="badge badge-xs"
                        [class.badge-success]="col.status === 'active'"
                        [class.badge-neutral]="col.status === 'completed'"
                        [class.badge-warning]="col.type === 'manual'">
                        {{ (col.type === 'manual' ? 'CONTRIBUTIONS.MANUAL_ENTRY' : col.status === 'active' ? 'CONTRIBUTIONS.ACTIVE_RUEDA' : 'CONTRIBUTIONS.COMPLETED_RUEDA') | translate }}
                      </span>
                      <span class="text-xs text-base-content/40 font-normal">
                        {{ col.monthlyAmount | number:'1.0-0' }} Gs @if (col.memberCount) { &bull; {{ col.memberCount }} {{ 'CONTRIBUTIONS.MEMBERS_SHORT' | translate }} }
                      </span>
                      @if (col.type === 'manual') {
                        @if (deletingPeriodId() === col.id) {
                          <span class="flex items-center gap-1">
                            <span class="text-xs text-error">{{ 'CASH_BOX.DELETE_CONFIRM_Q' | translate }}</span>
                            <button class="btn btn-error btn-xs" (click)="confirmDeletePeriod(col)">{{ 'APP.YES' | translate }}</button>
                            <button class="btn btn-ghost btn-xs" (click)="deletingPeriodId.set(null)">{{ 'APP.NO' | translate }}</button>
                          </span>
                        } @else {
                          <button class="btn btn-ghost btn-xs text-error opacity-60 hover:opacity-100 px-1"
                            [title]="'APP.DELETE' | translate"
                            (click)="deletingPeriodId.set(col.id)">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                            </svg>
                          </button>
                        }
                      }
                    </div>
                  </th>
                }
                <th class="text-right">{{ 'CONTRIBUTIONS.TOTAL' | translate }}</th>
              </tr>
            </thead>
            <tbody>
              @for (row of rows(); track row.memberId) {
                <tr class="hover:bg-base-200/50" [class.opacity-50]="!row.isActive">
                  <td class="sticky left-0 bg-base-100 font-medium whitespace-nowrap">{{ row.memberName }}</td>
                  @for (col of columns(); track col.id) {
                    <td class="text-right whitespace-nowrap"
                      [class.cursor-pointer]="col.type === 'manual'"
                      [class.hover:underline]="col.type === 'manual'"
                      (click)="col.type === 'manual' && openEdit(row, col)">
                      {{ (row.values[col.id] ?? 0) | number:'1.0-0' }}
                    </td>
                  }
                  <td class="text-right font-semibold whitespace-nowrap">{{ row.total | number:'1.0-0' }}</td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      }
    </div>

    <app-add-period-dialog
      [show]="showAddPeriod()"
      [groupId]="groupId"
      [nextPosition]="manualPeriodCount() + 1"
      (closed)="showAddPeriod.set(false)"
      (saved)="showAddPeriod.set(false)" />

    <app-edit-contribution-dialog
      [show]="!!editing()"
      [groupId]="groupId"
      [memberId]="editing()?.row?.memberId ?? ''"
      [memberName]="editing()?.row?.memberName ?? ''"
      [periodId]="editing()?.col?.id ?? ''"
      [periodName]="editing()?.col?.label ?? ''"
      [currentAmount]="editing()?.row?.values?.[editing()?.col?.id ?? ''] ?? 0"
      (closed)="editing.set(null)"
      (saved)="editing.set(null)" />
  `,
})
export class ContributionListComponent implements OnInit {
  readonly service = inject(ContributionsService);
  private readonly route = inject(ActivatedRoute);

  groupId = '';
  showAddPeriod = signal(false);
  editing = signal<{ row: MemberContributionRow; col: ContributionColumn } | null>(null);
  renamingId = signal<string | null>(null);
  labelDraft = '';
  deletingPeriodId = signal<string | null>(null);

  private readonly toast = inject(ToastService);

  columns = () => this.service.matrix().columns;
  rows = () => this.service.matrix().rows;
  manualPeriodCount = () => this.columns().filter(c => c.type === 'manual').length;

  ngOnInit(): void {
    this.groupId = this.route.snapshot.parent?.paramMap.get('groupId') ?? '';
    this.service.loadMatrix(this.groupId);
  }

  openEdit(row: MemberContributionRow, col: ContributionColumn): void {
    this.editing.set({ row, col });
  }

  startRename(col: ContributionColumn): void {
    this.labelDraft = col.label;
    this.renamingId.set(col.id);
  }

  confirmRename(col: ContributionColumn): void {
    if (this.renamingId() !== col.id) return;
    this.renamingId.set(null);
    const label = this.labelDraft.trim();
    if (!label || label === col.label) return;

    const obs: Observable<unknown> = col.type === 'manual'
      ? this.service.updatePeriod(this.groupId, col.id, { name: label })
      : this.service.updateRuedaLabel(this.groupId, col.id, label);

    obs.subscribe({
      next: () => this.toast.success('TOAST.CONTRIBUTION_LABEL_UPDATED'),
      error: (err: unknown) => this.toast.error(backendErrorToastKey(err, 'TOAST.CONTRIBUTION_LABEL_UPDATE_ERROR')),
    });
  }

  confirmDeletePeriod(col: ContributionColumn): void {
    this.deletingPeriodId.set(null);
    this.service.deletePeriod(this.groupId, col.id).subscribe({
      next: () => this.toast.success('TOAST.CONTRIBUTION_PERIOD_DELETED'),
      error: (err: unknown) => this.toast.error(backendErrorToastKey(err, 'TOAST.CONTRIBUTION_PERIOD_DELETE_ERROR')),
    });
  }
}
