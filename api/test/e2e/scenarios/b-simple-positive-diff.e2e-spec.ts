/**
 * Scenario B: Single rueda, 15 members, positive cash box difference.
 *
 * loanAmount=300000, contribution=10000, rate=0, roundingUnit=0
 * installment = 300000/15 = 20000
 * Month 1: member[0] pays 20000+10000=30000, members[1-14] pay 10000 each
 * totalCollected = 30000 + 14*10000 = 30000 + 140000 = 170000
 * difference = 300000 - 170000 = +130000  →  auto IN entry (rueda_collection)
 *
 * Expected cash box after month 1 fully paid:
 *   - 1 automatic OUT (disbursement, 300000)
 *   - 1 automatic IN  (collection, 130000)
 */
import { INestApplication } from '@nestjs/common';
import { createTestApp } from '../helpers/app.helper';
import { createGroup, createMembers, createRueda, generateAndPayAll, getCashBox } from '../helpers/api.helper';
import { deleteTestGroup } from '../helpers/cleanup.helper';

describe('Scenario B — single rueda, positive cash box difference', () => {
  let app: INestApplication;
  let groupId: string;

  beforeAll(async () => {
    app = await createTestApp();
    const group = await createGroup(app, 'TEST-B');
    groupId = group.id;
  });

  afterAll(async () => {
    await deleteTestGroup(groupId);
    await app.close();
  });

  it('creates disbursement and collection entry when collected < loaned', async () => {
    const members = await createMembers(app, groupId, 15);
    const rueda = await createRueda(app, groupId, members, {
      loanAmount: 300_000,
      contributionAmount: 10_000,
    });

    await generateAndPayAll(app, groupId, rueda.id, 1, 2024);

    const { movements } = await getCashBox(app, groupId);
    const automatic = movements.filter(m => m.source_type === 'automatic');

    expect(automatic).toHaveLength(2);

    const disbursement = automatic.find(m => m.category === 'rueda_disbursement');
    const collection = automatic.find(m => m.category === 'rueda_collection');

    expect(disbursement?.type).toBe('out');
    expect(disbursement?.amount).toBe(300_000);

    expect(collection?.type).toBe('in');
    expect(collection?.amount).toBe(130_000);
  });
});
