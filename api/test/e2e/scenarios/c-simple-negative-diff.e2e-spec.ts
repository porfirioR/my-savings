/**
 * Scenario C: Single rueda (type='new'), 15 members, negative cash box difference.
 *
 * For type='new', ALL members pay contribution_only each month.
 * totalCollected = 15 × 20000 = 300000
 * difference = loanAmount - totalCollected = 150000 - 300000 = -150000  →  auto OUT (rueda_disbursement)
 *
 * Expected cash box after month 1 fully paid:
 *   - 1 automatic OUT (disbursement, 150000)   ← the loan itself
 *   - 1 automatic OUT (disbursement, 150000)   ← the negative difference (extra collected)
 */
import { INestApplication } from '@nestjs/common';
import { createTestApp } from '../helpers/app.helper';
import { createGroup, createMembers, createRueda, generateAndPayAll, getCashBox } from '../helpers/api.helper';
import { deleteTestGroup } from '../helpers/cleanup.helper';

describe('Scenario C — single rueda, negative cash box difference', () => {
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

  it('creates disbursement and extra OUT entry when totalCollected > loanAmount', async () => {
    const members = await createMembers(app, groupId, 15);
    const rueda = await createRueda(app, groupId, members, {
      loanAmount: 150_000,
      contributionAmount: 20_000,
    });

    await generateAndPayAll(app, groupId, rueda.id, 1, 2024);

    const { movements } = await getCashBox(app, groupId);
    const automatic = movements.filter(m => m.sourceType === 'automatic');

    expect(automatic).toHaveLength(2);

    const disbursements = automatic.filter(m => m.category === 'rueda_disbursement');
    expect(disbursements).toHaveLength(2);
    expect(disbursements.every(m => m.type === 'out')).toBe(true);

    const amounts = disbursements.map(m => m.amount).sort((a, b) => a - b);
    expect(amounts).toEqual([150_000, 150_000]);
  });
});
