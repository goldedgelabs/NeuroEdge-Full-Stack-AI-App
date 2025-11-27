import jwt from 'jsonwebtoken';
import IORedis from 'ioredis';
const SECRET = process.env.INTERNAL_JWT_SECRET || 'neuroedge-secret';
const REDIS_URL = process.env.REDIS_URL || '';
let redis = null;
if (REDIS_URL) { redis = new IORedis(REDIS_URL); }

export function sign(payload: any, opts = { expiresIn: '15m' }) {
  return jwt.sign(payload, SECRET, opts);
}

export function verify(token: string) {
  try {
    return jwt.verify(token, SECRET);
  } catch (e) {
    return null;
  }
}

export async function storeRefreshToken(token: string, user: any, ttl = 60*60*24*7) {
  if (!redis) return;
  await (redis as IORedis.Redis).set(`refresh:${token}`, JSON.stringify(user), 'EX', ttl);
}

export async function consumeRefreshToken(token: string) {
  if (!redis) return null;
  const v = await (redis as IORedis.Redis).get(`refresh:${token}`);
  if (!v) return null;
  await (redis as IORedis.Redis).del(`refresh:${token}`);
  return JSON.parse(v);
}
