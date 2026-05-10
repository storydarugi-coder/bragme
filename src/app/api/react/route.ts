import { sql } from "drizzle-orm";
import { bumpReaction, getCardById } from "@/lib/cards-store";
import { isReaction, type Reaction } from "@/components/card/Card";
import { clientFingerprint } from "@/lib/client-ip";
import { getDb, schema } from "@/db/client";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// ---------- in-memory fallback (dev only) ----------
//
// On serverless this Map doesn't survive cold starts, so prod must have
// DATABASE_URL set. Kept only so the route still works in mock-only dev
// environments (matches the cards-store.ts pattern).
const memVoted = new Map<string, number>();
const MEM_WINDOW_MS = 24 * 60 * 60 * 1000;

function alreadyReactedMem(key: string) {
  const now = Date.now();
  const ts = memVoted.get(key);
  if (ts && now - ts < MEM_WINDOW_MS) return true;
  memVoted.set(key, now);
  return false;
}

// ---------- Postgres path ----------

function dbConfigured(): boolean {
  return Boolean(process.env.DATABASE_URL);
}

/**
 * Insert into reactions; UNIQUE(card_id, ip_hash, reaction) enforces
 * "one reaction per (card, fingerprint, kind), forever". Returns true
 * when the row already existed (i.e. the user already reacted).
 *
 * Fail-open on DB error: if the insert blows up for non-unique reasons
 * we let the reaction through rather than blocking the user. The
 * cards.cheers_count update is the source of truth for the visible
 * counter; this row is just the dedupe ledger.
 */
async function alreadyReactedPg(
  fingerprint: string,
  cardId: string,
  reaction: Reaction,
): Promise<boolean> {
  const db = getDb();
  try {
    const inserted = await db.execute<{ id: number }>(sql`
      INSERT INTO ${schema.reactions} (card_id, ip_hash, reaction)
      VALUES (${cardId}::uuid, ${fingerprint}, ${reaction})
      ON CONFLICT (card_id, ip_hash, reaction) DO NOTHING
      RETURNING id
    `);
    return inserted.length === 0;
  } catch (err) {
    console.warn("[react] db dedupe failed, allowing", err);
    return false;
  }
}

async function alreadyReacted(
  fingerprint: string,
  cardId: string,
  reaction: Reaction,
): Promise<boolean> {
  if (!dbConfigured()) {
    return alreadyReactedMem(`${fingerprint}::${cardId}::${reaction}`);
  }
  return alreadyReactedPg(fingerprint, cardId, reaction);
}

function fail(code: string, message: string, status: number) {
  return Response.json({ error: { code, message } }, { status });
}

const FIELD_FOR: Record<Reaction, "cheersCount" | "unhingedCount" | "factsCount" | "feltThatCount"> = {
  cheer: "cheersCount",
  unhinged: "unhingedCount",
  facts: "factsCount",
  "felt-that": "feltThatCount",
};

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as
    | { card_id?: unknown; reaction?: unknown }
    | null;
  if (!body || typeof body.card_id !== "string" || !body.card_id) {
    return fail("BAD_REQUEST", "Missing card_id.", 400);
  }
  if (!isReaction(body.reaction)) {
    return fail(
      "BAD_REQUEST",
      "reaction must be one of cheer, unhinged, facts, felt-that.",
      400,
    );
  }
  const cardId = body.card_id;
  const reaction = body.reaction;

  const fingerprint = clientFingerprint(request);
  if (await alreadyReacted(fingerprint, cardId, reaction)) {
    return fail(
      "ALREADY_REACTED",
      "You already gave this reaction. Spread the love elsewhere.",
      409,
    );
  }

  try {
    const card = await getCardById(cardId);
    if (!card) {
      return fail("NOT_FOUND", "Card not found.", 404);
    }

    const newCount = await bumpReaction(cardId, reaction);
    const fieldKey = FIELD_FOR[reaction];
    const currentCount = card[fieldKey];
    return Response.json({
      reaction,
      count: newCount ?? currentCount + 1,
    });
  } catch (err) {
    console.error("[react] db error", err);
    return fail("DB_FAILED", "Couldn't react right now. Try again?", 500);
  }
}
