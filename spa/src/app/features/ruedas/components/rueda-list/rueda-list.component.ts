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
    <div class="p-4">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-xl font-bold">{{ 'RUEDAS.TITLE' | translate }}</h2>
        <button class="btn btn-primary btn-sm" (click)="openModal()">
          {{ 'RUEDAS.NEW' | translate }}
        </button>
      </div>

      @if (service.loading()) {
        <div class="flex justify-center py-8">
          <span class="loading loading-spinner loading-md"></span>
        </div>
      } @else if (service.ruedas().length === 0) {
        <div class="text-center py-8 text-base-content/50">
          {{ 'RUEDAS.EMPTY' | translate }}
        </div>
      } @else {
        <div class="grid gap-3">
          @for (r of service.ruedas(); track r.id) {
            <div class="card bg-base-200 shadow-sm">
              <div class="card-body p-4">
                <div class="flex justify-between items-start">
                  <div>
                    <h3 class="font-semibold text-lg">
                      {{ 'RUEDAS.NUMBER' | translate }} {{ r.ruedaNumber }}
                      <span class="badge badge-sm ml-2"
                        [class.badge-warning]="r.status === 'pending'"
                        [class.badge-success]="r.status === 'active'"
                        [class.badge-neutral]="r.status === 'completed'">
                        {{ ('RUEDAS.STATUS_' + r.status.toUpperCase()) | translate }}
                      </span>
                    </h3>
                    <p class="text-sm text-base-content/70">
                      {{ r.type === 'new' ? ('RUEDAS.TYPE_NEW' | translate) : ('RUEDAS.TYPE_CONTINUA' | translate) }}
                      &bull; {{ 'MONTHS.' + r.startMonth | translate }} {{ r.startYear }}
                    </p>
                  </div>
                  <div class="text-right text-sm">
                    <div>{{ 'RUEDAS.LOAN_AMOUNT' | translate }}: <strong>{{ r.loanAmount | number:'1.0-0' }} Gs</strong></div>
                    <div>{{ 'RUEDAS.INSTALLMENT' | translate }}: <strong>{{ r.installmentAmount | number:'1.0-0' }} Gs</strong></div>
                    <div>{{ 'RUEDAS.CONTRIBUTION' | translate }}: <strong>{{ r.contributionAmount | number:'1.0-0' }} Gs</strong></div>
                  </div>
                </div>
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
          <h3 class="font-bold text-lg mb-4">{{ 'RUEDAS.NEW' | translate }}</h3>

          <div class="grid grid-cols-2 gap-3">
            <div class="form-control">
              <label class="label"><span class="label-text">{{ 'RUEDAS.TYPE' | translate }}</span></label>
              <select class="select select-bordered" [(ngModel)]="form.type">
                <option value="new">{{ 'RUEDAS.TYPE_NEW' | translate }}</option>
                <option value="continua">{{ 'RUEDAS.TYPE_CONTINUA' | translate }}</option>
              </select>
            </div>
            <div class="form-control">
              <label class="label"><span class="label-text">{{ 'RUEDAS.ROUNDING' | translate }} (500/1000)</span></label>
              <select class="select select-bordered" [(ngModel)]="form.roundingUnit">
                <option [ngValue]="500">500</option>
                <option [ngValue]="1000">1000</option>
              </select>
            </div>
            <div class="form-control">
              <label class="label">
                <span class="label-text">{{ 'RUEDAS.LOAN_AMOUNT' | translate }} (Gs)</span>
                @if (suggested()) {
                  <span class="label-text-alt text-info cursor-pointer" (click)="useSuggestion()">
                    {{ 'RUEDAS.SUGGESTION' | translate }}: {{ suggested() | number:'1.0-0' }}
                  </span>
                }
              </label>
              <div class="join">
                <input type="number" class="input input-bordered join-item flex-1" [(ngModel)]="form.loanAmount" />
                <button type="button" class="btn join-item btn-sm btn-outline" (click)="getSuggestion()">
                  {{ 'RUEDAS.CALCULATE' | translate }}
                </button>
              </div>
            </div>
            <div class="form-control">
              <label class="label"><span class="label-text">{{ 'RUEDAS.INTEREST_RATE' | translate }} (%)</span></label>
              <input type="number" class="input input-bordered" [(ngModel)]="form.interestRate" step="0.5" />
            </div>
            <div class="form-control">
              <label class="label"><span class="label-text">{{ 'MONTHS.1' | translate }} / Año inicio</span></label>
              <div class="join">
                <select class="select select-bordered join-item" [(ngModel)]="form.startMonth">
                  @for (m of months; track m.value) {
                    <option [ngValue]="m.value">{{ m.label }}</option>
                  }
                </select>
                <input type="number" class="input input-bordered join-item w-24" [(ngModel)]="form.startYear" />
              </div>
            </div>
          </div>

          <!-- Slot assignment -->
          <div class="mt-4">
            <h4 class="font-semibold mb-2">{{ 'RUEDAS.SLOTS' | translate }}</h4>
            <div class="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto">
              @for (slot of slots; track slot.position) {
                <div class="flex items-center gap-2 bg-base-200 rounded p-2">
                  <span class="badge badge-sm badge-outline">{{ slot.position }}</span>
                  <select class="select select-bordered select-xs flex-1" [(ngModel)]="slot.memberId">
                    <option value="">-</option>
                    @for (m of membersService.members(); track m.id) {
                      <option [value]="m.id">{{ m.firstName }} {{ m.lastName }}</option>
                    }
                  </select>
                </div>
              }
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
export class RuedaListComponent implements OnInit {
  readonly service = inject(RuedasService);
  readonly membersService = inject(MembersService);
  private readonly route = inject(ActivatedRoute);

  private groupId = '';
  saving = signal(false);
  showModal = signal(false);
  suggested = signal<number | null>(null);

  form: CreateRuedaRequest = {
    type: 'new',
    loanAmount: 0,
    interestRate: 5,
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
    this.form = { type: 'new', loanAmount: 0, interestRate: 5, roundingUnit: 500, startMonth: new Date().getMonth() + 1, startYear: new Date().getFullYear(), slots: [] };
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
