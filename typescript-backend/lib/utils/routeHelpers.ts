import { NextRequest, NextResponse } from 'next/server';
import { checkPublic, checkInternalAuth, corsHeaders } from './security';
import { allowRequest } from './rateLimiter';
import { allowRequestRedis } from './rateLimiterRedis';

async function allow(key: string) {
  const REDIS = !!process.env.REDIS_URL;
  if (REDIS) {
    return await allowRequestRedis(key);
  } else {
    return allowRequest(key);
  }
}

export async function enforcePublic(req: NextRequest) {
  if (!checkPublic(req)) return NextResponse.json({ ok: false, error: 'missing api key' }, { status: 401 });
  const origin = req.headers.get('origin');
  const headers = corsHeaders(origin);
  const key = origin || req.ip || 'unknown';
  const ok = await allow(key);
  if (!ok) return NextResponse.json({ ok: false, error: 'rate_limited' }, { status: 429 });
  return null;
}

export function enforceInternal(req: NextRequest) {
  if (!checkInternalAuth(req)) return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });
  return null;
}
