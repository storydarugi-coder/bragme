import { bumpReaction, getCardById } from "@/lib/cards-store";
import { isReaction, type Reaction } from "@/components/card/Card";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// Per (IP, card, reaction) lockout, in-memory + per-region. Same trade-off
// as the original cheer endpoint — swap for Vercel KV / Upstash for
// production durability.
const VOTED = new Map<string, number>();
const WINDOW_MS = 24 * 60 * 60 * 1000;

function ipFor(req: Request): string {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) {
    const first = xff.split(",")[0]?.trim();
    if (first) return first;
  }
  return req.headers.get("x-real-ip")?.trim() ?? "unknown";
}

function alreadyReacted(ip: string, cardId: string, reaction: Reaction) {
  const key = `${ip}::${cardId}::${reaction}`;
  const ts = VOTED.get(key);
  if (ts && Date.now() - ts < WINDOW_MS) return true;
  VOTED.set(key, Date.now());
  return false;
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

  const ip = ipFor(request);
  if (alreadyReacted(ip, cardId, reaction)) {
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
