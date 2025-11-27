type Bucket = { tokens: number; last: number; capacity: number; refillRate: number };

const buckets: Map<string, Bucket> = new Map();

export function allowRequest(key: string, capacity = 60, refillRate = 1): boolean {
  const now = Date.now() / 1000;
  let b = buckets.get(key);
  if (!b) {
    b = { tokens: capacity, last: now, capacity, refillRate };
    buckets.set(key, b);
  }
  const elapsed = Math.max(0, now - b.last);
  b.tokens = Math.min(b.capacity, b.tokens + elapsed * b.refillRate);
  b.last = now;
  if (b.tokens >= 1) {
    b.tokens -= 1;
    return true;
  }
  return false;
}
