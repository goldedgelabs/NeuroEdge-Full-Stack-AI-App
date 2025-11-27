import IORedis from 'ioredis';

const REDIS_URL = process.env.REDIS_URL || '';
let redis: IORedis.Redis | null = null;
if (REDIS_URL) {
  redis = new IORedis(REDIS_URL);
}

export async function allowRequestRedis(key: string, capacity = 60, refillRate = 1): Promise<boolean> {
  if (!redis) return true; // fallback allow if no redis configured
  const now = Math.floor(Date.now() / 1000);
  const lua = `
  local key = KEYS[1]
  local capacity = tonumber(ARGV[1])
  local refill = tonumber(ARGV[2])
  local now = tonumber(ARGV[3])
  local item = redis.call("HMGET", key, "tokens", "last")
  local tokens = tonumber(item[1]) or capacity
  local last = tonumber(item[2]) or now
  local elapsed = math.max(0, now - last)
  tokens = math.min(capacity, tokens + elapsed * refill)
  if tokens < 1 then
    redis.call("HMSET", key, "tokens", tokens, "last", now)
    return 0
  else
    tokens = tokens - 1
    redis.call("HMSET", key, "tokens", tokens, "last", now)
    redis.call("EXPIRE", key, 3600)
    return 1
  end
  `;
  try {
    const res = await (redis as IORedis.Redis).eval(lua, 1, key, capacity.toString(), refillRate.toString(), now.toString());
    return res === 1;
  } catch (e) {
    console.error('redis rate limiter error', e);
    return true;
  }
}
