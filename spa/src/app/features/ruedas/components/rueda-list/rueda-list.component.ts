import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DecimalPipe } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { RuedasService } from '../../services/ruedas.service';
import { MembersService } from '../../../members/services/members.service';
import { CreateRuedaDialogComponent } from '../create-rueda-dialog/create-rueda-dialog.component';

@Component({
  selector: 'app-rueda-list',
  standalone: true,
  imports: [DecimalPipe, TranslateModule, CreateRuedaDialogComponent],
  template: `
    <div>
      <div class="flex items-center justify-between mb-2">
        <h2 class="text-2xl font-bold tracking-tight">{{ 'RUEDAS.TITLE' | translate }}</h2>
        <button class="btn btn-primary btn-sm" (click)="openModal()">
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
                <!-- Card header: number + status -->
                <div class="flex items-center justify-between mb-3">
                  <h3 class="font-bold text-base">
                    {{ 'RUEDAS.NUMBER' | translate }} {{ r.ruedaNumber }}
                  </h3>
                  <span class="badge badge-sm"
                    [class.badge-warning]="r.status === 'pending'"
                    [class.badge-success]="r.status === 'active'"
                    [class.badge-neutral]="r.status === 'completed'">
                    {{ ('RUEDAS.STATUS_' + r.status.toUpperCase()) | translate }}
                  </span>
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
                @if (r.status !== 'completed') {
                  <div class="flex justify-end mt-4 gap-2">
                    @if (r.status === 'pending') {
                      <button class="btn btn-success btn-sm"
                        [disabled]="updating() === r.id"
                        (click)="changeStatus(r.id, 'active')">
                        @if (updating() === r.id) { <span class="loading loading-spinner loading-xs"></span> }
                        @else { Activar }
                      </button>
                    }
                    @if (r.status === 'active') {
                      <button class="btn btn-neutral btn-sm"
                        [disabled]="updating() === r.id"
                        (click)="changeStatus(r.id, 'completed')">
                        @if (updating() === r.id) { <span class="loading loading-spinner loading-xs"></span> }
                        @else { Completar }
                      </button>
                    }
                  </div>
                }
              </div>
            </div>
          }
        </div>
      }
    </div>

    <app-create-rueda-dialog
      [show]="showModal()"
      [groupId]="groupId"
      (closed)="showModal.set(false)"
      (saved)="showModal.set(false)" />
  `,
})
export class RuedaListComponent implements OnInit {
  readonly service = inject(RuedasService);
  private readonly membersService = inject(MembersService);
  private readonly route = inject(ActivatedRoute);

  groupId = '';
  updating = signal('');
  showModal = signal(false);

  ngOnInit(): void {
    this.groupId = this.route.snapshot.parent?.paramMap.get('groupId') ?? '';
    this.service.loadByGroup(this.groupId);
    this.membersService.loadByGroup(this.groupId);
  }

  openModal(): void {
    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
  }

  changeStatus(ruedaId: string, status: 'active' | 'completed'): void {
    this.updating.set(ruedaId);
    this.service.update(this.groupId, ruedaId, { status }).subscribe({
      next: () => this.updating.set(''),
      error: () => this.updating.set(''),
    });
  }
}
