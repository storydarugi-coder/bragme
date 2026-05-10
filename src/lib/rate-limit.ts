import { getRedis } from "@/lib/redis";

// Per-key rate limiter. Same semantics as before — one request per
// `windowSec` per key — but Redis-backed when configured so the bucket
// survives serverless cold starts and is shared across regions.
//
// Falls back to a per-instance in-memory Map when Upstash env vars are
// missing. That fallback is only useful for local dev; on serverless it
// effectively disables rate limiting. Production must set
// UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN.

const DEFAULT_WINDOW_SEC = 60;

export type RateResult =
  | { ok: true }
  | { ok: false; retryAfterSec: number };

const memBuckets = new Map<string, number>();
let lastSweep = 0;

function sweepMem(now: number, windowMs: number) {
  if (now - lastSweep < windowMs) return;
  lastSweep = now;
  for (const [k, ts] of memBuckets) {
    if (now - ts > windowMs) memBuckets.delete(k);
  }
}

function checkMem(key: string, windowMs: number): RateResult {
  const now = Date.now();
  sweepMem(now, windowMs);
  const last = memBuckets.get(key);
  if (last && now - last < windowMs) {
    return {
      ok: false,
      retryAfterSec: Math.max(1, Math.ceil((windowMs - (now - last)) / 1000)),
    };
  }
  memBuckets.set(key, now);
  return { ok: true };
}

/**
 * Fail-open: if Redis throws (network blip, quota), we let the request
 * through rather than 503-ing the whole product. The leaky-bucket
 * promise is "best effort" anyway — abuse is bounded by AI cost caps
 * and the dedupe layer, not by this limiter alone.
 */
export async function checkRate(
  key: string,
  windowSec: number = DEFAULT_WINDOW_SEC,
): Promise<RateResult> {
  const redis = getRedis();
  if (!redis) return checkMem(key, windowSec * 1000);

  const redisKey = `rl:${key}`;
  try {
    // INCR + EXPIRE-NX: first hit creates the counter and sets TTL,
    // subsequent hits within the window just bump it. We block on
    // count > 1 — equivalent to "1 request per window" semantics.
    const count = await redis.incr(redisKey);
    if (count === 1) {
      await redis.expire(redisKey, windowSec);
      return { ok: true };
    }
    const ttl = await redis.ttl(redisKey);
    return {
      ok: false,
      retryAfterSec: ttl > 0 ? ttl : windowSec,
    };
  } catch (err) {
    console.warn("[rate-limit] redis failed, allowing request", err);
    return { ok: true };
  }
}
