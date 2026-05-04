/**
 * Escenario real: "Ahorro 18" — préstamos variables acumulativos
 *
 * Parámetros base:
 *   - 18 miembros, aporte 30.000 Gs/mes, interés 10 %, redondeo 500 Gs (techo)
 *   - Aportes mensuales = 18 × 30.000 = 540.000 Gs  (BASE)
 *
 * Regla de negocio (no queda en caja):
 *   Cada persona recibe BASE + cuotas acumuladas de todos los anteriores.
 *   Así el dinero que los socios anteriores van pagando vuelve íntegramente
 *   al siguiente en vez de quedarse en caja.
 *
 *   Loan[n] = BASE + Σ installment[1..n-1]
 *   installment[n] = ceil(Loan[n] × 1,10 / 18 / 500) × 500
 *
 * Primeros 4 slots (tabla Excel):
 *   Slot 1: préstamo = 540.000  → cuota = ceil(594.000/18/500)×500 = 33.000
 *   Slot 2: préstamo = 573.000  → cuota = ceil(630.300/18/500)×500 = 35.500
 *   Slot 3: préstamo = 608.500  → cuota = ceil(669.350/18/500)×500 = 37.500
 *   Slot 4: préstamo = 646.000  → cuota = ceil(710.600/18/500)×500 = 39.500
 *   ... (escala hasta el slot 18 con 1.486.500)
 *
 * El test verifica:
 *   1. La rueda se crea con slotAmountMode='variable' y los montos son correctos.
 *   2. Cada slot tiene el installmentAmount correcto (redondeo al techo de 500).
 *   3. Los préstamos crecen monotónicamente (cada uno mayor que el anterior).
 *   4. Los primeros 2 meses generan los desembolsos correctos en caja.
 */
import { INestApplication } from '@nestjs/common';
import { createTestApp } from '../helpers/app.helper';
import { api, createGroup, generateAndPayAll, getCashBox } from '../helpers/api.helper';
import { deleteTestGroup } from '../helpers/cleanup.helper';

// ─── Parámetros ──────────────────────────────────────────────────────────────
const MEMBERS      = 18;
const BASE         = MEMBERS * 30_000;   // 540.000
const INTEREST     = 1.10;
const MONTHS       = MEMBERS;            // 18
const ROUND        = 500;               // redondeo al techo de 500 Gs (como en Excel)
const CONTRIBUTION = 30_000;

// La cuota siempre se redondea hacia ARRIBA al siguiente múltiplo de ROUND
// para que el grupo nunca recaude menos de lo necesario.
function ceilToUnit(n: number, unit: number) {
  return Math.ceil(n / unit) * unit;
}

// Pre-calcula los montos de préstamo e installment para los 18 slots
interface SlotCalc { position: number; loanAmount: number; installment: number }

function buildSlots(): SlotCalc[] {
  const slots: SlotCalc[] = [];
  let accumulated = 0;
  for (let i = 1; i <= MEMBERS; i++) {
    const loanAmount  = BASE + accumulated;
    const installment = ceilToUnit(loanAmount * INTEREST / MONTHS, ROUND);
    slots.push({ position: i, loanAmount, installment });
    accumulated += installment;
  }
  return slots;
}

const SLOT_CALCS = buildSlots();

// ─── Suite ───────────────────────────────────────────────────────────────────
describe('Ahorro 18 — préstamos variables acumulativos, interés 10 %', () => {
  let app: INestApplication;
  let groupId: string;
  let ruedaId: string;
  let memberIds: string[];

  beforeAll(async () => {
    app = await createTestApp();
    const group = await createGroup(app, 'Ahorro 18');
    groupId = group.id;

    // Crear 18 miembros
    memberIds = [];
    for (let i = 1; i <= MEMBERS; i++) {
      const res = await api(app).post(`/api/groups/${groupId}/members`, {
        firstName: `Socio${i}`,
        lastName: 'Ahorro',
        position: i,
        joinedMonth: 1,
        joinedYear: 2024,
      });
      expect(res.status).toBe(201);
      memberIds.push(res.body.id);
    }

    // Crear rueda con montos variables por slot
    const slots = SLOT_CALCS.map((s, idx) => ({
      memberId: memberIds[idx],
      position: s.position,
      loanAmount: s.loanAmount,
    }));

    const ruedaRes = await api(app).post(`/api/groups/${groupId}/ruedas`, {
      type: 'new',
      loanAmount: BASE,                    // monto base (slot 1)
      interestRate: (INTEREST - 1) * 100, // 10
      contributionAmount: CONTRIBUTION,
      roundingUnit: ROUND,                 // 500
      startMonth: 1,
      startYear: 2024,
      slotAmountMode: 'variable',
      slots,
    });
    expect(ruedaRes.status).toBe(201);
    ruedaId = ruedaRes.body.id;
  });

  afterAll(async () => {
    await deleteTestGroup(groupId);
    await app.close();
  });

  // ── 1. Estructura ──────────────────────────────────────────────────────────
  describe('Estructura de la rueda', () => {
    it('tiene 18 slots con montos variables', async () => {
      const res = await api(app).get(`/api/groups/${groupId}/ruedas/${ruedaId}`);
      expect(res.status).toBe(200);
      expect(res.body.slots).toHaveLength(MEMBERS);
    });

    it('cada slot tiene el loanAmount e installmentAmount correcto', async () => {
      const res = await api(app).get(`/api/groups/${groupId}/ruedas/${ruedaId}`);
      const slots: any[] = res.body.slots;

      for (const calc of SLOT_CALCS) {
        const slot = slots.find((s: any) => s.position === calc.position);
        expect(slot).toBeDefined();
        expect(slot.loanAmount).toBe(calc.loanAmount);
        expect(slot.installmentAmount).toBe(calc.installment);
      }
    });

    it('los préstamos crecen slot a slot (cada uno mayor que el anterior)', async () => {
      const res = await api(app).get(`/api/groups/${groupId}/ruedas/${ruedaId}`);
      const slots: any[] = res.body.slots.sort((a: any, b: any) => a.position - b.position);

      for (let i = 1; i < slots.length; i++) {
        expect(slots[i].loanAmount).toBeGreaterThan(slots[i - 1].loanAmount);
      }
    });

    it('slot 1: 540.000, slot 2: 573.000, slot 3: 608.500 (valores Excel)', async () => {
      const res = await api(app).get(`/api/groups/${groupId}/ruedas/${ruedaId}`);
      const slots: any[] = res.body.slots.sort((a: any, b: any) => a.position - b.position);

      expect(slots[0].loanAmount).toBe(540_000);
      expect(slots[1].loanAmount).toBe(573_000);
      expect(slots[2].loanAmount).toBe(608_500);
    });
  });

  // ── 2. Mes 1 — desembolso 540.000, diferencia = 0 ─────────────────────────
  describe('Mes 1 — desembolso igual a BASE (sin diferencia en caja)', () => {
    beforeAll(async () => {
      await generateAndPayAll(app, groupId, ruedaId, 1, 2024);
    });

    it('desembolso = 540.000, sin colección (difference = 0)', async () => {
      const { movements } = await getCashBox(app, groupId);
      const automatic = movements.filter(m => m.sourceType === 'automatic');
      expect(automatic).toHaveLength(1);
      expect(automatic[0].type).toBe('out');
      expect(automatic[0].category).toBe('rueda_disbursement');
      expect(automatic[0].amount).toBe(SLOT_CALCS[0].loanAmount); // 540.000
    });
  });

  // ── 3. Mes 2 — desembolso 573.000, diferencia = 0 ────────────────────────
  describe('Mes 2 — desembolso 573.000 (slot 1 ya paga cuota, financia slot 2)', () => {
    beforeAll(async () => {
      await generateAndPayAll(app, groupId, ruedaId, 2, 2024);
    });

    it('desembolso = 573.000, sin colección (diferencia = 0 porque cuota slot 1 cubre el extra)', async () => {
      const { movements } = await getCashBox(app, groupId);
      const automatic = movements.filter(m => m.sourceType === 'automatic');

      // Slot 1 paga cuota (33.000) + aporte (30.000) = 63.000
      // Slots 2-18 pagan aporte (30.000) × 17 = 510.000
      // Total recaudado = 573.000 = loanAmount slot 2 → diferencia = 0, no queda en caja ✓
      const disbursements = automatic.filter(m => m.category === 'rueda_disbursement');
      const collections   = automatic.filter(m => m.category === 'rueda_collection');

      expect(disbursements).toHaveLength(2);
      expect(collections).toHaveLength(0);

      const amounts = disbursements.map(m => m.amount).sort((a, b) => a - b);
      expect(amounts).toEqual([540_000, SLOT_CALCS[1].loanAmount]); // [540.000, 573.000]
    });
  });

  // ── 4. Verificación de montos calculados para los 18 slots ─────────────────
  describe('Tabla de préstamos esperados (todos los slots, valores Excel)', () => {
    const expected = [
      { position:  1, loan:   540_000 },
      { position:  2, loan:   573_000 },
      { position:  3, loan:   608_500 },
      { position:  4, loan:   646_000 },
      { position:  5, loan:   685_500 },
      { position:  6, loan:   727_500 },
      { position:  7, loan:   772_000 },
      { position:  8, loan:   819_500 },
      { position:  9, loan:   870_000 },
      { position: 10, loan:   923_500 },
      { position: 11, loan:   980_000 },
      { position: 12, loan: 1_040_000 },
      { position: 13, loan: 1_104_000 },
      { position: 14, loan: 1_171_500 },
      { position: 15, loan: 1_243_500 },
      { position: 16, loan: 1_319_500 },
      { position: 17, loan: 1_400_500 },
      { position: 18, loan: 1_486_500 },
    ];

    it.each(expected)('Slot $position → préstamo $loan Gs', ({ position, loan }) => {
      const calc = SLOT_CALCS.find(s => s.position === position);
      expect(calc?.loanAmount).toBe(loan);
    });
  });
});
