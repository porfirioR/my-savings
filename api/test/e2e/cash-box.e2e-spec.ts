import { INestApplication } from '@nestjs/common';
import { createTestApp } from './helpers/app.helper';
import { api, createGroup } from './helpers/api.helper';
import { deleteTestGroup } from './helpers/cleanup.helper';

describe('CashBoxController (e2e)', () => {
  let app: INestApplication;
  let groupId: string;

  beforeAll(async () => {
    app = await createTestApp();
    const group = await createGroup(app, 'CASHBOX-CRUD');
    groupId = group.id;
  });

  afterAll(async () => {
    await deleteTestGroup(groupId);
    await app.close();
  });

  describe('GET /api/groups/:groupId/cash-box/balance', () => {
    it('returns zero balance for a new group', async () => {
      const res = await api(app).get(`/api/groups/${groupId}/cash-box/balance`);
      expect(res.status).toBe(200);
      expect(res.body.balance).toBe(0);
      expect(res.body.totalIn).toBe(0);
      expect(res.body.totalOut).toBe(0);
    });
  });

  describe('GET /api/groups/:groupId/cash-box/movements', () => {
    it('returns empty array for a new group', async () => {
      const res = await api(app).get(`/api/groups/${groupId}/cash-box/movements`);
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });
  });

  describe('POST /api/groups/:groupId/cash-box/movements', () => {
    it('creates a manual IN movement and returns 201', async () => {
      const res = await api(app).post(`/api/groups/${groupId}/cash-box/movements`, {
        type: 'in',
        category: 'adjustment',
        amount: 100_000,
        month: 1,
        year: 2025,
        description: 'Ingreso manual test',
      });
      expect(res.status).toBe(201);
      expect(res.body.id).toBeDefined();
      expect(res.body.amount).toBe(100_000);
      expect(res.body.type).toBe('in');
      expect(res.body.sourceType).toBe('manual');
    });

    it('creates a manual OUT movement', async () => {
      const res = await api(app).post(`/api/groups/${groupId}/cash-box/movements`, {
        type: 'out',
        category: 'adjustment',
        amount: 50_000,
        month: 2,
        year: 2025,
      });
      expect(res.status).toBe(201);
      expect(res.body.type).toBe('out');
    });

    it('returns 400 when amount is zero', async () => {
      const res = await api(app).post(`/api/groups/${groupId}/cash-box/movements`, {
        type: 'in',
        category: 'adjustment',
        amount: 0,
        month: 1,
        year: 2025,
      });
      expect(res.status).toBeGreaterThanOrEqual(400);
    });
  });

  describe('PUT /api/groups/:groupId/cash-box/movements/:id', () => {
    it('updates a manual movement', async () => {
      const created = await api(app).post(`/api/groups/${groupId}/cash-box/movements`, {
        type: 'in',
        category: 'adjustment',
        amount: 75_000,
        month: 3,
        year: 2025,
        description: 'Original',
      });
      expect(created.status).toBe(201);

      const res = await api(app).put(
        `/api/groups/${groupId}/cash-box/movements/${created.body.id}`,
        {
          type: 'in',
          category: 'adjustment',
          amount: 80_000,
          month: 3,
          year: 2025,
          description: 'Editado',
        },
      );
      expect(res.status).toBe(200);
      expect(res.body.amount).toBe(80_000);
      expect(res.body.description).toBe('Editado');
    });
  });

  describe('Balance reflects movements', () => {
    it('balance increases after IN movement', async () => {
      const group2 = await createGroup(app, 'CASHBOX-BALANCE');
      await api(app).post(`/api/groups/${group2.id}/cash-box/movements`, {
        type: 'in', category: 'adjustment', amount: 200_000, month: 1, year: 2025,
      });
      await api(app).post(`/api/groups/${group2.id}/cash-box/movements`, {
        type: 'out', category: 'adjustment', amount: 50_000, month: 1, year: 2025,
      });

      const res = await api(app).get(`/api/groups/${group2.id}/cash-box/balance`);
      expect(res.status).toBe(200);
      expect(res.body.balance).toBe(150_000);

      await deleteTestGroup(group2.id);
    });
  });
});
