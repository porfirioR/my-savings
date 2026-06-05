/**
 * Escenario H: Dos ruedas — Rueda 1 secuencial (Ahorro 18) + Rueda 2 continua constante.
 *
 * Rueda 1 (tipo='new', slotAmountMode='variable'):
 *   - Idéntica a Ahorro 18: 18 miembros, aporte 30.000, interés 10 %, redondeo 500 (techo)
 *   - Préstamos variables: slot 1 = 540.000 → slot 18 = 1.486.500
 *
 * Rueda 2 (tipo='continua', slotAmountMode='constant'):
 *   - 18 miembros (mismos que rueda 1)
 *   - Préstamo fijo: 1.200.000 Gs (monto redondo)
 *   - Interés: 10 %  |  Redondeo: 1.000 Gs (techo)
 *   - Cuota rueda 2: ceil(1.200.000 × 1,10 / 18 / 1.000) × 1.000 = 74.000 Gs
 *   - Aporte mensual: 10.000 Gs
 *   - previousLoanAmount por slot = cuota de rueda 1 correspondiente
 *
 * Regla "modo constante — sobrante a caja":
 *   Cada mes: recaudado (in) > desembolso (out) → saldo crece
 *
 * Mes 1 de rueda 2:
 *   - 18 miembros pagan cuota anterior (rueda 1) + 10.000 aporte
 *   - Recaudado = Σ(prevInstall_i) + 18×10.000 = 1.037.500 + 180.000 = 1.217.500
 *   - Desembolso = 1.200.000
 *   - Sobrante = 17.500 → saldo = 17.500 > 0 ✓
 *
 * Cumulative balance per month: [17.500, 76.000, 173.000, ..., 4.446.000]
 * Saldo final = 4.446.000 Gs (nunca negativo) ✓
 */
import { INestApplication } from '@nestjs/common';
import { createTestApp } from '../helpers/app.helper';
import { activateRueda, api, createGroup, generateAndPayAll, getCashBox } from '../helpers/api.helper';
import { deleteTestGroup } from '../helpers/cleanup.helper';

// ─── Parámetros Rueda 1 (Ahorro 18) ─────────────────────────────────────────
const MEMBERS       = 18;
const BASE          = MEMBERS * 30_000;   // 540.000
const INTEREST_R1   = 1.10;
const ROUND_R1      = 500;
const CONTRIBUTION_R1 = 30_000;

function ceilToUnit(n: number, unit: number) {
  return Math.ceil(n / unit) * unit;
}

interface SlotCalc { position: number; loanAmount: number; installment: number }

function buildR1Slots(): SlotCalc[] {
  const slots: SlotCalc[] = [];
  let accumulated = 0;
  for (let i = 1; i <= MEMBERS; i++) {
    const loanAmount  = BASE + accumulated;
    const installment = ceilToUnit(loanAmount * INTEREST_R1 / MEMBERS, ROUND_R1);
    slots.push({ position: i, loanAmount, installment });
    accumulated += installment;
  }
  return slots;
}

const R1_SLOTS = buildR1Slots();

// ─── Parámetros Rueda 2 (continua, constante) ────────────────────────────────
const LOAN_R2         = 1_200_000;
const INTEREST_R2     = 1.10;
const ROUND_R2        = 1_000;
const CONTRIBUTION_R2 = 10_000;
const INS_R2          = ceilToUnit(LOAN_R2 * INTEREST_R2 / MEMBERS, ROUND_R2); // 74.000
const CURRENT_PAY     = INS_R2 + CONTRIBUTION_R2; // 84.000 — lo que pagan quienes ya recibieron

// totalCollected para cada mes de rueda 2
function buildR2Collections(): number[] {
  const prevInstalls = R1_SLOTS.map(s => s.installment);
  return Array.from({ length: MEMBERS }, (_, idx) => {
    const p = idx + 1;  // posición (1-based)
    let total = 0;
    for (let i = 0; i < MEMBERS; i++) {
      if (i < p - 1) {
        // ya recibieron en rueda 2 → pagan cuota r2 + aporte
        total += CURRENT_PAY;
      } else {
        // todavía no recibieron → pagan cuota anterior (r1) + aporte
        total += prevInstalls[i] + CONTRIBUTION_R2;
      }
    }
    return total;
  });
}

const R2_COLLECTIONS = buildR2Collections();

// Saldos acumulados después de cada mes de rueda 2
const R2_CUMULATIVE_BALANCES = R2_COLLECTIONS.reduce<number[]>((acc, collected) => {
  const prev = acc.length > 0 ? acc[acc.length - 1] : 0;
  acc.push(prev + (collected - LOAN_R2));
  return acc;
}, []);

// Mes/año calendario de cada posición de rueda 2
const R2_START_MONTH = 7;
const R2_START_YEAR  = 2025;

function r2CalendarMonth(position: number) {
  const offset = (R2_START_MONTH - 1) + (position - 1);
  return { month: (offset % 12) + 1, year: R2_START_YEAR + Math.floor(offset / 12) };
}

// ─── Suite ───────────────────────────────────────────────────────────────────
describe('Escenario H — Rueda 1 (Ahorro 18 variable) + Rueda 2 (continua constante, caja creciente)', () => {
  let app: INestApplication;
  let groupId: string;
  let memberIds: string[];
  let rueda1Id: string;
  let rueda2Id: string;

  beforeAll(async () => {
    app = await createTestApp();
    const group = await createGroup(app, 'Ahorro 18 + R2');
    groupId = group.id;

    // Crear 18 miembros
    memberIds = [];
    for (let i = 1; i <= MEMBERS; i++) {
      const res = await api(app).post(`/api/groups/${groupId}/members`, {
        firstName: `Socio${i}`, lastName: 'H', position: i,
        joinedMonth: 1, joinedYear: 2024,
      });
      expect(res.status).toBe(201);
      memberIds.push(res.body.id);
    }

    // Rueda 1 — secuencial (Ahorro 18)
    const r1Res = await api(app).post(`/api/groups/${groupId}/ruedas`, {
      type: 'new',
      loanAmount: BASE,
      interestRate: (INTEREST_R1 - 1) * 100, // 10
      contributionAmount: CONTRIBUTION_R1,
      roundingUnit: ROUND_R1,
      startMonth: 1, startYear: 2024,
      slotAmountMode: 'variable',
      slots: R1_SLOTS.map((s, idx) => ({
        memberId: memberIds[idx],
        position: s.position,
        loanAmount: s.loanAmount,
      })),
    });
    expect(r1Res.status).toBe(201);
    rueda1Id = r1Res.body.id;
    await activateRueda(app, groupId, rueda1Id);

    // Rueda 2 — continua constante (monto fijo, sobrante a caja)
    const r2Res = await api(app).post(`/api/groups/${groupId}/ruedas`, {
      type: 'continua',
      loanAmount: LOAN_R2,
      interestRate: (INTEREST_R2 - 1) * 100, // 10
      contributionAmount: CONTRIBUTION_R2,
      roundingUnit: ROUND_R2,
      startMonth: R2_START_MONTH, startYear: R2_START_YEAR,
      slotAmountMode: 'constant',
      previousRuedaId: rueda1Id,
      slots: R1_SLOTS.map((s, idx) => ({
        memberId: memberIds[idx],
        position: s.position,
        previousLoanAmount: s.installment, // cuota que pagaban en rueda 1
      })),
    });
    expect(r2Res.status).toBe(201);
    rueda2Id = r2Res.body.id;
    await activateRueda(app, groupId, rueda2Id);
  });

  afterAll(async () => {
    await deleteTestGroup(groupId);
    await app.close();
  });

  // ── 1. Estructura de rueda 1 ──────────────────────────────────────────────
  describe('Rueda 1 — estructura Ahorro 18', () => {
    it('tiene 18 slots con montos crecientes', async () => {
      const res = await api(app).get(`/api/groups/${groupId}/ruedas/${rueda1Id}`);
      expect(res.status).toBe(200);
      expect(res.body.slots).toHaveLength(MEMBERS);

      const slots: any[] = res.body.slots.sort((a: any, b: any) => a.position - b.position);
      for (let i = 1; i < slots.length; i++) {
        expect(slots[i].loanAmount).toBeGreaterThan(slots[i - 1].loanAmount);
      }
    });

    it('slot 1 = 540.000, slot 18 = 1.486.500', async () => {
      const res = await api(app).get(`/api/groups/${groupId}/ruedas/${rueda1Id}`);
      const slots: any[] = res.body.slots;
      expect(slots.find((s: any) => s.position === 1).loanAmount).toBe(540_000);
      expect(slots.find((s: any) => s.position === 18).loanAmount).toBe(1_486_500);
    });
  });

  // ── 2. Estructura de rueda 2 ──────────────────────────────────────────────
  describe('Rueda 2 — estructura constante', () => {
    it(`todos los slots tienen loanAmount = ${LOAN_R2.toLocaleString()} Gs`, async () => {
      const res = await api(app).get(`/api/groups/${groupId}/ruedas/${rueda2Id}`);
      expect(res.status).toBe(200);
      const slots: any[] = res.body.slots;
      expect(slots).toHaveLength(MEMBERS);
      expect(slots.every((s: any) => s.loanAmount === LOAN_R2)).toBe(true);
    });

    it(`cuota rueda 2 = ${INS_R2.toLocaleString()} Gs (techo al 1.000)`, async () => {
      const res = await api(app).get(`/api/groups/${groupId}/ruedas/${rueda2Id}`);
      const slots: any[] = res.body.slots;
      expect(slots.every((s: any) => s.installmentAmount === INS_R2)).toBe(true);
    });

    it('previousLoanAmount de cada slot coincide con la cuota de rueda 1', async () => {
      const res = await api(app).get(`/api/groups/${groupId}/ruedas/${rueda2Id}`);
      const slots: any[] = res.body.slots.sort((a: any, b: any) => a.position - b.position);
      for (let i = 0; i < MEMBERS; i++) {
        expect(slots[i].previousLoanAmount).toBe(R1_SLOTS[i].installment);
      }
    });
  });

  // ── 3. Datos calculados esperados ─────────────────────────────────────────
  describe('Tabla de recaudación y saldos esperados por mes', () => {
    const expected = R2_COLLECTIONS.map((collected, idx) => ({
      position: idx + 1,
      collected,
      surplus: collected - LOAN_R2,
      cumulativeBalance: R2_CUMULATIVE_BALANCES[idx],
    }));

    it.each(expected)(
      'Mes $position: recaudado=$collected, sobrante=$surplus, saldo acumulado=$cumulativeBalance',
      ({ collected, surplus, cumulativeBalance }) => {
        expect(collected).toBeGreaterThan(LOAN_R2);   // siempre recauda más de lo que presta
        expect(surplus).toBeGreaterThan(0);           // sobrante positivo
        expect(cumulativeBalance).toBeGreaterThan(0); // saldo nunca negativo
      },
    );
  });

  // ── 4. Ejecución de los 18 meses de rueda 2 ──────────────────────────────
  describe('Caja crece cada mes durante rueda 2', () => {
    it('saldo aumenta mes a mes y termina en 4.446.000 Gs', async () => {
      let previousBalance = 0;

      for (let p = 1; p <= MEMBERS; p++) {
        const { month, year } = r2CalendarMonth(p);
        await generateAndPayAll(app, groupId, rueda2Id, month, year);

        const { balance } = await getCashBox(app, groupId);
        const current = balance.balance;

        expect(current).toBeGreaterThan(previousBalance);  // saldo crece
        expect(current).toBeGreaterThan(0);                // nunca negativo

        const expectedBalance = R2_CUMULATIVE_BALANCES[p - 1];
        expect(current).toBe(expectedBalance);

        previousBalance = current;
      }

      expect(previousBalance).toBe(4_446_000);
    }, 120_000); // timeout generoso para 18 meses
  });
});
