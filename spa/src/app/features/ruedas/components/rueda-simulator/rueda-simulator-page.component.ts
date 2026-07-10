import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { RuedaSimulatorComponent } from './rueda-simulator.component';

@Component({
  selector: 'app-rueda-simulator-page',
  standalone: true,
  imports: [FormsModule, TranslateModule, RuedaSimulatorComponent],
  template: `
    <div>
      <div class="flex items-center justify-between mb-2">
        <h2 class="text-2xl font-bold tracking-tight">{{ 'NAV.SIMULATOR' | translate }}</h2>
      </div>
      <div class="divider mt-0 mb-6"></div>

      <!-- Form -->
      <div class="card bg-base-200 border border-base-300 p-4 mb-5">
        <div class="grid grid-cols-2 sm:grid-cols-3 gap-4">

          <fieldset class="fieldset">
            <legend class="fieldset-legend">{{ 'RUEDA_SIMULATOR.MEMBERS' | translate }}</legend>
            <input type="number" class="input input-bordered input-sm w-full" [(ngModel)]="memberCount" min="1" />
          </fieldset>

          <fieldset class="fieldset">
            <legend class="fieldset-legend">{{ 'RUEDA_SIMULATOR.LOAN_AMOUNT' | translate }}</legend>
            <input type="number" class="input input-bordered input-sm w-full" [(ngModel)]="loanAmount" min="0" />
          </fieldset>

          <fieldset class="fieldset">
            <legend class="fieldset-legend">{{ 'RUEDA_SIMULATOR.INTEREST_RATE' | translate }}</legend>
            <input type="number" class="input input-bordered input-sm w-full" [(ngModel)]="interestRate" min="0" step="0.5" />
          </fieldset>

          <fieldset class="fieldset">
            <legend class="fieldset-legend">{{ 'RUEDA_SIMULATOR.CONTRIBUTION' | translate }}</legend>
            <input type="number" class="input input-bordered input-sm w-full" [(ngModel)]="contributionAmount" min="0" />
          </fieldset>

          <fieldset class="fieldset">
            <legend class="fieldset-legend">{{ 'RUEDA_SIMULATOR.ROUNDING' | translate }}</legend>
            <select class="select select-bordered select-sm w-full" [(ngModel)]="roundingUnit">
              <option [ngValue]="0">{{ 'RUEDA_SIMULATOR.ROUNDING_NONE' | translate }}</option>
              <option [ngValue]="500">500 Gs</option>
              <option [ngValue]="1000">1.000 Gs</option>
            </select>
          </fieldset>

          <fieldset class="fieldset">
            <legend class="fieldset-legend">{{ 'RUEDA_SIMULATOR.START_MONTH_YEAR' | translate }}</legend>
            <div class="join w-full">
              <select class="select select-bordered select-sm join-item flex-1" [(ngModel)]="startMonth">
                @for (m of months; track m.value) {
                  <option [ngValue]="m.value">{{ 'MONTHS.' + m.value | translate }}</option>
                }
              </select>
              <input type="number" class="input input-bordered input-sm join-item w-20" [(ngModel)]="startYear" min="2000" />
            </div>
          </fieldset>

          <fieldset class="fieldset">
            <legend class="fieldset-legend">{{ 'RUEDA_SIMULATOR.INITIAL_CASH' | translate }}</legend>
            <input type="number" class="input input-bordered input-sm w-full" [(ngModel)]="initialBalance" />
          </fieldset>

          <fieldset class="fieldset">
            <legend class="fieldset-legend">{{ 'RUEDA_SIMULATOR.PREV_MEMBERS' | translate }}</legend>
            <input type="number" class="input input-bordered input-sm w-full" [(ngModel)]="prevMemberCount" min="0" />
          </fieldset>

          <fieldset class="fieldset">
            <legend class="fieldset-legend">{{ 'RUEDA_SIMULATOR.PREV_INSTALLMENT' | translate }}</legend>
            <input type="number" class="input input-bordered input-sm w-full" [(ngModel)]="prevInstallmentAmount" min="0" />
          </fieldset>

        </div>
      </div>

      <!-- Simulator output -->
      <app-rueda-simulator
        [newMemberCount]="memberCount"
        [newLoanAmount]="loanAmount"
        [newInterestRate]="interestRate"
        [newContributionAmount]="contributionAmount"
        [newRoundingUnit]="roundingUnit"
        [startMonth]="startMonth"
        [startYear]="startYear"
        [initialCashBalance]="initialBalance"
        [previousRuedaInstallment]="prevInstallmentAmount"
        [previousRuedaMembers]="prevMembersArray()">
      </app-rueda-simulator>
    </div>
  `,
})
export class RuedaSimulatorPageComponent {
  memberCount = 0;
  loanAmount = 0;
  interestRate = 10;
  contributionAmount = 0;
  roundingUnit: 0 | 500 | 1000 = 1000;
  startMonth = new Date().getMonth() + 1;
  startYear = new Date().getFullYear();
  initialBalance = 0;
  prevMemberCount = 0;
  prevInstallmentAmount = 0;

  months = Array.from({ length: 12 }, (_, i) => ({ value: i + 1 }));

  prevMembersArray(): Array<{ memberId: string; installmentAmount: number }> {
    return Array.from({ length: this.prevMemberCount }, (_, i) => ({
      memberId: `prev-${i}`,
      installmentAmount: this.prevInstallmentAmount,
    }));
  }
}
