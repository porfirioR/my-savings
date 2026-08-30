import { Controller, Get, Query, Req } from '@nestjs/common';
import { Request } from 'express';
import { createClient } from '@supabase/supabase-js';

/**
 * TEMPORAL - diagnostico de auth en produccion. Volcado completo en una sola
 * llamada: headers recibidos, tokens candidatos decodificados (sin verificar),
 * env vars visibles, runtime, alcance del JWKS y resultado de getClaims/getUser
 * contra el token real. Borrar este controller cuando el login funcione.
 *
 * No inyecta nada del arbol de modulos (crea su propio cliente) para no depender
 * del scope de DI de HostModule.
 *
 * Uso:
 *   GET /api/__authdbg           -> usa el token que llegue en los headers
 *   GET /api/__authdbg?token=... -> fuerza a probar ese JWT (pegar el real del navegador)
 */
@Controller('__authdbg')
export class AuthDebugController {
  private decode(jwt?: string): any {
    if (!jwt || typeof jwt !== 'string') return { present: false };
    const parts = jwt.split('.');
    const fromB64 = (s: string): any => {
      try {
        const pad = s.length % 4 === 0 ? '' : '='.repeat(4 - (s.length % 4));
        return JSON.parse(
          Buffer.from(s.replace(/-/g, '+').replace(/_/g, '/') + pad, 'base64').toString('utf8'),
        );
      } catch {
        return null;
      }
    };
    return {
      present: true,
      length: jwt.length,
      preview: `${jwt.slice(0, 24)}...${jwt.slice(-8)}`,
      parts: parts.length,
      header: fromB64(parts[0] ?? ''),
      payload: fromB64(parts[1] ?? ''),
    };
  }

  @Get()
  async dump(@Req() req: Request, @Query('token') qToken?: string): Promise<any> {
    const h: Record<string, any> = { ...(req.headers as any) };

    const url = process.env.SUPABASE_URL ?? '';
    const rawKey = process.env.SUPABASE_KEY ?? '';
    const keyKind = rawKey.startsWith('sb_secret_')
      ? 'sb_secret'
      : rawKey.startsWith('sb_publishable_')
        ? 'sb_publishable'
        : rawKey.startsWith('eyJ')
          ? 'jwt'
          : `other(${rawKey.slice(0, 6)})`;

    const bearer =
      typeof h['authorization'] === 'string' && h['authorization'].startsWith('Bearer ')
        ? h['authorization'].slice(7)
        : undefined;
    const xSb = typeof h['x-sb-token'] === 'string' ? h['x-sb-token'] : undefined;

    const chosen = qToken || xSb || bearer;
    const chosenSource = qToken ? 'query' : xSb ? 'x-sb-token' : bearer ? 'authorization' : 'none';

    const out: any = {
      env: {
        NODE_ENV: process.env.NODE_ENV ?? null,
        SUPABASE_URL: url || null,
        SUPABASE_KEY_kind: keyKind,
        SUPABASE_KEY_len: rawKey.length,
        SUPABASE_KEY_first10: rawKey.slice(0, 10),
        SUPABASE_KEY_last4: rawKey.slice(-4),
        ALLOWED_EMAIL: process.env.ALLOWED_EMAIL ?? null,
        SPA_URL: process.env.SPA_URL ?? null,
        PORT: process.env.PORT ?? null,
      },
      runtime: {
        node: process.version,
        webCryptoSubtle: typeof (globalThis as any).crypto?.subtle,
        fetch: typeof (globalThis as any).fetch,
      },
      headerNames: Object.keys(h),
      candidateTokens: {
        chosenSource,
        query: this.decode(qToken),
        'x-sb-token': this.decode(xSb),
        authorization_bearer: this.decode(bearer),
      },
      jwks: null as any,
      getClaims: null as any,
      getUser: null as any,
    };

    // JWKS reachability from inside the Function
    try {
      const jwksUrl = `${url}/auth/v1/.well-known/jwks.json`;
      const resp = await fetch(jwksUrl, { headers: { apikey: rawKey } });
      let body: any = null;
      try {
        body = await resp.json();
      } catch {
        body = '<non-json>';
      }
      out.jwks = {
        url: jwksUrl,
        status: resp.status,
        keys: body?.keys?.map((k: any) => ({ kid: k.kid, alg: k.alg, kty: k.kty })) ?? body,
      };
    } catch (e: any) {
      out.jwks = { threw: `${e?.name}: ${e?.message}` };
    }

    if (chosen && url && rawKey) {
      const client = createClient(url, rawKey, { auth: { persistSession: false } });
      try {
        const r: any = await client.auth.getClaims(chosen);
        out.getClaims = { error: r?.error?.message ?? null, claims: r?.data?.claims ?? null };
      } catch (e: any) {
        out.getClaims = { threw: `${e?.name}: ${e?.message}` };
      }
      try {
        const r = await client.auth.getUser(chosen);
        out.getUser = {
          error: r.error?.message ?? null,
          email: r.data?.user?.email ?? null,
          id: r.data?.user?.id ?? null,
        };
      } catch (e: any) {
        out.getUser = { threw: `${e?.name}: ${e?.message}` };
      }
    }

    return out;
  }
}
