/**
 * Scenario C: Single rueda (type='new'), 15 members, surplus (collected > loan).
 *
 * totalCollected = 15 × 20000 = 300000
 * loanAmount = 150000
 * surplus = 300000 - 150000 = +150000 → net balance grows
 *
 * Expected cash box after month 1 fully paid:
 *   - 1 automatic OUT (disbursement, 150000)
 *   - 1 automatic IN  (collection,   300000)
 *   Net balance = +150000
 */
import { INestApplication } from '@nestjs/common';
import { createTestApp } from '../helpers/app.helper';
import { createGroup, createMembers, createRueda, generateAndPayAll, getCashBox } from '../helpers/api.helper';
import { deleteTestGroup } from '../helpers/cleanup.helper';

describe('Scenario C — single rueda, surplus goes to cash box', () => {
  let app: INestApplication;
  let groupId: string;

  beforeAll(async () => {
    app = await createTestApp();
    const group = await createGroup(app, 'TEST-C');
    groupId = group.id;
  });

  afterAll(async () => {
    await deleteTestGroup(groupId);
    await app.close();
  });

  it('creates disbursement and collection, balance grows by surplus', async () => {
    const members = await createMembers(app, groupId, 15);
    const rueda = await createRueda(app, groupId, members, {
      loanAmount: 150_000,
      contributionAmount: 20_000,
    });

    await generateAndPayAll(app, groupId, rueda.id, 1, 2024);

    const { movements, balance } = await getCashBox(app, groupId);
    const automatic = movements.filter(m => m.sourceType === 'automatic');

    expect(automatic).toHaveLength(2);

    const disbursement = automatic.find(m => m.category === 'rueda_disbursement');
    const collection = automatic.find(m => m.category === 'rueda_collection');

    expect(disbursement?.type).toBe('out');
    expect(disbursement?.amount).toBe(150_000);

    expect(collection?.type).toBe('in');
    expect(collection?.amount).toBe(300_000);

    expect(balance.balance).toBe(150_000);
  });
});
