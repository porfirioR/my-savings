import { INestApplication } from '@nestjs/common';
import { createTestApp } from '../helpers/app.helper';
import { api, createGroup, createMembers } from '../helpers/api.helper';
import { deleteTestGroup } from '../helpers/cleanup.helper';

describe('Scenario: nuevo grupo con 10 miembros', () => {
  let app: INestApplication;
  let groupId: string;

  beforeAll(async () => {
    app = await createTestApp();
    const group = await createGroup(app, 'nuevo grupo');
    groupId = group.id;
    await createMembers(app, groupId, 10);
  });

  // afterAll(async () => {
  //   await deleteTestGroup(groupId);
  //   await app.close();
  // });

  it('el grupo se llama "nuevo grupo"', async () => {
    const res = await api(app).get(`/api/groups/${groupId}`);
    expect(res.status).toBe(200);
    expect(res.body.name).toBe('nuevo grupo');
  });

  it('tiene exactamente 10 miembros', async () => {
    const res = await api(app).get(`/api/groups/${groupId}/members`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(10);
  });

  it('todos los miembros están activos', async () => {
    const res = await api(app).get(`/api/groups/${groupId}/members`);
    expect(res.status).toBe(200);
    const allActive = (res.body as { isActive: boolean }[]).every(m => m.isActive);
    expect(allActive).toBe(true);
  });

  it('las posiciones van de 1 a 10 sin duplicados', async () => {
    const res = await api(app).get(`/api/groups/${groupId}/members`);
    expect(res.status).toBe(200);
    const positions = (res.body as { position: number }[]).map(m => m.position).sort((a, b) => a - b);
    expect(positions).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
  });
});
