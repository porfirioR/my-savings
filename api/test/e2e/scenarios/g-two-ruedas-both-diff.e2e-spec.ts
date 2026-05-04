/**
 * Scenario G: Two ruedas, both with cash box differences (positive + negative).
 *
 * Rueda 1: loanAmount=300000, contribution=10000 → 15×10000=150000, diff=+150000 → IN collection
 * Rueda 2: loanAmount=150000, contribution=20000 → 15×20000=300000, diff=-150000 → OUT disbursement
 *
 * Expected cash box:
 *   - OUT disbursement 300000 (rueda 1 loan)
 *   - IN  collection   150000 (rueda 1 diff)
 *   - OUT disbursement 150000 (rueda 2 loan)
 *   - OUT disbursement 150000 (rueda 2 negative diff, extra collected)
 */
import { INestApplication } from '@nestjs/common';
import { createTestApp } from '../helpers/app.helper';
import { createGroup, createMembers, createRueda, generateAndPayAll, getCashBox } from '../helpers/api.helper';
import { deleteTestGroup } from '../helpers/cleanup.helper';

describe('Scenario G — two ruedas, positive diff + negative diff', () => {
  let app: INestApplication;
  let groupId: string;

  beforeAll(async () => {
    app = await createTestApp();
    const group = await createGroup(app, 'TEST-G');
    groupId = group.id;
  });

  afterAll(async () => {
    await deleteTestGroup(groupId);
    await app.close();
  });

  it('creates collection for rueda1 and extra OUT disbursement for rueda2', async () => {
    const members = await createMembers(app, groupId, 15);

    const rueda1 = await createRueda(app, groupId, members, {
      loanAmount: 300_000, contributionAmount: 10_000, startMonth: 1, startYear: 2024,
    });
    const rueda2 = await createRueda(app, groupId, members, {
      loanAmount: 150_000, contributionAmount: 20_000, startMonth: 2, startYear: 2024,
    });

    await generateAndPayAll(app, groupId, rueda1.id, 1, 2024);
    await generateAndPayAll(app, groupId, rueda2.id, 2, 2024);

    const { movements } = await getCashBox(app, groupId);
    const automatic = movements.filter(m => m.sourceType === 'automatic');

    expect(automatic).toHaveLength(4);

    const inMovements = automatic.filter(m => m.type === 'in');
    const outMovements = automatic.filter(m => m.type === 'out');

    expect(inMovements).toHaveLength(1);
    expect(inMovements[0].category).toBe('rueda_collection');
    expect(inMovements[0].amount).toBe(150_000);

    expect(outMovements).toHaveLength(3);
    const outAmounts = outMovements.map(m => m.amount).sort((a, b) => a - b);
    expect(outAmounts).toEqual([150_000, 150_000, 300_000]);
  });
});
