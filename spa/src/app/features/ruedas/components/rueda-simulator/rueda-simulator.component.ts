import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { DecimalPipe, CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MembersService } from '../../../members/services/members.service';
import { RuedasService } from '../../services/ruedas.service';
import { RuedaSimulatorResult, RuedaSimulatorRequest } from '../../models/rueda-simulator.model';
import { RuedaSimulatorService } from '../../services/rueda-simulator.service';
import { RuedaSimulatorFormGroup } from '../../models/rueda-simulator-form.model';

@Component({
  selector: 'app-rueda-simulator',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterLink, DecimalPipe],
  template: `
    <div class="max-w-6xl mx-auto">
      <div class="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between mb-4">
        <div>
          <h2 class="text-2xl font-bold">Simulador de nueva rueda</h2>
          <p class="text-sm text-base-content/60 mt-1">Selecciona una rueda anterior y ajusta las variables para calcular el flujo mes a mes.</p>
        </div>
        <a routerLink="../ruedas" class="btn btn-ghost btn-sm">← Volver a ruedas</a>
      </div>

      <form [formGroup]="form" class="grid gap-4 lg:grid-cols-[1.3fr_0.7fr]">
        <div class="grid gap-4">
          <div class="grid gap-1">
            <label class="text-sm font-medium">Rueda anterior</label>
            <select class="select select-bordered w-full" formControlName="previousRuedaId" (change)="onPreviousRuedaChanged()">
              <option value="">Sin selección</option>
              @for (rueda of service.ruedas(); track rueda.id) {
                @if (rueda.status === 'completed') {
                  <option [value]="rueda.id">Rueda {{ rueda.ruedaNumber }} — {{ rueda.startMonth }}/{{ rueda.startYear }}</option>
                }
              }
            </select>
          </div>

          @if (selectedPreviousRueda()) {
            <div class="bg-base-200 rounded-lg p-4">
              <p class="text-sm font-semibold mb-2">Datos de la rueda anterior</p>
              <div class="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <div class="text-base-content/50">Préstamo total</div>
                  <div class="font-semibold">{{ selectedPreviousRueda()!.loanAmount | number:'1.0-0' }} Gs</div>
                </div>
                <div>
                  <div class="text-base-content/50">Interés</div>
                  <div class="font-semibold">{{ selectedPreviousRueda()!.interestRate }} %</div>
                </div>
                <div>
                  <div class="text-base-content/50">Aporte mensual</div>
                  <div class="font-semibold">{{ selectedPreviousRueda()!.contributionAmount | number:'1.0-0' }} Gs</div>
                </div>
                <div>
                  <div class="text-base-content/50">Estado</div>
                  <div class="font-semibold">{{ selectedPreviousRueda()!.status }}</div>
                </div>
              </div>
            </div>
          }

          <div class="grid gap-1 sm:grid-cols-2">
            <div class="grid gap-1">
              <label class="text-sm font-medium">Saldo inicial de caja (Gs)</label>
              <input type="number" class="input input-bordered w-full" formControlName="openingCash" min="0" />
            </div>
            <div class="grid gap-1">
              <label class="text-sm font-medium">Tasa de interés mensual (%)</label>
              <input type="number" class="input input-bordered w-full" formControlName="interestRate" min="0" />
            </div>
          </div>

          <div class="grid gap-1 sm:grid-cols-2">
            <div class="grid gap-1">
              <label class="text-sm font-medium">Participantes</label>
              <input type="number" class="input input-bordered w-full" formControlName="participantsCount" min="1" [max]="maxParticipants()" />
              <span class="text-xs text-base-content/50">Max participantes activos: {{ maxParticipants() }}</span>
            </div>
            <div class="grid gap-1">
              <label class="text-sm font-medium">Aporte por persona (Gs)</label>
              <input type="number" class="input input-bordered w-full" formControlName="contributionAmount" min="0" />
            </div>
          </div>

          <div class="grid gap-1">
            <label class="text-sm font-medium">Monto estimado del préstamo total (Gs)</label>
            <input type="number" class="input input-bordered w-full" formControlName="estimatedLoanAmount" min="0" />
          </div>

          <div class="grid gap-1">
            <label class="text-sm font-medium">Modo de pago</label>
            <div class="join">
              <button type="button" class="btn btn-sm join-item"
                [class.btn-primary]="form.controls.paymentMode.value === 'sequential'"
                [class.btn-outline]="form.controls.paymentMode.value !== 'sequential'"
                (click)="form.controls.paymentMode.setValue('sequential')">
                Secuencial
              </button>
              <button type="button" class="btn btn-sm join-item"
                [class.btn-primary]="form.controls.paymentMode.value === 'fixed'"
                [class.btn-outline]="form.controls.paymentMode.value !== 'fixed'"
                (click)="form.controls.paymentMode.setValue('fixed')">
                Fijo
              </button>
            </div>
          </div>

          @if (form.controls.paymentMode.value === 'fixed') {
            <div class="grid gap-1">
              <label class="text-sm font-medium">Pago fijo al préstamo por mes (Gs)</label>
              <input type="number" class="input input-bordered w-full" formControlName="fixedLoanPayment" min="0" />
            </div>
          }

          <div class="flex items-center gap-2 pt-2">
            <button type="button" class="btn btn-primary" (click)="runSimulation()" [disabled]="form.invalid">
              Calcular simulación
            </button>
            <button type="button" class="btn btn-ghost" (click)="reset()">Limpiar</button>
          </div>
        </div>

        <div class="bg-base-200 rounded-lg p-4">
          <p class="font-semibold mb-3">Resumen rápido</p>
          <div class="grid gap-3 text-sm">
            <div class="flex justify-between"><span>Recaudo mensual</span><span>{{ result()?.monthlyCollection | number:'1.0-0' }} Gs</span></div>
            <div class="flex justify-between"><span>Pago por persona</span><span>{{ result()?.perPersonPayment | number:'1.0-0' }} Gs</span></div>
            <div class="flex justify-between"><span>Plazo meses</span><span>{{ form.controls.participantsCount.value }}</span></div>
            <div class="flex justify-between"><span>Modalidad</span><span>{{ form.controls.paymentMode.value === 'fixed' ? 'Fijo' : 'Secuencial' }}</span></div>
            <div class="flex justify-between"><span>Saldo caja inicial</span><span>{{ form.controls.openingCash.value | number:'1.0-0' }} Gs</span></div>
            <div class="flex justify-between"><span>Monto estimado préstamo</span><span>{{ form.controls.estimatedLoanAmount.value | number:'1.0-0' }} Gs</span></div>
          </div>
        </div>
      </form>

      @if (showResult()) {
        <section class="mt-6">
          <div class="bg-base-200 rounded-lg p-4">
            <div class="grid gap-3 sm:grid-cols-3 text-sm">
              <div>
                <div class="text-base-content/50">Total recaudado</div>
                <div class="font-semibold">{{ result()!.totalCollected | number:'1.0-0' }} Gs</div>
              </div>
              <div>
                <div class="text-base-content/50">Total pagado al préstamo</div>
                <div class="font-semibold">{{ result()!.totalLoanPaid | number:'1.0-0' }} Gs</div>
              </div>
              <div>
                <div class="text-base-content/50">Caja al final</div>
                <div class="font-semibold">{{ result()!.endingCash | number:'1.0-0' }} Gs</div>
              </div>
              <div>
                <div class="text-base-content/50">Intereses totales</div>
                <div class="font-semibold">{{ result()!.totalInterestPaid | number:'1.0-0' }} Gs</div>
              </div>
              <div>
                <div class="text-base-content/50">Saldo pendiente del préstamo</div>
                <div class="font-semibold">{{ result()!.remainingLoanBalance | number:'1.0-0' }} Gs</div>
              </div>
            </div>
          </div>

          <div class="overflow-x-auto mt-4">
            <table class="table w-full">
              <thead>
                <tr>
                  <th>Mes</th>
                  <th>Recaudo</th>
                  <th>Interés</th>
                  <th>Pago al préstamo</th>
                  <th>Principal</th>
                  <th>Flujo caja</th>
                  <th>Saldo caja</th>
                  <th>Saldo préstamo</th>
                </tr>
              </thead>
              <tbody>
                @for (month of result()!.months; track month.position) {
                  <tr>
                    <td>{{ month.monthLabel }}</td>
                    <td>{{ month.monthlyCollection | number:'1.0-0' }}</td>
                    <td>{{ month.interestCost | number:'1.0-0' }}</td>
                    <td>{{ month.loanPayment | number:'1.0-0' }}</td>
                    <td>{{ month.principalPayment | number:'1.0-0' }}</td>
                    <td>{{ month.cashFlow | number:'1.0-0' }}</td>
                    <td>{{ month.endingCash | number:'1.0-0' }}</td>
                    <td>{{ month.remainingLoanBalance | number:'1.0-0' }}</td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </section>
      }
    </div>
  `,
})
export class RuedaSimulatorComponent implements OnInit {
  readonly service = inject(RuedasService);
  readonly membersService = inject(MembersService);
  private readonly route = inject(ActivatedRoute);
  private readonly simulator = inject(RuedaSimulatorService);
  private readonly fb = inject(FormBuilder);

  groupId = '';
  result = signal<RuedaSimulatorResult | null>(null);
  selectedPreviousRueda = signal<null | { id: string; ruedaNumber: number; loanAmount: number; interestRate: number; contributionAmount: number; installmentAmount?: number; status: string; startMonth: number; startYear: number }>(null);

  form: FormGroup<RuedaSimulatorFormGroup> = this.fb.nonNullable.group({
    previousRuedaId: [''],
    openingCash: [0, [Validators.required, Validators.min(0)]],
    interestRate: [10, [Validators.required, Validators.min(0)]],
    participantsCount: [1, [Validators.required, Validators.min(1)]],
    contributionAmount: [0, [Validators.required, Validators.min(0)]],
    estimatedLoanAmount: [0, [Validators.required, Validators.min(0)]],
    paymentMode: ['sequential' as 'sequential' | 'fixed', Validators.required],
    fixedLoanPayment: [0, [Validators.min(0)]],
  });

  maxParticipants = computed(() => {
    if (this.selectedPreviousRueda()) {
      // use active slots loaded for the selected previous rueda when available
      const slots = this.service.slots();
      const activeSlots = slots.filter(s => !!s.memberId).length;
      return Math.max(1, activeSlots || this.membersService.members().filter(m => m.isActive).length);
    }
    const activeMembers = this.membersService.members().filter(m => m.isActive).length;
    return Math.max(1, activeMembers);
  });

  showResult = computed(() => this.result() !== null);

  ngOnInit(): void {
    this.groupId = this.route.snapshot.parent?.paramMap.get('groupId') ?? '';
    this.service.loadByGroup(this.groupId);
    this.membersService.loadByGroup(this.groupId);
  }

  onPreviousRuedaChanged(): void {
    const previousId = this.form.controls.previousRuedaId.value;
    if (!previousId) {
      this.selectedPreviousRueda.set(null);
      return;
    }

    const rueda = this.service.ruedas().find(r => r.id === previousId);
    if (!rueda) {
      this.selectedPreviousRueda.set(null);
      return;
    }
    this.selectedPreviousRueda.set({
      id: rueda.id,
      ruedaNumber: rueda.ruedaNumber,
      loanAmount: rueda.loanAmount,
      interestRate: rueda.interestRate,
      contributionAmount: rueda.contributionAmount,
      installmentAmount: rueda.installmentAmount,
      status: rueda.status,
      startMonth: rueda.startMonth,
      startYear: rueda.startYear,
    });

    // load slots for the selected previous rueda to know active participants
    this.service.loadSlots(this.groupId, rueda.id);

    if (rueda.interestRate >= 0) {
      this.form.controls.interestRate.setValue(rueda.interestRate);
    }
    if (rueda.contributionAmount >= 0) {
      this.form.controls.contributionAmount.setValue(rueda.contributionAmount);
    }
    if (rueda.loanAmount >= 0) {
      this.form.controls.estimatedLoanAmount.setValue(rueda.loanAmount);
    }
  }

  runSimulation(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const request: RuedaSimulatorRequest = {
      previousRuedaId: this.form.controls.previousRuedaId.value || undefined,
      openingCash: Number(this.form.controls.openingCash.value),
      interestRate: Number(this.form.controls.interestRate.value),
      participantsCount: Number(this.form.controls.participantsCount.value),
      contributionAmount: Number(this.form.controls.contributionAmount.value),
      estimatedLoanAmount: Number(this.form.controls.estimatedLoanAmount.value),
      paymentMode: this.form.controls.paymentMode.value,
      fixedLoanPayment: Number(this.form.controls.fixedLoanPayment.value),
      previousInstallmentPerPerson: this.selectedPreviousRueda()?.installmentAmount ?? 0,
      previousActiveCount: this.service.slots().filter(s => !!s.memberId).length,
    };

    this.result.set(this.simulator.simulate(request));
  }

  reset(): void {
    this.form.reset({
      previousRuedaId: '',
      openingCash: 0,
      interestRate: 10,
      participantsCount: 1,
      contributionAmount: 0,
      estimatedLoanAmount: 0,
      paymentMode: 'sequential',
      fixedLoanPayment: 0,
    });
    this.selectedPreviousRueda.set(null);
    this.result.set(null);
  }
}
