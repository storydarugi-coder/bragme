import { bumpReaction, getCardById } from "@/lib/cards-store";
import { isReaction, type Reaction } from "@/components/card/Card";
import { clientFingerprint } from "@/lib/client-ip";
import { getRedis } from "@/lib/redis";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const WINDOW_SEC = 24 * 60 * 60;

// In-memory dedupe — only used when Upstash isn't configured (local dev).
// On serverless this Map doesn't survive cold starts, so prod must set
// UPSTASH_REDIS_REST_URL/TOKEN.
const memVoted = new Map<string, number>();

function alreadyReactedMem(key: string) {
  const now = Date.now();
  const ts = memVoted.get(key);
  if (ts && now - ts < WINDOW_SEC * 1000) return true;
  memVoted.set(key, now);
  return false;
}

async function alreadyReacted(
  fingerprint: string,
  cardId: string,
  reaction: Reaction,
): Promise<boolean> {
  const key = `react:${fingerprint}:${cardId}:${reaction}`;
  const redis = getRedis();
  if (!redis) return alreadyReactedMem(key);

  try {
    // SET NX EX: atomic "claim this slot for 24h or report it's taken".
    // Returns "OK" on success, null if the key already existed.
    const claimed = await redis.set(key, "1", { nx: true, ex: WINDOW_SEC });
    return claimed === null;
  } catch (err) {
    console.warn("[react] redis dedupe failed, allowing", err);
    return false;
  }
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
