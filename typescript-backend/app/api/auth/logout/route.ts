import { NextResponse } from 'next/server';
import IORedis from 'ioredis';
const REDIS_URL = process.env.REDIS_URL || '';
let redis = null;
if (REDIS_URL) { redis = new IORedis(REDIS_URL); }

export async function POST(request: Request) {
  const payload = await request.json();
  const token = payload.refresh;
  if (!redis) return NextResponse.json({ ok: true });
  await (redis as IORedis.Redis).del(`refresh:${token}`);
  return NextResponse.json({ ok: true });
}
