import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { MemberReplacementsService } from '../../services/member-replacements.service';
import { MemberReplacementSchedule } from '../../models/member-replacement.model';
import { ToastService } from '../../../../core/services/toast.service';
import { backendErrorToastKey } from '../../../../core/services/backend-error.util';
import { LocaleNumberPipe } from '../../../../core/pipes/locale-number.pipe';

@Component({
  selector: 'app-replacement-list',
  standalone: true,
  imports: [LocaleNumberPipe, TranslateModule],
  template: `
    <div>
      <div class="flex items-center justify-between mb-2">
        <h2 class="text-2xl font-bold tracking-tight">{{ 'REPLACEMENTS.TITLE' | translate }}</h2>
      </div>
      <p class="text-sm text-base-content/50 mb-4">{{ 'REPLACEMENTS.SUBTITLE' | translate }}</p>
      <div class="divider mt-0 mb-6"></div>

      @if (service.loading()) {
        <div class="flex justify-center py-16">
          <span class="loading loading-spinner loading-lg text-primary"></span>
        </div>
      } @else if (service.replacements().length === 0) {
        <div class="text-center py-16 text-base-content/50 text-sm">
          {{ 'REPLACEMENTS.EMPTY' | translate }}
        </div>
      } @else {
        <div class="grid gap-4">
          @for (r of service.replacements(); track r.id) {
            <div class="card bg-base-200 border border-base-300">
              <div class="card-body p-5">
                <div class="flex items-center justify-between mb-1">
                  <h3 class="font-bold text-base">
                    {{ r.outgoingMemberName }} → {{ r.incomingMemberName }}
                  </h3>
                  <span class="badge badge-sm" [class.badge-success]="r.status === 'active'" [class.badge-neutral]="r.status === 'completed'">
                    {{ ('REPLACEMENTS.STATUS_' + r.status.toUpperCase()) | translate }}
                  </span>
                </div>
                <p class="text-xs text-base-content/50 mb-3">
                  {{ 'RUEDAS.NUMBER' | translate }} {{ r.ruedaNumber }} &bull;
                  {{ 'REPLACEMENTS.SLOT' | translate }} {{ r.slotPosition }}
                </p>
                <div class="grid grid-cols-2 gap-3 mb-3">
                  <div class="bg-base-100 rounded-lg p-3">
                    <p class="text-xs text-base-content/50 mb-0.5">{{ 'REPLACEMENTS.OUTGOING_MONTHLY' | translate }}</p>
                    <p class="font-semibold text-sm text-error">{{ r.outgoingMonthlyAmount | localeNumber }} Gs</p>
                  </div>
                  <div class="bg-base-100 rounded-lg p-3">
                    <p class="text-xs text-base-content/50 mb-0.5">{{ 'REPLACEMENTS.INCOMING_TOTAL' | translate }}</p>
                    <p class="font-semibold text-sm text-success">{{ r.incomingTotalAmount | localeNumber }} Gs ({{ r.incomingInstallments }})</p>
                  </div>
                </div>
                <button class="btn btn-ghost btn-xs gap-1" (click)="toggleExpand(r.id)">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                  </svg>
                  {{ 'REPLACEMENTS.SCHEDULE' | translate }}
                </button>

                @if (expandedId() === r.id) {
                  <div class="mt-4 overflow-x-auto">
                    @if (scheduleLoading()) {
                      <div class="flex justify-center py-4">
                        <span class="loading loading-spinner loading-sm text-primary"></span>
                      </div>
                    } @else {
                      <table class="table table-xs w-full">
                        <thead>
                          <tr class="text-base-content/60">
                            <th>{{ 'PAYMENTS.MONTH' | translate }}</th>
                            <th class="text-right">{{ 'REPLACEMENTS.OUTGOING' | translate }}</th>
                            <th class="text-center w-10"></th>
                            <th class="text-right">{{ 'REPLACEMENTS.INCOMING' | translate }}</th>
                            <th class="text-center w-10"></th>
                          </tr>
                        </thead>
                        <tbody>
                          @for (s of schedule(); track s.id) {
                            <tr>
                              <td>{{ 'MONTHS.' + s.month | translate }} {{ s.year }}</td>
                              <td class="text-right">
                                @if (s.outgoingPaid) {
                                  <span class="font-mono text-sm pr-1">{{ s.outgoingAmount | localeNumber }}</span>
                                } @else {
                                  <input type="number" class="input input-bordered input-xs w-24 text-right"
                                    [value]="s.outgoingAmount"
                                    (change)="onAmountChange(r.id, s, 'outgoing', $event)" />
                                }
                              </td>
                              <td class="text-center">
                                <input type="checkbox" class="checkbox checkbox-xs checkbox-error"
                                  [checked]="s.outgoingPaid"
                                  [disabled]="marking() === s.id + ':outgoing'"
                                  (change)="onMarkChange(r.id, s, 'outgoing', $event)" />
                              </td>
                              <td class="text-right">
                                {{ s.installmentNumber }}/{{ scheduleTotal() }} &mdash;
                                @if (s.incomingPaid) {
                                  <span class="font-mono text-sm pl-1">{{ s.incomingAmount | localeNumber }}</span>
                                } @else {
                                  <input type="number" class="input input-bordered input-xs w-24 text-right inline-block"
                                    [value]="s.incomingAmount"
                                    (change)="onAmountChange(r.id, s, 'incoming', $event)" />
                                }
                              </td>
                              <td class="text-center">
                                <input type="checkbox" class="checkbox checkbox-xs checkbox-success"
                                  [checked]="s.incomingPaid"
                                  [disabled]="marking() === s.id + ':incoming'"
                                  (change)="onMarkChange(r.id, s, 'incoming', $event)" />
                              </td>
                            </tr>
                          }
                        </tbody>
                      </table>
                    }
                  </div>
                }
              </div>
            </div>
          }
        </div>
      }
    </div>
  `,
})
export class ReplacementListComponent implements OnInit {
  readonly service = inject(MemberReplacementsService);
  private readonly route = inject(ActivatedRoute);
  private readonly toast = inject(ToastService);

  groupId = '';
  expandedId = signal<string | null>(null);
  schedule = signal<MemberReplacementSchedule[]>([]);
  scheduleLoading = signal(false);
  marking = signal('');

  ngOnInit(): void {
    this.groupId = this.route.snapshot.parent?.paramMap.get('groupId') ?? '';
    this.service.loadByGroup(this.groupId);
  }

  scheduleTotal(): number {
    return this.schedule().length;
  }

  toggleExpand(replacementId: string): void {
    if (this.expandedId() === replacementId) {
      this.expandedId.set(null);
      return;
    }
    this.expandedId.set(replacementId);
    this.scheduleLoading.set(true);
    this.service.getSchedule(this.groupId, replacementId).subscribe({
      next: (data) => { this.schedule.set(data); this.scheduleLoading.set(false); },
      error: () => { this.scheduleLoading.set(false); this.toast.error('TOAST.REPLACEMENT_LOAD_ERROR'); },
    });
  }

  onMarkChange(replacementId: string, row: MemberReplacementSchedule, side: 'outgoing' | 'incoming', event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    this.marking.set(row.id + ':' + side);
    this.service.markSchedule(this.groupId, row.id, side, checked).subscribe({
      next: (updated) => {
        this.marking.set('');
        this.schedule.update(list => list.map(s => s.id === updated.id ? updated : s));
        this.toast.success(checked ? 'TOAST.REPLACEMENT_MARKED_PAID' : 'TOAST.REPLACEMENT_MARKED_UNPAID');
        if (side === 'incoming') this.service.loadByGroup(this.groupId);
      },
      error: (err) => {
        this.marking.set('');
        (event.target as HTMLInputElement).checked = !checked;
        this.toast.error(backendErrorToastKey(err, 'TOAST.REPLACEMENT_MARK_ERROR'));
      },
    });
  }

  onAmountChange(replacementId: string, row: MemberReplacementSchedule, side: 'outgoing' | 'incoming', event: Event): void {
    const value = Number((event.target as HTMLInputElement).value);
    this.service.updateScheduleAmount(this.groupId, row.id, side, value).subscribe({
      next: (updated) => {
        this.schedule.update(list => list.map(s => s.id === updated.id ? updated : s));
      },
      error: (err) => {
        this.toast.error(backendErrorToastKey(err, 'TOAST.REPLACEMENT_UPDATE_ERROR'));
      },
    });
  }
}
