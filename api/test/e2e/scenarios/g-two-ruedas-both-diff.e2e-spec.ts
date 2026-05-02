/**
 * Scenario G: Two ruedas, both with cash box differences (positive + negative).
 *
 * Rueda 1 (month 1/2024): loanAmount=300000, contribution=10000 → diff=+130000 (IN)
 * Rueda 2 (month 2/2024): loanAmount=150000, contribution=20000 → diff=-160000 (OUT)
 *
 * Expected cash box:
 *   - OUT disbursement 300000 (rueda 1)
 *   - IN  collection   130000 (rueda 1 diff)
 *   - OUT disbursement 150000 (rueda 2)
 *   - OUT adjustment   160000 (rueda 2 diff, collected > loaned)
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

  it('creates collection for rueda1 and adjustment OUT for rueda2', async () => {
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
    const automatic = movements.filter(m => m.source_type === 'automatic');

    expect(automatic).toHaveLength(4);

    const inMovements = automatic.filter(m => m.type === 'in');
    const outMovements = automatic.filter(m => m.type === 'out');

    expect(inMovements).toHaveLength(1);
    expect(inMovements[0].category).toBe('rueda_collection');
    expect(inMovements[0].amount).toBe(130_000);

    expect(outMovements).toHaveLength(3);
    const outAmounts = outMovements.map(m => m.amount).sort((a, b) => a - b);
    expect(outAmounts).toEqual([150_000, 160_000, 300_000]);
  });
});
