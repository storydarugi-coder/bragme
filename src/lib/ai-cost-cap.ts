import { sql } from "drizzle-orm";
import { getDb, schema } from "@/db/client";

// Global daily cap on Anthropic calls. Default is conservative; bump
// AI_DAILY_CAP env var as traffic justifies. Counter resets at UTC
// midnight by virtue of the date_key changing.
const DEFAULT_DAILY_CAP = 1000;

function dbConfigured(): boolean {
  return Boolean(process.env.DATABASE_URL);
}

function todayKey(): string {
  // YYYY-MM-DD in UTC. Stable, sortable, timezone-free.
  return new Date().toISOString().slice(0, 10);
}

function configuredCap(): number {
  const raw = process.env.AI_DAILY_CAP;
  if (!raw) return DEFAULT_DAILY_CAP;
  const n = Number.parseInt(raw, 10);
  return Number.isFinite(n) && n > 0 ? n : DEFAULT_DAILY_CAP;
}

export type CostCapResult =
  | { ok: true; count: number; cap: number }
  | { ok: false; count: number; cap: number };

/**
 * Atomically increments the day's counter and returns whether we're
 * still under the cap. Done as a single UPSERT so two concurrent
 * generations can't both pass the cap check and then both bump.
 *
 * Fail-open on DB errors / missing config: a flaky DB shouldn't take the
 * AI flow down. The per-IP rate limiter still bounds individual abuse;
 * this layer only protects against the global "free tier exhausted at
 * 3 AM" failure mode.
 */
export async function bumpAndCheckDailyCap(): Promise<CostCapResult> {
  const cap = configuredCap();
  if (!dbConfigured()) return { ok: true, count: 0, cap };

  const db = getDb();
  const key = todayKey();
  try {
    const [row] = await db.execute<{ count: number }>(sql`
      INSERT INTO ${schema.dailyAiCalls} (date_key, count)
      VALUES (${key}, 1)
      ON CONFLICT (date_key) DO UPDATE
        SET count = ${schema.dailyAiCalls}.count + 1
      RETURNING count
    `);
    const count = row?.count ?? 0;
    return { ok: count <= cap, count, cap };
  } catch (err) {
    console.warn("[ai-cost-cap] db failed, allowing", err);
    return { ok: true, count: 0, cap };
  }
}
