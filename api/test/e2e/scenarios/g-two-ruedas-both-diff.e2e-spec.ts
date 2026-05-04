/**
 * Scenario G: Two ruedas — rueda 1 shortfall, rueda 2 surplus.
 *
 * Rueda 1: loanAmount=300000, contribution=10000 → collected=150000, net=-150000
 * Rueda 2: loanAmount=150000, contribution=20000 → collected=300000, net=+150000
 *
 * Expected cash box:
 *   - OUT disbursement 300000 + IN collection 150000  (rueda 1, net -150000)
 *   - OUT disbursement 150000 + IN collection 300000  (rueda 2, net +150000)
 *   Balance = 0
 */
import { INestApplication } from '@nestjs/common';
import { createTestApp } from '../helpers/app.helper';
import { createGroup, createMembers, createRueda, generateAndPayAll, getCashBox } from '../helpers/api.helper';
import { deleteTestGroup } from '../helpers/cleanup.helper';

describe('Scenario G — two ruedas, shortfall + surplus, net zero', () => {
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

  it('rueda 1 shortfall and rueda 2 surplus cancel out, balance = 0', async () => {
    const members = await createMembers(app, groupId, 15);

    const rueda1 = await createRueda(app, groupId, members, {
      loanAmount: 300_000, contributionAmount: 10_000, startMonth: 1, startYear: 2024,
    });
    const rueda2 = await createRueda(app, groupId, members, {
      loanAmount: 150_000, contributionAmount: 20_000, startMonth: 2, startYear: 2024,
    });

    await generateAndPayAll(app, groupId, rueda1.id, 1, 2024);
    await generateAndPayAll(app, groupId, rueda2.id, 2, 2024);

    const { movements, balance } = await getCashBox(app, groupId);
    const automatic = movements.filter(m => m.sourceType === 'automatic');

    expect(automatic).toHaveLength(4);

    const inMovements = automatic.filter(m => m.type === 'in');
    const outMovements = automatic.filter(m => m.type === 'out');

    expect(inMovements).toHaveLength(2);
    expect(outMovements).toHaveLength(2);

    const inAmounts = inMovements.map(m => m.amount).sort((a, b) => a - b);
    expect(inAmounts).toEqual([150_000, 300_000]);

    const outAmounts = outMovements.map(m => m.amount).sort((a, b) => a - b);
    expect(outAmounts).toEqual([150_000, 300_000]);

    expect(balance.balance).toBe(0);
  });
});
