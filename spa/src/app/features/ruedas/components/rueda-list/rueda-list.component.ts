import { Component, inject, OnInit, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { RuedasService } from '../../services/ruedas.service';
import { MembersService } from '../../../members/services/members.service';
import { CreateRuedaRequest } from '../../models/rueda.model';

@Component({
  selector: 'app-rueda-list',
  standalone: true,
  imports: [FormsModule, DecimalPipe, TranslateModule],
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

    <!-- New Rueda Modal -->
    @if (showModal()) {
      <div class="modal modal-open">
        <div class="modal-box w-11/12 max-w-2xl">
          <h3 class="font-bold text-lg mb-1">{{ 'RUEDAS.NEW' | translate }}</h3>
          <p class="text-sm text-base-content/50 mb-4">Configura los parámetros de la nueva rueda.</p>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <fieldset class="fieldset">
              <legend class="fieldset-legend">{{ 'RUEDAS.TYPE' | translate }}</legend>
              <select class="select select-bordered w-full" [(ngModel)]="form.type">
                <option value="new">{{ 'RUEDAS.TYPE_NEW' | translate }}</option>
                <option value="continua">{{ 'RUEDAS.TYPE_CONTINUA' | translate }}</option>
              </select>
            </fieldset>
            <fieldset class="fieldset">
              <legend class="fieldset-legend">{{ 'RUEDAS.ROUNDING' | translate }} (500/1000)</legend>
              <select class="select select-bordered w-full" [(ngModel)]="form.roundingUnit">
                <option [ngValue]="500">500</option>
                <option [ngValue]="1000">1000</option>
              </select>
            </fieldset>
            <fieldset class="fieldset">
              <legend class="fieldset-legend">
                {{ 'RUEDAS.LOAN_AMOUNT' | translate }} (Gs)
                @if (suggested()) {
                  <span class="text-info cursor-pointer ml-2 font-normal" (click)="useSuggestion()">
                    {{ 'RUEDAS.SUGGESTION' | translate }}: {{ suggested() | number:'1.0-0' }}
                  </span>
                }
              </legend>
              <div class="join w-full">
                <input type="number" class="input input-bordered join-item flex-1" [(ngModel)]="form.loanAmount" />
                <button type="button" class="btn join-item btn-outline btn-sm" (click)="getSuggestion()">
                  {{ 'RUEDAS.CALCULATE' | translate }}
                </button>
              </div>
            </fieldset>
            <fieldset class="fieldset">
              <legend class="fieldset-legend">{{ 'RUEDAS.INTEREST_RATE' | translate }} (%)</legend>
              <input type="number" class="input input-bordered w-full" [(ngModel)]="form.interestRate" step="0.5" />
            </fieldset>
            <fieldset class="fieldset">
              <legend class="fieldset-legend">{{ 'RUEDAS.CONTRIBUTION' | translate }} (Gs)</legend>
              <input type="number" class="input input-bordered w-full" [(ngModel)]="form.contributionAmount" />
            </fieldset>
            <fieldset class="fieldset">
              <legend class="fieldset-legend">Mes / Año inicio</legend>
              <div class="join w-full">
                <select class="select select-bordered join-item flex-1" [(ngModel)]="form.startMonth">
                  @for (m of months; track m.value) {
                    <option [ngValue]="m.value">{{ m.label }}</option>
                  }
                </select>
                <input type="number" class="input input-bordered join-item w-24" [(ngModel)]="form.startYear" />
              </div>
            </fieldset>
          </div>

          <!-- Slot assignment -->
          <div class="mt-5">
            <h4 class="font-semibold text-sm mb-2">{{ 'RUEDAS.SLOTS' | translate }}</h4>
            <div class="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto pr-1">
              @for (slot of slots; track slot.position) {
                <div class="flex items-center gap-2 bg-base-200 rounded-lg p-2">
                  <span class="badge badge-xs badge-outline shrink-0">{{ slot.position }}</span>
                  <select class="select select-bordered select-xs flex-1 min-w-0" [(ngModel)]="slot.memberId">
                    <option value="">-</option>
                    @for (m of membersService.members(); track m.id) {
                      <option [value]="m.id">{{ m.firstName }} {{ m.lastName }}</option>
                    }
                  </select>
                </div>
              }
            </div>
          </div>

          <div class="divider my-3"></div>
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
export class RuedaListComponent implements OnInit {
  readonly service = inject(RuedasService);
  readonly membersService = inject(MembersService);
  private readonly route = inject(ActivatedRoute);

  private groupId = '';
  saving = signal(false);
  updating = signal('');
  showModal = signal(false);
  suggested = signal<number | null>(null);

  form: CreateRuedaRequest = {
    type: 'new',
    loanAmount: 0,
    interestRate: 5,
    contributionAmount: 0,
    roundingUnit: 500,
    startMonth: new Date().getMonth() + 1,
    startYear: new Date().getFullYear(),
    slots: [],
  };

  slots: { position: number; memberId: string }[] = Array.from({ length: 15 }, (_, i) => ({
    position: i + 1,
    memberId: '',
  }));

  months = Array.from({ length: 12 }, (_, i) => ({ value: i + 1, label: String(i + 1) }));

  ngOnInit(): void {
    this.groupId = this.route.snapshot.parent?.paramMap.get('groupId') ?? '';
    this.service.loadByGroup(this.groupId);
    this.membersService.loadByGroup(this.groupId);
  }

  openModal(): void {
    this.suggested.set(null);
    this.slots = Array.from({ length: 15 }, (_, i) => ({ position: i + 1, memberId: '' }));
    this.form = { type: 'new', loanAmount: 0, interestRate: 5, contributionAmount: 0, roundingUnit: 500, startMonth: new Date().getMonth() + 1, startYear: new Date().getFullYear(), slots: [] };
    this.showModal.set(true);
  }

  closeModal(): void { this.showModal.set(false); }

  getSuggestion(): void {
    this.service.suggestLoanAmount(this.groupId).subscribe({
      next: res => this.suggested.set(res.suggested),
    });
  }

  useSuggestion(): void {
    if (this.suggested()) this.form.loanAmount = this.suggested()!;
  }

  changeStatus(ruedaId: string, status: 'active' | 'completed'): void {
    this.updating.set(ruedaId);
    this.service.update(this.groupId, ruedaId, { status }).subscribe({
      next: () => this.updating.set(''),
      error: () => this.updating.set(''),
    });
  }

  save(): void {
    if (!this.form.loanAmount) return;
    this.form.slots = this.slots.filter(s => s.memberId).map(s => ({ position: s.position, memberId: s.memberId }));
    this.saving.set(true);
    this.service.create(this.groupId, this.form).subscribe({
      next: () => { this.saving.set(false); this.closeModal(); },
      error: () => this.saving.set(false),
    });
  }
}
