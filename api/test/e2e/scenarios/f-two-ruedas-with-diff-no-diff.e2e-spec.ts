/**
 * Scenario F: Two ruedas — rueda 1 shortfall, rueda 2 zero diff.
 *
 * Rueda 1: loanAmount=300000, contribution=10000 → collected=150000, net=-150000
 * Rueda 2: loanAmount=225000, contribution=15000 → collected=225000, net=0
 *
 * Expected cash box:
 *   - OUT disbursement 300000 + IN collection 150000  (rueda 1, net -150000)
 *   - OUT disbursement 225000 + IN collection 225000  (rueda 2, net 0)
 *   Balance = -150000
 */
import { INestApplication } from '@nestjs/common';
import { createTestApp } from '../helpers/app.helper';
import { createGroup, createMembers, createRueda, generateAndPayAll, getCashBox } from '../helpers/api.helper';
import { deleteTestGroup } from '../helpers/cleanup.helper';

describe('Scenario F — two ruedas, shortfall + no diff', () => {
  let app: INestApplication;
  let groupId: string;

  beforeAll(async () => {
    app = await createTestApp();
    const group = await createGroup(app, 'TEST-F');
    groupId = group.id;
  });

  afterAll(async () => {
    await deleteTestGroup(groupId);
    await app.close();
  });

  it('records collections for both ruedas, balance = -150000', async () => {
    const members = await createMembers(app, groupId, 15);

    const rueda1 = await createRueda(app, groupId, members, {
      loanAmount: 300_000, contributionAmount: 10_000, startMonth: 1, startYear: 2024,
    });
    const rueda2 = await createRueda(app, groupId, members, {
      loanAmount: 225_000, contributionAmount: 15_000, startMonth: 2, startYear: 2024,
    });

    await generateAndPayAll(app, groupId, rueda1.id, 1, 2024);
    await generateAndPayAll(app, groupId, rueda2.id, 2, 2024);

    const { movements, balance } = await getCashBox(app, groupId);
    const automatic = movements.filter(m => m.sourceType === 'automatic');

    expect(automatic).toHaveLength(4);

    const disbursements = automatic.filter(m => m.category === 'rueda_disbursement');
    const collections = automatic.filter(m => m.category === 'rueda_collection');

    expect(disbursements).toHaveLength(2);
    expect(disbursements.every(m => m.type === 'out')).toBe(true);

    expect(collections).toHaveLength(2);
    expect(collections.every(m => m.type === 'in')).toBe(true);

    const collectionAmounts = collections.map(m => m.amount).sort((a, b) => a - b);
    expect(collectionAmounts).toEqual([150_000, 225_000]);

    expect(balance.balance).toBe(-150_000);
  });
});
