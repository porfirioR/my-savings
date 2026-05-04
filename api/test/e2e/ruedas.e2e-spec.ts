import { INestApplication } from '@nestjs/common';
import { createTestApp } from './helpers/app.helper';
import { api, createGroup, createMembers, createRueda } from './helpers/api.helper';
import { deleteTestGroup } from './helpers/cleanup.helper';

describe('RuedasController (e2e)', () => {
  let app: INestApplication;
  let groupId: string;
  let members: { id: string }[];

  beforeAll(async () => {
    app = await createTestApp();
    const group = await createGroup(app, 'RUEDAS-CRUD');
    groupId = group.id;
    members = await createMembers(app, groupId, 3);
  });

  afterAll(async () => {
    await deleteTestGroup(groupId);
    await app.close();
  });

  describe('POST /api/groups/:groupId/ruedas', () => {
    it('creates a rueda with slots and returns 201', async () => {
      const res = await api(app).post(`/api/groups/${groupId}/ruedas`, {
        type: 'new',
        loanAmount: 300_000,
        interestRate: 0,
        contributionAmount: 20_000,
        roundingUnit: 0,
        startMonth: 1,
        startYear: 2025,
        slotAmountMode: 'constant',
        slots: members.map((m, i) => ({ memberId: m.id, position: i + 1 })),
      });
      expect(res.status).toBe(201);
      expect(res.body.id).toBeDefined();
      expect(res.body.status).toBe('pending');
      expect(res.body.ruedaNumber).toBe(1);
    });

    it('returns 400 when loanAmount is missing', async () => {
      const res = await api(app).post(`/api/groups/${groupId}/ruedas`, {
        type: 'new',
        interestRate: 0,
        contributionAmount: 20_000,
        roundingUnit: 0,
        startMonth: 2,
        startYear: 2025,
        slotAmountMode: 'constant',
        slots: [],
      });
      expect(res.status).toBeGreaterThanOrEqual(400);
    });
  });

  describe('GET /api/groups/:groupId/ruedas', () => {
    it('returns list of ruedas for the group', async () => {
      const res = await api(app).get(`/api/groups/${groupId}/ruedas`);
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('GET /api/groups/:groupId/ruedas/:id', () => {
    it('returns rueda details with slots', async () => {
      const group2 = await createGroup(app, 'RUEDAS-GET');
      const mems = await createMembers(app, group2.id, 2);
      const rueda = await createRueda(app, group2.id, mems, {
        loanAmount: 200_000,
        contributionAmount: 10_000,
      });

      const res = await api(app).get(`/api/groups/${group2.id}/ruedas/${rueda.id}`);
      expect(res.status).toBe(200);
      expect(res.body.id).toBe(rueda.id);
      expect(res.body.slots).toHaveLength(2);

      await deleteTestGroup(group2.id);
    });
  });

  describe('Payments flow', () => {
    it('generates payments for a month', async () => {
      const group3 = await createGroup(app, 'RUEDAS-PAYMENTS');
      const mems = await createMembers(app, group3.id, 2);
      const rueda = await createRueda(app, group3.id, mems, {
        loanAmount: 200_000,
        contributionAmount: 10_000,
        startMonth: 1,
        startYear: 2025,
      });

      const genRes = await api(app).post(
        `/api/groups/${group3.id}/ruedas/${rueda.id}/payments/generate`,
        { month: 1, year: 2025 },
      );
      expect(genRes.status).toBe(201);

      const listRes = await api(app).get(
        `/api/groups/${group3.id}/ruedas/${rueda.id}/payments?month=1&year=2025`,
      );
      expect(listRes.status).toBe(200);
      expect(Array.isArray(listRes.body)).toBe(true);
      expect(listRes.body.length).toBe(2);

      await deleteTestGroup(group3.id);
    });
  });
});
