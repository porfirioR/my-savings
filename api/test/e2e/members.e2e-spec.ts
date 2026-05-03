import { INestApplication } from '@nestjs/common';
import { createTestApp } from './helpers/app.helper';
import { api, createGroup, createMembers } from './helpers/api.helper';
import { deleteTestGroup } from './helpers/cleanup.helper';

describe('MembersController (e2e)', () => {
  let app: INestApplication;
  let groupId: string;

  beforeAll(async () => {
    app = await createTestApp();
    const group = await createGroup(app, 'MEMBERS-CRUD');
    groupId = group.id;
  });

  afterAll(async () => {
    await deleteTestGroup(groupId);
    await app.close();
  });

  describe('POST /api/groups/:groupId/members', () => {
    it('creates a member and returns 201', async () => {
      const res = await api(app).post(`/api/groups/${groupId}/members`, {
        firstName: 'Juan',
        lastName: 'Pérez',
        phone: '0981000001',
        position: 1,
        joinedMonth: 1,
        joinedYear: 2024,
      });
      expect(res.status).toBe(201);
      expect(res.body.id).toBeDefined();
      expect(res.body.firstName).toBe('Juan');
      expect(res.body.isActive).toBe(true);
    });

    it('returns 400 when position is duplicated', async () => {
      await api(app).post(`/api/groups/${groupId}/members`, {
        firstName: 'Ana', lastName: 'Lopez', position: 2, joinedMonth: 1, joinedYear: 2024,
      });
      const res = await api(app).post(`/api/groups/${groupId}/members`, {
        firstName: 'Luis', lastName: 'Gomez', position: 2, joinedMonth: 1, joinedYear: 2024,
      });
      expect(res.status).toBeGreaterThanOrEqual(400);
    });
  });

  describe('GET /api/groups/:groupId/members', () => {
    it('returns all members for the group', async () => {
      const res = await api(app).get(`/api/groups/${groupId}/members`);
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('PUT /api/groups/:groupId/members/:id', () => {
    it('updates member data', async () => {
      const members = await createMembers(app, groupId, 1);
      // createMembers assigns position starting from 1, but group already has members
      // so let's create with a fresh group
      const group2 = await createGroup(app, 'MEMBERS-EDIT');
      const res1 = await api(app).post(`/api/groups/${group2.id}/members`, {
        firstName: 'Original', lastName: 'Test', position: 1, joinedMonth: 1, joinedYear: 2024,
      });
      expect(res1.status).toBe(201);

      const res = await api(app).put(`/api/groups/${group2.id}/members/${res1.body.id}`, {
        firstName: 'Editado',
        phone: '0982999999',
      });
      expect(res.status).toBe(200);
      expect(res.body.firstName).toBe('Editado');
      expect(res.body.phone).toBe('0982999999');

      await deleteTestGroup(group2.id);
    });
  });

  describe('POST /api/groups/:groupId/members/:id/exit', () => {
    it('processes exit and returns settlement', async () => {
      const group3 = await createGroup(app, 'MEMBERS-EXIT');
      const m = await api(app).post(`/api/groups/${group3.id}/members`, {
        firstName: 'Saliente', lastName: 'Test', position: 1, joinedMonth: 1, joinedYear: 2024,
      });
      expect(m.status).toBe(201);

      const res = await api(app).post(`/api/groups/${group3.id}/members/${m.body.id}/exit`, {
        leftMonth: 3,
        leftYear: 2025,
        accumulatedContributions: 50000,
        remainingLoanBalance: 0,
      });
      expect(res.status).toBe(201);
      expect(res.body.memberReceives).toBe(50000);
      expect(res.body.memberPays).toBe(0);

      await deleteTestGroup(group3.id);
    });

    it('returns 400 when member has active parallel loans', async () => {
      const group4 = await createGroup(app, 'MEMBERS-EXIT-LOAN');
      const m = await api(app).post(`/api/groups/${group4.id}/members`, {
        firstName: 'ConPrestamo', lastName: 'Test', position: 1, joinedMonth: 1, joinedYear: 2024,
      });
      await api(app).post(`/api/groups/${group4.id}/parallel-loans`, {
        memberId: m.body.id,
        amount: 500000,
        interestRate: 5,
        totalInstallments: 3,
        startMonth: 1,
        startYear: 2025,
        roundingUnit: 0,
      });

      const res = await api(app).post(`/api/groups/${group4.id}/members/${m.body.id}/exit`, {
        leftMonth: 3,
        leftYear: 2025,
        accumulatedContributions: 0,
        remainingLoanBalance: 0,
      });
      expect(res.status).toBe(400);

      await deleteTestGroup(group4.id);
    });
  });
});
