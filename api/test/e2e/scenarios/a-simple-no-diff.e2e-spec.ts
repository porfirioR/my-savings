/**
 * Scenario A: Single rueda, 15 members, no cash box difference.
 *
 * loanAmount=225000, contribution=14000, rate=0, roundingUnit=0
 * installment = 225000/15 = 15000
 * Month 1: member[0] pays 15000+14000=29000, members[1-14] pay 14000 each
 * totalCollected = 29000 + 14*14000 = 29000 + 196000 = 225000
 * difference = 225000 - 225000 = 0  →  NO automatic collection entry
 *
 * Expected cash box after month 1 fully paid:
 *   - 1 automatic OUT (disbursement, 225000)
 *   - 0 automatic collection/adjustment entries
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

  it('generates payments and creates only the disbursement entry', async () => {
    const members = await createMembers(app, groupId, 15);
    const rueda = await createRueda(app, groupId, members, {
      loanAmount: 225_000,
      contributionAmount: 14_000,
    });

    await generateAndPayAll(app, groupId, rueda.id, 1, 2024);

    const { movements } = await getCashBox(app, groupId);
    const automatic = movements.filter(m => m.source_type === 'automatic');

    expect(automatic).toHaveLength(1);
    expect(automatic[0].type).toBe('out');
    expect(automatic[0].category).toBe('rueda_disbursement');
    expect(automatic[0].amount).toBe(225_000);
  });
});
