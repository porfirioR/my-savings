/**
 * Scenario D: Two ruedas, both with zero difference.
 *
 * Both ruedas: loanAmount=225000, contribution=15000 → 15×15000=225000, net=0
 *
 * Expected cash box after both months paid:
 *   - 2 automatic OUT (disbursements: 225000 each)
 *   - 2 automatic IN  (collections:   225000 each)
 *   Net balance = 0
 */
import { INestApplication } from '@nestjs/common';
import { createTestApp } from '../helpers/app.helper';
import { createGroup, createMembers, createRueda, generateAndPayAll, getCashBox } from '../helpers/api.helper';
import { deleteTestGroup } from '../helpers/cleanup.helper';

describe('Scenario D — two ruedas, no diff + no diff', () => {
  let app: INestApplication;
  let groupId: string;

  beforeAll(async () => {
    app = await createTestApp();
    const group = await createGroup(app, 'TEST-D');
    groupId = group.id;
  });

  afterAll(async () => {
    await deleteTestGroup(groupId);
    await app.close();
  });

  it('creates two disbursements and two matching collections, net balance = 0', async () => {
    const members = await createMembers(app, groupId, 15);

    const rueda1 = await createRueda(app, groupId, members, {
      loanAmount: 225_000, contributionAmount: 15_000, startMonth: 1, startYear: 2024,
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
    expect(disbursements.every(m => m.type === 'out' && m.amount === 225_000)).toBe(true);

    expect(collections).toHaveLength(2);
    expect(collections.every(m => m.type === 'in' && m.amount === 225_000)).toBe(true);

    expect(balance.balance).toBe(0);
  });
});
