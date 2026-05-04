import { INestApplication } from '@nestjs/common';
import { createTestApp } from './helpers/app.helper';
import { api, createGroup } from './helpers/api.helper';
import { deleteTestGroup } from './helpers/cleanup.helper';

describe('ParallelLoansController (e2e)', () => {
  let app: INestApplication;
  let groupId: string;
  let memberId: string;

  beforeAll(async () => {
    app = await createTestApp();
    const group = await createGroup(app, 'LOANS-CRUD');
    groupId = group.id;

    const m = await api(app).post(`/api/groups/${groupId}/members`, {
      firstName: 'Prestatario',
      lastName: 'Test',
      position: 1,
      joinedMonth: 1,
      joinedYear: 2024,
    });
    memberId = m.body.id;
  });

  afterAll(async () => {
    await deleteTestGroup(groupId);
    await app.close();
  });

  describe('POST /api/groups/:groupId/parallel-loans', () => {
    it('creates a parallel loan and returns 201', async () => {
      const res = await api(app).post(`/api/groups/${groupId}/parallel-loans`, {
        memberId,
        amount: 500_000,
        interestRate: 5,
        totalInstallments: 5,
        startMonth: 1,
        startYear: 2025,
        roundingUnit: 0,
      });
      expect(res.status).toBe(201);
      expect(res.body.id).toBeDefined();
      expect(res.body.amount).toBe(500_000);
      expect(res.body.status).toBe('active');
      expect(res.body.payments).toHaveLength(5);
    });

    it('returns 400 when member already has an active loan', async () => {
      const res = await api(app).post(`/api/groups/${groupId}/parallel-loans`, {
        memberId,
        amount: 300_000,
        interestRate: 3,
        totalInstallments: 3,
        startMonth: 2,
        startYear: 2025,
        roundingUnit: 0,
      });
      expect(res.status).toBeGreaterThanOrEqual(400);
    });
  });

  describe('GET /api/groups/:groupId/parallel-loans', () => {
    it('returns loans for the group', async () => {
      const res = await api(app).get(`/api/groups/${groupId}/parallel-loans`);
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('Mark payment on parallel loan', () => {
    it('marks a payment as paid', async () => {
      // Create a fresh member + loan for this test
      const group2 = await createGroup(app, 'LOANS-MARK');
      const m2 = await api(app).post(`/api/groups/${group2.id}/members`, {
        firstName: 'Pagador', lastName: 'Test', position: 1, joinedMonth: 1, joinedYear: 2024,
      });
      const loan = await api(app).post(`/api/groups/${group2.id}/parallel-loans`, {
        memberId: m2.body.id,
        amount: 300_000,
        interestRate: 0,
        totalInstallments: 3,
        startMonth: 1,
        startYear: 2025,
        roundingUnit: 0,
      });
      expect(loan.status).toBe(201);

      const firstPayment = loan.body.payments[0];
      const markRes = await api(app).post(
        `/api/groups/${group2.id}/parallel-loans/${loan.body.id}/payments/${firstPayment.id}/mark-paid`,
        { isPaid: true },
      );
      expect(markRes.status).toBe(201);
      expect(markRes.body.status).toBe('paid');

      await deleteTestGroup(group2.id);
    });
  });
});
