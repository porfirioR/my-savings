import { INestApplication } from '@nestjs/common';
import { createTestApp } from './helpers/app.helper';
import { api, createGroup, createMembers, createRueda } from './helpers/api.helper';
import { deleteTestGroup } from './helpers/cleanup.helper';

describe('GroupsController (e2e)', () => {
  let app: INestApplication;
  const createdIds: string[] = [];

  beforeAll(async () => {
    app = await createTestApp();
  });

  afterAll(async () => {
    for (const id of createdIds) await deleteTestGroup(id).catch(() => null);
    await app.close();
  });

  describe('POST /api/groups', () => {
    it('creates a group and returns 201', async () => {
      const res = await api(app).post('/api/groups', {
        name: 'Grupo Test',
        startMonth: 3,
        startYear: 2025,
      });
      expect(res.status).toBe(201);
      expect(res.body.id).toBeDefined();
      expect(res.body.name).toBe('Grupo Test');
      expect(res.body.startMonth).toBe(3);
      expect(res.body.startYear).toBe(2025);
      expect(res.body.totalRuedas).toBe(0);
      createdIds.push(res.body.id);
    });

    it('returns 400 when name is missing', async () => {
      const res = await api(app).post('/api/groups', { startMonth: 1, startYear: 2024 });
      expect(res.status).toBe(400);
    });
  });

  describe('GET /api/groups', () => {
    it('returns array of groups', async () => {
      const group = await createGroup(app, 'CRUD-LIST');
      createdIds.push(group.id);

      const res = await api(app).get('/api/groups');
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.some((g: any) => g.id === group.id)).toBe(true);
    });
  });

  describe('GET /api/groups/:id', () => {
    it('returns group by id', async () => {
      const group = await createGroup(app, 'CRUD-GET');
      createdIds.push(group.id);

      const res = await api(app).get(`/api/groups/${group.id}`);
      expect(res.status).toBe(200);
      expect(res.body.id).toBe(group.id);
      expect(res.body.name).toBe('CRUD-GET');
    });
  });

  describe('PUT /api/groups/:id', () => {
    it('updates group name', async () => {
      const group = await createGroup(app, 'ANTES');
      createdIds.push(group.id);

      const res = await api(app).put(`/api/groups/${group.id}`, { name: 'DESPUES' });
      expect(res.status).toBe(200);
      expect(res.body.name).toBe('DESPUES');
    });
  });

  describe('DELETE /api/groups/:id', () => {
    it('deletes group and returns 204', async () => {
      const group = await createGroup(app, 'PARA-BORRAR');

      const res = await api(app).delete(`/api/groups/${group.id}`);
      expect(res.status).toBe(204);
    });
  });

  describe('totalRuedas reflects real rueda count', () => {
    it('shows 0 on new group and 1 after creating a rueda', async () => {
      const group = await createGroup(app, 'TOTAL-RUEDAS');
      createdIds.push(group.id);

      const beforeRes = await api(app).get(`/api/groups/${group.id}`);
      expect(beforeRes.body.totalRuedas).toBe(0);

      const members = await createMembers(app, group.id, 2);
      await createRueda(app, group.id, members, { loanAmount: 100_000, contributionAmount: 10_000 });

      const afterRes = await api(app).get(`/api/groups/${group.id}`);
      expect(afterRes.body.totalRuedas).toBe(1);

      const listRes = await api(app).get('/api/groups');
      const found = listRes.body.find((g: any) => g.id === group.id);
      expect(found.totalRuedas).toBe(1);
    });
  });
});
