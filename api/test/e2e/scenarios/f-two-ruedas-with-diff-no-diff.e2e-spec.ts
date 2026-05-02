/**
 * Scenario F: Two ruedas — rueda 1 positive diff, rueda 2 no diff.
 *
 * Rueda 1 (month 1/2024): loanAmount=300000, contribution=10000 → diff=+130000
 * Rueda 2 (month 2/2024): loanAmount=225000, contribution=14000 → diff=0
 *
 * Expected cash box:
 *   - OUT disbursement 300000 (rueda 1)
 *   - IN  collection   130000 (rueda 1 diff)
 *   - OUT disbursement 225000 (rueda 2)
 */
import { INestApplication } from '@nestjs/common';
import { createTestApp } from '../helpers/app.helper';
import { createGroup, createMembers, createRueda, generateAndPayAll, getCashBox } from '../helpers/api.helper';
import { deleteTestGroup } from '../helpers/cleanup.helper';

describe('Scenario F — two ruedas, positive diff + no diff', () => {
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

  it('creates collection for rueda 1, only disbursement for rueda 2', async () => {
    const members = await createMembers(app, groupId, 15);

    const rueda1 = await createRueda(app, groupId, members, {
      loanAmount: 300_000, contributionAmount: 10_000, startMonth: 1, startYear: 2024,
    });
    const rueda2 = await createRueda(app, groupId, members, {
      loanAmount: 225_000, contributionAmount: 14_000, startMonth: 2, startYear: 2024,
    });

    await generateAndPayAll(app, groupId, rueda1.id, 1, 2024);
    await generateAndPayAll(app, groupId, rueda2.id, 2, 2024);

    const { movements } = await getCashBox(app, groupId);
    const automatic = movements.filter(m => m.source_type === 'automatic');

    expect(automatic).toHaveLength(3);

    const collections = automatic.filter(m => m.category === 'rueda_collection');
    expect(collections).toHaveLength(1);
    expect(collections[0].type).toBe('in');
    expect(collections[0].amount).toBe(130_000);

    const disbursements = automatic.filter(m => m.category === 'rueda_disbursement');
    expect(disbursements).toHaveLength(2);
    expect(disbursements.every(m => m.type === 'out')).toBe(true);
  });
});
