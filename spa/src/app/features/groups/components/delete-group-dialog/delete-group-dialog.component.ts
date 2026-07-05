import { Component, EventEmitter, inject, Input, OnChanges, Output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { GroupsService } from '../../services/groups.service';
import { Group } from '../../models/group.model';
import { ToastService } from '../../../../core/services/toast.service';

@Component({
  selector: 'app-delete-group-dialog',
  standalone: true,
  imports: [FormsModule, TranslateModule],
  template: `
    @if (show && group) {
      <div class="modal modal-open">
        <div class="modal-box max-w-sm">
          <div class="text-4xl text-center mb-3">⚠️</div>
          <h3 class="font-bold text-lg text-center mb-1">{{ 'GROUPS.DELETE_TITLE' | translate }}</h3>
          <p class="text-sm text-base-content/70 text-center mb-4">
            {{ 'GROUPS.DELETE_WARNING' | translate }}
          </p>

          <div class="bg-error/10 border border-error/30 rounded-lg p-3 mb-4 text-sm text-center">
            <span class="font-mono font-semibold text-error">{{ group.name }}</span>
          </div>

          <fieldset class="fieldset mb-4">
            <legend class="fieldset-legend text-xs">{{ 'GROUPS.DELETE_CONFIRM_LABEL' | translate }}</legend>
            <input
              type="text"
              class="input input-bordered w-full"
              [class.input-error]="confirmInput && confirmInput !== group.name"
              [class.input-success]="confirmInput === group.name"
              [(ngModel)]="confirmInput"
              [placeholder]="group.name"
              autocomplete="off" />
            @if (confirmInput && confirmInput !== group.name) {
              <span class="text-error text-xs mt-1">{{ 'GROUPS.DELETE_MISMATCH' | translate }}</span>
            }
          </fieldset>

          <div class="modal-action mt-0">
            <button class="btn btn-ghost btn-sm" (click)="onCancel()">{{ 'APP.CANCEL' | translate }}</button>
            <button
              class="btn btn-error btn-sm"
              [disabled]="confirmInput !== group.name || saving()"
              (click)="confirm()">
              @if (saving()) { <span class="loading loading-spinner loading-xs"></span> }
              {{ 'APP.DELETE' | translate }}
            </button>
          </div>
        </div>
        <div class="modal-backdrop" (click)="onCancel()"></div>
      </div>
    }
  `,
})
export class DeleteGroupDialogComponent implements OnChanges {
  @Input() show = false;
  @Input() group: Group | null = null;
  @Output() closed = new EventEmitter<void>();
  @Output() deleted = new EventEmitter<void>();

  private readonly service = inject(GroupsService);
  private readonly toast = inject(ToastService);

  saving = signal(false);
  confirmInput = '';

  ngOnChanges(): void {
    if (this.show) {
      this.confirmInput = '';
    }
  }

  confirm(): void {
    if (!this.group || this.confirmInput !== this.group.name) return;
    this.saving.set(true);
    this.service.delete(this.group.id).subscribe({
      next: () => {
        this.saving.set(false);
        this.deleted.emit();
        this.toast.success('TOAST.GROUP_DELETED');
      },
      error: () => {
        this.saving.set(false);
        this.toast.error('TOAST.GROUP_DELETE_ERROR');
      },
    });
  }

  onCancel(): void {
    this.closed.emit();
  }
}
