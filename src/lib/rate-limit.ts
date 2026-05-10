import { sql } from "drizzle-orm";
import { getDb, schema } from "@/db/client";

// Per-key rate limiter, backed by the `rate_limit` Postgres table so the
// bucket survives serverless cold starts and is shared across regions.
// Same semantics as the original in-memory limiter — one allowed request
// per `windowSec` per key.
//
// Falls back to a per-instance in-memory Map when DATABASE_URL is unset.
// That fallback is only useful for local dev; on serverless it
// effectively disables rate limiting.

const DEFAULT_WINDOW_SEC = 60;

export type RateResult =
  | { ok: true }
  | { ok: false; retryAfterSec: number };

function dbConfigured(): boolean {
  return Boolean(process.env.DATABASE_URL);
}

// ---------- in-memory fallback (dev only) ----------

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

// ---------- Postgres path ----------

/**
 * Atomic upsert: if the row doesn't exist OR its expires_at is already in
 * the past, claim a fresh TTL and report success. If the row exists and
 * is still valid, the WHERE clause on DO UPDATE skips the update and
 * RETURNING yields no rows — that's our "rate limited" signal.
 *
 * Fail-open: if the DB throws (network blip, pool exhaustion), allow the
 * request through rather than 503-ing the form. AI cost caps and the
 * dedupe layer bound abuse, not this limiter alone.
 */
async function checkPg(key: string, windowSec: number): Promise<RateResult> {
  const db = getDb();
  const namespaced = `rl:${key}`;

  try {
    const claimed = await db.execute<{ expires_at: Date }>(sql`
      INSERT INTO ${schema.rateLimit} (key, expires_at)
      VALUES (${namespaced}, NOW() + (${windowSec}::int * INTERVAL '1 second'))
      ON CONFLICT (key) DO UPDATE
        SET expires_at = EXCLUDED.expires_at
        WHERE ${schema.rateLimit}.expires_at < NOW()
      RETURNING expires_at
    `);

    if (claimed.length > 0) return { ok: true };

    // Slot is held — read current expiry to compute retry-after.
    const [row] = await db.execute<{ retry_after: number }>(sql`
      SELECT GREATEST(1, CEIL(EXTRACT(EPOCH FROM (expires_at - NOW()))))::int
        AS retry_after
      FROM ${schema.rateLimit}
      WHERE key = ${namespaced}
    `);
    return {
      ok: false,
      retryAfterSec: row?.retry_after ?? windowSec,
    };
  } catch (err) {
    console.warn("[rate-limit] db failed, allowing request", err);
    return { ok: true };
  }
}

export async function checkRate(
  key: string,
  windowSec: number = DEFAULT_WINDOW_SEC,
): Promise<RateResult> {
  if (!dbConfigured()) return checkMem(key, windowSec * 1000);
  return checkPg(key, windowSec);
}
