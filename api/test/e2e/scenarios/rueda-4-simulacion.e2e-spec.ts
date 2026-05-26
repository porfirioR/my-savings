/**
 * Semilla: "Rueda 4" — basada en la imagen del Excel de referencia
 *
 * Parámetros:
 *   - 15 personas, préstamo 3.000.000 Gs por persona
 *   - Interés 5 %, modalidad fija, aporte 10.000 Gs
 *   - Inicio: diciembre 2024 — Fin: febrero 2026 (15 meses)
 *
 * Cálculo de cuota fija:
 *   total = 3.000.000 × 1,05 = 3.150.000 Gs
 *   cuota = 3.150.000 / 15  = 210.000 Gs/mes
 *   pago mensual por persona = 210.000 (cuota) + 10.000 (aporte) = 220.000 Gs
 *
 * Caja esperada por mes (mismo comportamiento que el Excel):
 *   Mes 1: recauda 150.000 (solo aportes), desembolsa 3.000.000 → caja −2.850.000
 *   Mes 2: recauda 360.000 (cuota p1 + aportes), desembolsa 3.000.000 → caja acumula déficit
 *   ... la caja va cubriendo la diferencia hasta que todos tengan su préstamo
 *
 * ⚠️  Este test NO elimina los datos en afterAll.
 *     Su propósito es sembrar la base de datos de prueba con datos reales
 *     para usarlos en el simulador de siguiente rueda.
 *     Correlo una sola vez con: npm run test:e2e -- rueda-4-simulacion
 */
import { INestApplication } from '@nestjs/common';
import { createTestApp } from '../helpers/app.helper';
import { api, generateAndPayAll } from '../helpers/api.helper';

jest.setTimeout(180_000); // 3 minutos: 15 meses × ~17 requests c/u

// ─── Parámetros ───────────────────────────────────────────────────────────────
const LOAN_AMOUNT   = 3_000_000;
const INTEREST_RATE = 5;
const CONTRIBUTION  = 10_000;
const MEMBERS       = 15;
const INSTALLMENT   = Math.round(LOAN_AMOUNT * (1 + INTEREST_RATE / 100) / MEMBERS); // 210.000
const TOTAL_RETURN  = LOAN_AMOUNT + Math.round(LOAN_AMOUNT * INTEREST_RATE / 100);   // 3.150.000

// Personas de la imagen del Excel (en orden de posición)
const MEMBER_NAMES: { firstName: string; lastName: string }[] = [
  { firstName: 'Patricio',  lastName: 'Pérez' },
  { firstName: 'Esteban',   lastName: 'Cabrera' },
  { firstName: 'Sebastián', lastName: 'Schlicht' },
  { firstName: 'Romina',    lastName: 'Cabrera' },
  { firstName: 'Dolly',     lastName: 'Agüero' },
  { firstName: 'Natalia',   lastName: 'Schlichting' },
  { firstName: 'Arnaldo',   lastName: 'Villalba' },
  { firstName: 'Junior',    lastName: 'Pérez' },
  { firstName: 'Gabriel',   lastName: 'Cabrera' },
  { firstName: 'María',     lastName: 'González' },
  { firstName: 'Kati',      lastName: 'Gauto' },
  { firstName: 'Judit',     lastName: 'Pérez' },
  { firstName: 'Alicia',    lastName: 'Ortiz' },
  { firstName: 'Gabriela',  lastName: 'Garay' },
  { firstName: 'Natalia',   lastName: 'Schlichting' },
];

// 15 meses: diciembre 2024 → febrero 2026
const PAYMENT_MONTHS = [
  { month: 12, year: 2024 },
  { month:  1, year: 2025 },
  { month:  2, year: 2025 },
  { month:  3, year: 2025 },
  { month:  4, year: 2025 },
  { month:  5, year: 2025 },
  { month:  6, year: 2025 },
  { month:  7, year: 2025 },
  { month:  8, year: 2025 },
  { month:  9, year: 2025 },
  { month: 10, year: 2025 },
  { month: 11, year: 2025 },
  { month: 12, year: 2025 },
  { month:  1, year: 2026 },
  { month:  2, year: 2026 },
];

// ─── Suite ────────────────────────────────────────────────────────────────────
describe('Rueda 4 — 15 personas, 3.000.000 Gs, interés 5 %, inicio diciembre 2024', () => {
  let app: INestApplication;
  let groupId: string;
  let ruedaId: string;
  const memberIds: string[] = [];

  // ── Semilla ─────────────────────────────────────────────────────────────────
  beforeAll(async () => {
    app = await createTestApp();

    // Grupo
    const groupRes = await api(app).post('/api/groups', {
      name: 'Ahorro Diciembre 2024',
      startMonth: 11,
      startYear: 2024,
    });
    expect(groupRes.status).toBe(201);
    groupId = groupRes.body.id;

    // 15 miembros con nombres reales
    for (let i = 0; i < MEMBERS; i++) {
      const { firstName, lastName } = MEMBER_NAMES[i];
      const res = await api(app).post(`/api/groups/${groupId}/members`, {
        firstName,
        lastName,
        position: i + 1,
        joinedMonth: 11,
        joinedYear: 2024,
      });
      expect(res.status).toBe(201);
      memberIds.push(res.body.id);
    }

    // Rueda con cuota fija constante
    const slots = memberIds.map((id, i) => ({ memberId: id, position: i + 1 }));
    const ruedaRes = await api(app).post(`/api/groups/${groupId}/ruedas`, {
      type: 'new',
      loanAmount: LOAN_AMOUNT,
      interestRate: INTEREST_RATE,
      contributionAmount: CONTRIBUTION,
      roundingUnit: 0,
      startMonth: 12,
      startYear: 2024,
      slotAmountMode: 'constant',
      slots,
    });
    expect(ruedaRes.status).toBe(201);
    ruedaId = ruedaRes.body.id;

    // Procesar los 15 meses
    for (const { month, year } of PAYMENT_MONTHS) {
      await generateAndPayAll(app, groupId, ruedaId, month, year);
    }

    // Marcar la rueda como completada (la transición de status es manual)
    const completeRes = await api(app).put(`/api/groups/${groupId}/ruedas/${ruedaId}`, {
      status: 'completed',
      endMonth: 2,
      endYear: 2026,
    });
    expect(completeRes.status).toBe(200);
  });

  // ⚠️  afterAll solo cierra la app — NO borra los datos
  afterAll(async () => {
    await app.close();
  });

  // ── Constantes (verificación offline, no requiere DB) ──────────────────────
  it('la cuota fija es 210.000 Gs (3.000.000 × 1,05 / 15)', () => {
    expect(INSTALLMENT).toBe(210_000);
  });

  it('el total a devolver por persona es 3.150.000 Gs', () => {
    expect(TOTAL_RETURN).toBe(3_150_000);
  });

  it('el pago mensual por persona es 220.000 Gs (cuota + aporte)', () => {
    expect(INSTALLMENT + CONTRIBUTION).toBe(220_000);
  });

  // ── Estructura de la rueda (requiere DB) ───────────────────────────────────
  it('la rueda tiene 15 slots creados', async () => {
    const res = await api(app).get(`/api/groups/${groupId}/ruedas/${ruedaId}`);
    expect(res.status).toBe(200);
    expect(res.body.slots).toHaveLength(MEMBERS);
  });

  it('todos los slots tienen loanAmount 3.000.000 e installmentAmount 210.000', async () => {
    const res = await api(app).get(`/api/groups/${groupId}/ruedas/${ruedaId}`);
    const slots: { loanAmount: number; installmentAmount: number; totalToReturn: number }[] = res.body.slots;

    for (const slot of slots) {
      expect(slot.loanAmount).toBe(LOAN_AMOUNT);
      expect(slot.installmentAmount).toBe(INSTALLMENT);
      expect(slot.totalToReturn).toBe(TOTAL_RETURN);
    }
  });

  it('la rueda queda en estado "completed" después de los 15 meses', async () => {
    const res = await api(app).get(`/api/groups/${groupId}/ruedas/${ruedaId}`);
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('completed');
  });

  it('los slots tienen posiciones del 1 al 15', async () => {
    const res = await api(app).get(`/api/groups/${groupId}/ruedas/${ruedaId}`);
    const positions: number[] = res.body.slots
      .map((s: { position: number }) => s.position)
      .sort((a: number, b: number) => a - b);
    expect(positions).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]);
  });

  it('la rueda tiene los parámetros correctos (interés, aporte, inicio)', async () => {
    const res = await api(app).get(`/api/groups/${groupId}/ruedas/${ruedaId}`);
    expect(res.status).toBe(200);
    expect(res.body.interestRate).toBe(INTEREST_RATE);
    expect(res.body.contributionAmount).toBe(CONTRIBUTION);
    expect(res.body.startMonth).toBe(12);
    expect(res.body.startYear).toBe(2024);
  });
});
