import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';

// Base64-encoded SWA principal for test user
const principal = Buffer.from(
  JSON.stringify({ identityProvider: 'github', userId: 'test', userDetails: process.env.ALLOWED_USER ?? 'porfirioR', userRoles: ['authenticated'] })
).toString('base64');

export function api(app: INestApplication) {
  return {
    get: (url: string) =>
      request(app.getHttpServer()).get(url).set('x-ms-client-principal', principal),
    post: (url: string, body: object) =>
      request(app.getHttpServer()).post(url).set('x-ms-client-principal', principal).send(body),
    patch: (url: string, body: object) =>
      request(app.getHttpServer()).patch(url).set('x-ms-client-principal', principal).send(body),
  };
}

// ─── Groups ──────────────────────────────────────────────────────────────────
export async function createGroup(app: INestApplication, name: string) {
  const res = await api(app).post('/api/groups', { name, startMonth: 1, startYear: 2024 });
  expect(res.status).toBe(201);
  return res.body as { id: string };
}

// ─── Members ─────────────────────────────────────────────────────────────────
export async function createMembers(app: INestApplication, groupId: string, count = 15) {
  const members: { id: string }[] = [];
  for (let i = 1; i <= count; i++) {
    const res = await api(app).post(`/api/groups/${groupId}/members`, {
      firstName: `M${i}`,
      lastName: 'Test',
      position: i,
      joinedMonth: 1,
      joinedYear: 2024,
    });
    expect(res.status).toBe(201);
    members.push(res.body);
  }
  return members;
}

// ─── Ruedas ──────────────────────────────────────────────────────────────────
export interface RuedaParams {
  loanAmount: number;
  contributionAmount: number;
  startMonth?: number;
  startYear?: number;
  interestRate?: number;
  roundingUnit?: 0 | 500 | 1000;
}

export async function createRueda(
  app: INestApplication,
  groupId: string,
  members: { id: string }[],
  params: RuedaParams,
) {
  const { loanAmount, contributionAmount, startMonth = 1, startYear = 2024, interestRate = 0, roundingUnit = 0 } = params;
  const slots = members.map((m, i) => ({ memberId: m.id, position: i + 1 }));
  const res = await api(app).post(`/api/groups/${groupId}/ruedas`, {
    type: 'new',
    loanAmount,
    interestRate,
    contributionAmount,
    roundingUnit,
    startMonth,
    startYear,
    slotAmountMode: 'constant',
    slots,
  });
  expect(res.status).toBe(201);
  return res.body as { id: string };
}

// ─── Payments ─────────────────────────────────────────────────────────────────
export async function generateAndPayAll(
  app: INestApplication,
  groupId: string,
  ruedaId: string,
  month: number,
  year: number,
) {
  const genRes = await api(app).post(
    `/api/groups/${groupId}/ruedas/${ruedaId}/payments/generate`,
    { month, year },
  );
  expect(genRes.status).toBe(201);

  const listRes = await api(app).get(
    `/api/groups/${groupId}/ruedas/${ruedaId}/payments?month=${month}&year=${year}`,
  );
  expect(listRes.status).toBe(200);

  for (const payment of listRes.body as { id: string }[]) {
    const markRes = await api(app).post(
      `/api/groups/${groupId}/ruedas/${ruedaId}/payments/${payment.id}/mark-paid`,
      {},
    );
    expect(markRes.status).toBe(200);
  }
}

// ─── Cash box ─────────────────────────────────────────────────────────────────
export async function getCashBox(app: INestApplication, groupId: string) {
  const [balanceRes, movementsRes] = await Promise.all([
    api(app).get(`/api/groups/${groupId}/cash-box/balance`),
    api(app).get(`/api/groups/${groupId}/cash-box/movements`),
  ]);
  expect(balanceRes.status).toBe(200);
  expect(movementsRes.status).toBe(200);
  return {
    balance: balanceRes.body as { balance: number },
    movements: movementsRes.body as { type: string; category: string; amount: number; source_type: string }[],
  };
}
