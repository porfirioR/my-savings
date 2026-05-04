/**
 * Scenario A: Single rueda (type='new'), 15 members, zero difference.
 *
 * For type='new', ALL members pay contribution_only each month.
 * totalCollected = 15 × 15000 = 225000
 * loanAmount = 225000 → net = 0 per month
 *
 * Expected cash box after month 1 fully paid:
 *   - 1 automatic OUT (disbursement, 225000)
 *   - 1 automatic IN  (collection, 225000)
 *   Net balance = 0
 */
import { INestApplication } from '@nestjs/common';
import { createTestApp } from '../helpers/app.helper';
import { createGroup, createMembers, createRueda, generateAndPayAll, getCashBox } from '../helpers/api.helper';
import { deleteTestGroup } from '../helpers/cleanup.helper';

describe('Scenario A — single rueda, no cash box difference', () => {
  let app: INestApplication;
  let groupId: string;

  beforeAll(async () => {
    app = await createTestApp();
    const group = await createGroup(app, 'TEST-A');
    groupId = group.id;
  });

  afterAll(async () => {
    await deleteTestGroup(groupId);
    await app.close();
  });

  it('generates disbursement and matching collection, net balance = 0', async () => {
    const members = await createMembers(app, groupId, 15);
    const rueda = await createRueda(app, groupId, members, {
      loanAmount: 225_000,
      contributionAmount: 15_000,
    });

    await generateAndPayAll(app, groupId, rueda.id, 1, 2024);

    const { movements, balance } = await getCashBox(app, groupId);
    const automatic = movements.filter(m => m.sourceType === 'automatic');

    expect(automatic).toHaveLength(2);

    const disbursement = automatic.find(m => m.category === 'rueda_disbursement');
    const collection = automatic.find(m => m.category === 'rueda_collection');

    expect(disbursement?.type).toBe('out');
    expect(disbursement?.amount).toBe(225_000);

    expect(collection?.type).toBe('in');
    expect(collection?.amount).toBe(225_000);

    expect(balance.balance).toBe(0);
  });
});
