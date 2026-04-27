/**
 * Scenario D: Two ruedas, both with no cash box difference.
 *
 * Rueda 1 (month 1/2024): loanAmount=225000, contribution=14000 → diff=0
 * Rueda 2 (month 2/2024): loanAmount=225000, contribution=14000 → diff=0
 *
 * Expected cash box after both months paid:
 *   - 2 automatic OUT (disbursements: 225000 each)
 *   - 0 collection/adjustment entries
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

  it('creates only two disbursement entries, no collection entries', async () => {
    const members = await createMembers(app, groupId, 15);

    const rueda1 = await createRueda(app, groupId, members, {
      loanAmount: 225_000, contributionAmount: 14_000, startMonth: 1, startYear: 2024,
    });
    const rueda2 = await createRueda(app, groupId, members, {
      loanAmount: 225_000, contributionAmount: 14_000, startMonth: 2, startYear: 2024,
    });

    await generateAndPayAll(app, groupId, rueda1.id, 1, 2024);
    await generateAndPayAll(app, groupId, rueda2.id, 2, 2024);

    const { movements } = await getCashBox(app, groupId);
    const automatic = movements.filter(m => m.source_type === 'automatic');

    expect(automatic).toHaveLength(2);
    expect(automatic.every(m => m.type === 'out' && m.category === 'rueda_disbursement')).toBe(true);
  });
});
