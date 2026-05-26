import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { DecimalPipe, CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MembersService } from '../../../members/services/members.service';
import { RuedasService } from '../../services/ruedas.service';
import { RuedaSimulatorResult, RuedaSimulatorRequest, NextRuedaResult, NextRuedaSimulatorRequest } from '../../models/rueda-simulator.model';
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
                  <div class="text-base-content/50">Cuota por persona</div>
                  <div class="font-semibold">{{ selectedPreviousRueda()!.installmentAmount | number:'1.0-0' }} Gs</div>
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
              <label class="text-sm font-medium">Tasa de interés (%)</label>
              <input type="number" class="input input-bordered w-full" formControlName="interestRate" min="0" />
            </div>
          </div>

          <div class="grid gap-1 sm:grid-cols-2">
            <div class="grid gap-1">
              <label class="text-sm font-medium">Participantes</label>
              <input type="number" class="input input-bordered w-full" formControlName="participantsCount" min="1" [max]="maxParticipants()" />
              <span class="text-xs text-base-content/50">Máximo (miembros activos de la rueda): {{ maxParticipants() }}</span>
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
                [class.btn-primary]="form.controls.paymentMode.value === 'fixed'"
                [class.btn-outline]="form.controls.paymentMode.value !== 'fixed'"
                (click)="form.controls.paymentMode.setValue('fixed')">
                Fijo
              </button>
              <button type="button" class="btn btn-sm join-item"
                [class.btn-primary]="form.controls.paymentMode.value === 'sequential'"
                [class.btn-outline]="form.controls.paymentMode.value !== 'sequential'"
                (click)="form.controls.paymentMode.setValue('sequential')">
                Secuencial
              </button>
            </div>
          </div>

          @if (computedFixedPayment() > 0) {
            <div class="bg-base-200 rounded-lg p-4">
              <p class="text-sm font-semibold mb-2">Pago fijo calculado (modo fijo)</p>
              <div class="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <div class="text-base-content/50">Cuota préstamo mensual total</div>
                  <div class="font-semibold text-primary">{{ computedFixedPayment() | number:'1.0-0' }} Gs</div>
                </div>
                <div>
                  <div class="text-base-content/50">Cuota préstamo por persona</div>
                  <div class="font-semibold text-primary">{{ computedFixedPaymentPerPerson() | number:'1.0-0' }} Gs</div>
                </div>
                <div>
                  <div class="text-base-content/50">Total por persona/mes (cuota + aporte)</div>
                  <div class="font-semibold">{{ computedTotalPerPerson() | number:'1.0-0' }} Gs</div>
                </div>
              </div>
            </div>
          }

          @if (form.controls.paymentMode.value === 'fixed') {
            <div class="grid gap-1">
              <label class="text-sm font-medium">Pago fijo al préstamo por mes (Gs) <span class="text-xs text-base-content/50">(dejar en 0 para usar el calculado)</span></label>
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
            <div class="flex justify-between"><span>Recaudo mes 1</span><span>{{ result()?.monthlyCollection | number:'1.0-0' }} Gs</span></div>
            <div class="flex justify-between"><span>Pago total por persona</span><span>{{ result()?.perPersonPayment | number:'1.0-0' }} Gs</span></div>
            <div class="flex justify-between"><span>— Aporte</span><span>{{ form.controls.contributionAmount.value | number:'1.0-0' }} Gs</span></div>
            <div class="flex justify-between"><span>— Cuota préstamo</span><span>{{ result()?.perPersonLoanPayment | number:'1.0-0' }} Gs</span></div>
            <div class="flex justify-between"><span>Plazo (meses)</span><span>{{ form.controls.participantsCount.value }}</span></div>
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
            <table class="table w-full text-sm">
              <thead>
                <tr>
                  <th>Mes</th>
                  <th>Aportes nuevos</th>
                  <th>Pool rueda ant.</th>
                  <th>Pagadores ant.</th>
                  <th>Total recaudo</th>
                  <th>Interés</th>
                  <th>Pago préstamo</th>
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
                    <td>{{ month.newContributions | number:'1.0-0' }}</td>
                    <td>{{ month.previousPool | number:'1.0-0' }}</td>
                    <td>{{ month.previousPayersCount }}</td>
                    <td class="font-semibold">{{ month.monthlyCollection | number:'1.0-0' }}</td>
                    <td>{{ month.interestCost | number:'1.0-0' }}</td>
                    <td>{{ month.loanPayment | number:'1.0-0' }}</td>
                    <td>{{ month.principalPayment | number:'1.0-0' }}</td>
                    <td [class.text-error]="month.cashFlow < 0">{{ month.cashFlow | number:'1.0-0' }}</td>
                    <td>{{ month.endingCash | number:'1.0-0' }}</td>
                    <td>{{ month.remainingLoanBalance | number:'1.0-0' }}</td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </section>
      }

      <!-- Next Rueda Transition Simulator -->
      <div class="divider mt-8">Simulación de siguiente rueda</div>
      <section class="mt-2">
        <div class="grid gap-4 sm:grid-cols-2 mb-4">
          <div class="grid gap-1">
            <label class="text-sm font-medium">Préstamo por persona en la nueva rueda (Gs)</label>
            <input type="number" class="input input-bordered w-full" [formControl]="form.controls.loanPerPerson" min="0" />
            <span class="text-xs text-base-content/50">
              Cuota nueva: {{ nextNewInstallment() | number:'1.0-0' }} Gs/mes · Total: {{ nextTotalPerPerson() | number:'1.0-0' }} Gs/mes
            </span>
          </div>
          <div class="flex items-end pb-1">
            <button type="button" class="btn btn-secondary" (click)="runNextRuedaSimulation()"
              [disabled]="!selectedPreviousRueda() || form.controls.participantsCount.value < 1">
              Simular transición
            </button>
          </div>
        </div>

        @if (!selectedPreviousRueda()) {
          <p class="text-sm text-base-content/50">Seleccioná una rueda anterior para habilitar la simulación de transición.</p>
        }

        @if (nextResult()) {
          <!-- Summary row -->
          <div class="bg-base-200 rounded-lg p-4 mb-4">
            <div class="grid gap-3 sm:grid-cols-4 text-sm">
              <div>
                <div class="text-base-content/50">Cuota nueva por persona</div>
                <div class="font-semibold text-primary">{{ nextResult()!.newInstallmentPerPerson | number:'1.0-0' }} Gs</div>
              </div>
              <div>
                <div class="text-base-content/50">Total préstamos entregados</div>
                <div class="font-semibold">{{ nextResult()!.totalDisbursed | number:'1.0-0' }} Gs</div>
              </div>
              <div>
                <div class="text-base-content/50">Caja final</div>
                <div class="font-semibold" [class.text-success]="nextResult()!.finalCajaBalance >= 0" [class.text-error]="nextResult()!.finalCajaBalance < 0">
                  {{ nextResult()!.finalCajaBalance | number:'1.0-0' }} Gs
                </div>
              </div>
              <div>
                <div class="text-base-content/50">Caja inicial</div>
                <div class="font-semibold">{{ form.controls.openingCash.value | number:'1.0-0' }} Gs</div>
              </div>
            </div>
          </div>

          <!-- Monthly cash flow table -->
          <h4 class="font-semibold text-sm mb-2">Flujo mensual de caja</h4>
          <div class="overflow-x-auto mb-6">
            <table class="table table-xs w-full text-xs">
              <thead>
                <tr>
                  <th>Mes</th>
                  <th>Pagadores rueda ant.</th>
                  <th>Total cuotas ant.</th>
                  <th>Pagadores rueda nueva</th>
                  <th>Total cuotas nuevas</th>
                  <th>Aportes</th>
                  <th>Total ingreso</th>
                  <th>Préstamo entregado</th>
                  <th>Flujo neto</th>
                  <th>Saldo caja</th>
                </tr>
              </thead>
              <tbody>
                @for (m of nextResult()!.months; track m.monthIndex) {
                  <tr>
                    <td>{{ m.monthIndex }}</td>
                    <td>{{ m.oldInstallmentPayers }}</td>
                    <td>{{ m.oldInstallmentsTotal | number:'1.0-0' }}</td>
                    <td>{{ m.newInstallmentPayers }}</td>
                    <td>{{ m.newInstallmentsTotal | number:'1.0-0' }}</td>
                    <td>{{ m.contributionsTotal | number:'1.0-0' }}</td>
                    <td class="font-semibold">{{ m.totalIncoming | number:'1.0-0' }}</td>
                    <td class="text-warning">{{ m.loanDisbursed | number:'1.0-0' }}</td>
                    <td [class.text-success]="m.netCashFlow >= 0" [class.text-error]="m.netCashFlow < 0">
                      {{ m.netCashFlow >= 0 ? '+' : '' }}{{ m.netCashFlow | number:'1.0-0' }}
                    </td>
                    <td [class.text-success]="m.cajaBalance >= 0" [class.text-error]="m.cajaBalance < 0">
                      {{ m.cajaBalance | number:'1.0-0' }}
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>

          <!-- Per-person matrix -->
          <h4 class="font-semibold text-sm mb-2">Pagos por persona por mes</h4>
          <p class="text-xs text-base-content/50 mb-2">
            <span class="inline-block w-3 h-3 rounded bg-warning/30 mr-1"></span>Recibe préstamo (aún paga cuota ant.)
            <span class="inline-block w-3 h-3 rounded bg-success/30 mx-1 ml-3"></span>Paga cuota nueva
            <span class="inline-block w-3 h-3 rounded bg-base-300 mx-1 ml-3"></span>Paga cuota anterior
          </p>
          <div class="overflow-x-auto">
            <table class="table table-xs w-full text-xs">
              <thead>
                <tr>
                  <th>Persona</th>
                  @for (m of nextResult()!.months; track m.monthIndex) {
                    <th class="text-center">M{{ m.monthIndex }}</th>
                  }
                </tr>
              </thead>
              <tbody>
                @for (personRow of nextResult()!.matrix; track $index) {
                  <tr>
                    <td class="whitespace-nowrap">{{ personName($index) }}</td>
                    @for (cell of personRow; track cell.month) {
                      <td class="text-center"
                        [class.bg-warning]="cell.paymentType === 'loan_received'"
                        [class.bg-success]="cell.paymentType === 'new_installment'"
                        [class.bg-opacity-20]="true"
                        [title]="cell.paymentType === 'loan_received' ? 'Recibe préstamo · paga ' + cell.totalAmount + ' Gs' : cell.totalAmount + ' Gs'">
                        {{ cell.totalAmount | number:'1.0-0' }}
                      </td>
                    }
                  </tr>
                }
              </tbody>
            </table>
          </div>
        }
      </section>
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
  nextResult = signal<NextRuedaResult | null>(null);
  selectedPreviousRueda = signal<null | {
    id: string;
    ruedaNumber: number;
    loanAmount: number;
    interestRate: number;
    contributionAmount: number;
    installmentAmount: number;
    status: string;
    startMonth: number;
    startYear: number;
  }>(null);

  form: FormGroup<RuedaSimulatorFormGroup> = this.fb.nonNullable.group({
    previousRuedaId: [''],
    openingCash: [0, [Validators.required, Validators.min(0)]],
    interestRate: [10, [Validators.required, Validators.min(0)]],
    participantsCount: [1, [Validators.required, Validators.min(1)]],
    contributionAmount: [0, [Validators.required, Validators.min(0)]],
    estimatedLoanAmount: [0, [Validators.required, Validators.min(0)]],
    paymentMode: ['fixed' as 'sequential' | 'fixed', Validators.required],
    fixedLoanPayment: [0, [Validators.min(0)]],
    loanPerPerson: [0, [Validators.min(0)]],
  });

  maxParticipants = computed(() => {
    if (this.selectedPreviousRueda()) {
      const activeSlots = this.service.slots().filter(s => !!s.memberId).length;
      if (activeSlots > 0) return activeSlots;
    }
    return Math.max(1, this.membersService.members().filter(m => m.isActive).length);
  });

  // Auto-computed fixed payment based on current form values
  computedFixedPayment = computed(() => {
    const loan = Number(this.form.controls.estimatedLoanAmount.value) || 0;
    const rate = Number(this.form.controls.interestRate.value) || 0;
    const participants = Number(this.form.controls.participantsCount.value) || 0;
    return this.simulator.computeFixedLoanPayment(loan, rate, participants);
  });

  computedFixedPaymentPerPerson = computed(() => {
    const participants = Number(this.form.controls.participantsCount.value) || 1;
    return Math.round(this.computedFixedPayment() / participants);
  });

  computedTotalPerPerson = computed(() => {
    return this.computedFixedPaymentPerPerson() + (Number(this.form.controls.contributionAmount.value) || 0);
  });

  showResult = computed(() => this.result() !== null);

  nextNewInstallment = computed(() => {
    const loan = Number(this.form.controls.loanPerPerson.value) || 0;
    const rate = Number(this.form.controls.interestRate.value) || 0;
    const N = Number(this.form.controls.participantsCount.value) || 1;
    if (N <= 0 || loan <= 0) return 0;
    return Math.round((loan + Math.round(loan * rate / 100)) / N);
  });

  nextTotalPerPerson = computed(() => {
    return this.nextNewInstallment() + (Number(this.form.controls.contributionAmount.value) || 0);
  });

  personName(zeroBasedIndex: number): string {
    const slots = this.service.slots();
    if (slots.length > zeroBasedIndex && slots[zeroBasedIndex].memberName) {
      return slots[zeroBasedIndex].memberName;
    }
    return `Persona ${zeroBasedIndex + 1}`;
  }

  runNextRuedaSimulation(): void {
    const prev = this.selectedPreviousRueda();
    if (!prev) return;

    const req: NextRuedaSimulatorRequest = {
      openingCash: Number(this.form.controls.openingCash.value),
      oldInstallmentPerPerson: prev.installmentAmount,
      participantsCount: Math.min(
        Number(this.form.controls.participantsCount.value),
        this.maxParticipants(),
      ),
      loanPerPerson: Number(this.form.controls.loanPerPerson.value),
      interestRate: Number(this.form.controls.interestRate.value),
      contributionAmount: Number(this.form.controls.contributionAmount.value),
    };

    this.nextResult.set(this.simulator.simulateNextRueda(req));
  }

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

    // Load slots to determine active participant count (max for new rueda)
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

    // Set participants to active slot count once slots load; slots() may not be populated yet
    // so we observe the count after load via a small delay effect — handled in slots signal reaction
    const activeSlots = this.service.slots().filter(s => !!s.memberId).length;
    if (activeSlots > 0) {
      this.form.controls.participantsCount.setValue(activeSlots);
    }

    this.result.set(null);
  }

  runSimulation(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const participantsCount = Math.min(
      Number(this.form.controls.participantsCount.value),
      this.maxParticipants(),
    );

    const request: RuedaSimulatorRequest = {
      previousRuedaId: this.form.controls.previousRuedaId.value || undefined,
      openingCash: Number(this.form.controls.openingCash.value),
      interestRate: Number(this.form.controls.interestRate.value),
      participantsCount,
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
      paymentMode: 'fixed',
      fixedLoanPayment: 0,
    });
    this.selectedPreviousRueda.set(null);
    this.result.set(null);
    this.nextResult.set(null);
  }
}
