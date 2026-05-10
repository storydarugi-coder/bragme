import { Redis } from "@upstash/redis";

// Lazily-initialized Upstash Redis client. Returns null when env vars are
// missing so callers can fall back to the in-memory path (preserving the
// "DB-less dev still works" pattern used elsewhere in this codebase).
//
// Required env (production / preview):
//   UPSTASH_REDIS_REST_URL
//   UPSTASH_REDIS_REST_TOKEN
// Both come from the Upstash console → your DB → REST API panel.

let cached: Redis | null | undefined;

export function getRedis(): Redis | null {
  if (cached !== undefined) return cached;
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) {
    cached = null;
    return null;
  }
  cached = new Redis({ url, token });
  return cached;
}

export function redisConfigured(): boolean {
  return Boolean(
    process.env.UPSTASH_REDIS_REST_URL &&
      process.env.UPSTASH_REDIS_REST_TOKEN,
  );
}
