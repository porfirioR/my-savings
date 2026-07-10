import { Component, inject, Input } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

interface SimulationMonth {
  month: number;
  year: number;
  receivedCount: number;
  inflow: number;
  contributions: number;
  disbursement: number;
  balance: number;
  isNegative: boolean;
}

@Component({
  selector: 'app-rueda-simulator',
  standalone: true,
  imports: [DecimalPipe, TranslateModule],
  template: `
    <div class="collapse collapse-arrow border border-base-300 rounded-lg">
      <input type="checkbox" />
      <div class="collapse-title font-medium text-sm">
        {{ 'RUEDAS.SIMULATOR_TITLE' | translate }}
      </div>
      <div class="collapse-content">
        @if (!hasData()) {
          <p class="text-xs text-base-content/50 py-4">{{ 'RUEDAS.SIMULATOR_EMPTY' | translate }}</p>
        } @else {
          @if (hasNegativeMonth()) {
            <div class="alert alert-warning mb-4 py-2 px-3 text-sm">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4v2m0 0a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              <span>{{ 'RUEDAS.SIMULATOR_WARNING' | translate }}</span>
            </div>
          }
          <div class="overflow-x-auto">
            <table class="table table-sm w-full">
              <thead>
                <tr class="text-base-content/60">
                  <th class="text-left">{{ 'RUEDA_SIMULATOR.COL_MONTH' | translate }}</th>
                  <th class="text-right">{{ 'RUEDA_SIMULATOR.COL_RECEIVED' | translate }}</th>
                  <th class="text-right">{{ 'RUEDA_SIMULATOR.COL_INFLOW' | translate }}</th>
                  <th class="text-right">{{ 'RUEDA_SIMULATOR.COL_CONTRIBUTIONS' | translate }}</th>
                  <th class="text-right">{{ 'RUEDA_SIMULATOR.COL_DISBURSEMENT' | translate }}</th>
                  <th class="text-right">{{ 'RUEDA_SIMULATOR.COL_BALANCE' | translate }}</th>
                </tr>
              </thead>
              <tbody>
                @for (row of months(); track row.month) {
                  <tr [class.bg-error/10]="row.isNegative">
                    <td class="text-sm">{{ monthName(row.month) }} {{ row.year }}</td>
                    <td class="text-right text-sm">{{ row.receivedCount }}/{{ memberCount() }}</td>
                    <td class="text-right font-mono text-sm">{{ row.inflow | number:'1.0-0' }}</td>
                    <td class="text-right font-mono text-sm">{{ row.contributions | number:'1.0-0' }}</td>
                    <td class="text-right font-mono text-sm">{{ row.disbursement | number:'1.0-0' }}</td>
                    <td class="text-right font-mono text-sm font-semibold" [class.text-error]="row.isNegative">
                      {{ row.balance | number:'1.0-0' }}
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        }
      </div>
    </div>
  `,
})
export class RuedaSimulatorComponent {
  @Input() previousRuedaInstallment = 0;
  @Input() previousRuedaMembers: Array<{ memberId: string; installmentAmount: number }> = [];
  @Input() newLoanAmount = 0;
  @Input() newInterestRate = 0;
  @Input() newContributionAmount = 0;
  @Input() newRoundingUnit = 0;
  @Input() newMemberCount = 0;
  @Input() startMonth = 1;
  @Input() startYear = 2026;
  @Input() initialCashBalance = 0;

  private readonly translate = inject(TranslateService);

  months(): SimulationMonth[] {
    if (!this.hasData()) return [];

    const result: SimulationMonth[] = [];
    let cashBalance = this.initialCashBalance;
    let currentMonth = this.startMonth;
    let currentYear = this.startYear;

    const N = this.newMemberCount;
    const Q = this.newLoanAmount;
    const rate = this.newInterestRate / 100;
    const C = this.newContributionAmount;
    const rounding = this.newRoundingUnit;
    const prevInstallment = this.previousRuedaInstallment;
    const hasPrev = this.previousRuedaMembers.length > 0;

    // Derive monthly installment from loan parameters (same formula as backend)
    const rawTotal = Q * (1 + rate);
    const newInstallment = rounding > 0
      ? Math.round(rawTotal / N / rounding) * rounding
      : Math.round(rawTotal / N);

    for (let i = 1; i <= N; i++) {
      // Slots 1..i-1 already received new loan → pay new installment
      // Slots i..N (including receiver) → pay previous rueda installment (continua)
      const newPayers = i - 1;
      const prevPayers = hasPrev ? N - i + 1 : 0;

      const inflow = newPayers * newInstallment + prevPayers * prevInstallment;
      const contributions = N * C;
      const disbursement = Q;
      const balance = cashBalance + inflow + contributions - disbursement;

      result.push({
        month: currentMonth,
        year: currentYear,
        receivedCount: i,
        inflow,
        contributions,
        disbursement,
        balance,
        isNegative: balance < 0,
      });

      cashBalance = balance;
      currentMonth++;
      if (currentMonth > 12) {
        currentMonth = 1;
        currentYear++;
      }
    }

    return result;
  }

  hasData(): boolean {
    return this.newMemberCount > 0 && this.newLoanAmount > 0;
  }

  hasNegativeMonth(): boolean {
    return this.months().some(m => m.isNegative);
  }

  memberCount(): number {
    return this.newMemberCount;
  }

  monthName(monthNum: number): string {
    return this.translate.instant('MONTHS.' + monthNum);
  }
}
