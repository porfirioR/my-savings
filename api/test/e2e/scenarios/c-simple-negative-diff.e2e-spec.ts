/**
 * Scenario C: Single rueda, 15 members, negative cash box difference.
 *
 * loanAmount=150000, contribution=20000, rate=0, roundingUnit=0
 * installment = 150000/15 = 10000
 * Month 1: member[0] pays 10000+20000=30000, members[1-14] pay 20000 each
 * totalCollected = 30000 + 14*20000 = 30000 + 280000 = 310000
 * difference = 150000 - 310000 = -160000  →  auto OUT entry (rueda_disbursement)
 *
 * Expected cash box after month 1 fully paid:
 *   - 1 automatic OUT (disbursement, 150000)
 *   - 1 automatic OUT (adjustment, 160000)
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

  it('creates disbursement and adjustment OUT entry when collected > loaned', async () => {
    const members = await createMembers(app, groupId, 15);
    const rueda = await createRueda(app, groupId, members, {
      loanAmount: 150_000,
      contributionAmount: 20_000,
    });

    await generateAndPayAll(app, groupId, rueda.id, 1, 2024);

    const { movements } = await getCashBox(app, groupId);
    const automatic = movements.filter(m => m.source_type === 'automatic');

    expect(automatic).toHaveLength(2);

    const disbursements = automatic.filter(m => m.category === 'rueda_disbursement');
    expect(disbursements).toHaveLength(2);
    expect(disbursements.every(m => m.type === 'out')).toBe(true);

    const amounts = disbursements.map(m => m.amount).sort((a, b) => a - b);
    expect(amounts).toEqual([150_000, 160_000]);
  });
});
