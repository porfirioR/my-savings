// TEST MANUAL — Reset completo de la DB y re-seed "Ahorro 18"
//
// NO se ejecuta automáticamente (extensión .manual.ts, fuera del patrón *.e2e-spec.ts).
//
// Para ejecutarlo:
//   cd api
//   npx jest --config jest.e2e.config.ts --runInBand --testMatch="**/test/e2e/manual/*.manual.ts"
//
// Qué hace:
//   1. Borra TODOS los grupos de la base de datos (cascade elimina todo lo demás).
//   2. Crea el grupo "Ahorro 18" con 18 miembros.
//   3. Crea la rueda variable con los montos exactos de la tabla Excel.
//
// Tabla Excel (redondeo al techo de 500 Gs):
//   N°   Préstamo      Cuota
//    1     540.000     33.000
//    2     573.000     35.500
//    3     608.500     37.500
//    4     646.000     39.500
//    5     685.500     42.000
//    6     727.500     44.500
//    7     772.000     47.500
//    8     819.500     50.500
//    9     870.000     53.500
//   10     923.500     56.500
//   11     980.000     60.000
//   12   1.040.000     64.000
//   13   1.104.000     67.500
//   14   1.171.500     72.000
//   15   1.243.500     76.000
//   16   1.319.500     81.000
//   17   1.400.500     86.000
//   18   1.486.500     91.000
import { createClient } from '@supabase/supabase-js';
import { INestApplication } from '@nestjs/common';
import { createTestApp } from '../helpers/app.helper';
import { api } from '../helpers/api.helper';

// ─── Parámetros ───────────────────────────────────────────────────────────────
const MEMBERS      = 18;
const BASE         = MEMBERS * 30_000;  // 540.000
const INTEREST_PCT = 10;               // 10 %
const ROUND        = 500;
const CONTRIBUTION = 30_000;

function ceilToUnit(n: number, unit: number) {
  return Math.ceil(n / unit) * unit;
}

interface SlotCalc { position: number; loanAmount: number; installment: number }

function buildSlots(): SlotCalc[] {
  const slots: SlotCalc[] = [];
  let accumulated = 0;
  for (let i = 1; i <= MEMBERS; i++) {
    const loanAmount  = BASE + accumulated;
    const installment = ceilToUnit(loanAmount * (1 + INTEREST_PCT / 100) / MEMBERS, ROUND);
    slots.push({ position: i, loanAmount, installment });
    accumulated += installment;
  }
  return slots;
}

const SLOT_CALCS = buildSlots();

// ─── Suite ────────────────────────────────────────────────────────────────────
describe('MANUAL — Reset DB y seed Ahorro 18', () => {
  let app: INestApplication;
  let groupId: string;
  let ruedaId: string;
  let memberIds: string[];

  beforeAll(async () => {
    app = await createTestApp();
  });

  afterAll(async () => {
    await app.close();
  });

  // ── Paso 1: borrar todo ────────────────────────────────────────────────────
  it('borra todos los registros en el orden correcto', async () => {
    const client = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_KEY!,
    );
    // Borrar en orden para respetar las FK (hijos antes que padres)
    const tables = [
      'parallel_loan_payments',
      'rueda_monthly_payments',
      'rueda_slots',
      'parallel_loans',
      'cash_movements',
      'ruedas',
      'members',
      'groups',
    ];
    for (const table of tables) {
      const { error } = await client.from(table).delete().not('id', 'is', null);
      expect(error).toBeNull();
    }
    console.log('✓ Base de datos limpia');
  });

  // ── Paso 2: crear grupo ────────────────────────────────────────────────────
  it('crea el grupo "Ahorro 18"', async () => {
    const res = await api(app).post('/api/groups', {
      name: 'Ahorro 18',
      startMonth: 1,
      startYear: 2024,
    });
    expect(res.status).toBe(201);
    groupId = res.body.id;
    console.log(`✓ Grupo creado: ${groupId}`);
  });

  // ── Paso 3: crear 18 miembros ──────────────────────────────────────────────
  it('crea 18 miembros (Socio 1 … Socio 18)', async () => {
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
    console.log(`✓ ${MEMBERS} miembros creados`);
  });

  // ── Paso 4: crear rueda variable ──────────────────────────────────────────
  it('crea la rueda con slotAmountMode=variable y montos del Excel', async () => {
    const slots = SLOT_CALCS.map((s, idx) => ({
      memberId: memberIds[idx],
      position: s.position,
      loanAmount: s.loanAmount,
    }));

    const res = await api(app).post(`/api/groups/${groupId}/ruedas`, {
      type: 'new',
      loanAmount: BASE,
      interestRate: INTEREST_PCT,
      contributionAmount: CONTRIBUTION,
      roundingUnit: ROUND,
      startMonth: 1,
      startYear: 2024,
      slotAmountMode: 'variable',
      slots,
    });
    expect(res.status).toBe(201);
    ruedaId = res.body.id;
    console.log(`✓ Rueda creada: ${ruedaId}`);
  });

  // ── Paso 5: verificar slots ────────────────────────────────────────────────
  it('verifica que los 18 slots tienen los montos correctos del Excel', async () => {
    const res = await api(app).get(`/api/groups/${groupId}/ruedas/${ruedaId}`);
    expect(res.status).toBe(200);

    const slots: any[] = res.body.slots;
    expect(slots).toHaveLength(MEMBERS);

    const expectedLoans = [
        540_000,   573_000,   608_500,   646_000,   685_500,   727_500,
        772_000,   819_500,   870_000,   923_500,   980_000, 1_040_000,
      1_104_000, 1_171_500, 1_243_500, 1_319_500, 1_400_500, 1_486_500,
    ];

    const expectedInstallments = [
       33_000,  35_500,  37_500,  39_500,  42_000,  44_500,
       47_500,  50_500,  53_500,  56_500,  60_000,  64_000,
       67_500,  72_000,  76_000,  81_000,  86_000,  91_000,
    ];

    const sorted = slots.sort((a: any, b: any) => a.position - b.position);
    for (let i = 0; i < MEMBERS; i++) {
      expect(sorted[i].loanAmount).toBe(expectedLoans[i]);
      expect(sorted[i].installmentAmount).toBe(expectedInstallments[i]);
    }

    console.log('\n  Slot  Préstamo        Cuota');
    sorted.forEach((s: any, i: number) => {
      const loan = s.loanAmount.toLocaleString('es-PY');
      const inst = s.installmentAmount.toLocaleString('es-PY');
      console.log(`  ${String(i + 1).padStart(2)}    ${loan.padStart(10)}    ${inst.padStart(8)}`);
    });
  });
});
