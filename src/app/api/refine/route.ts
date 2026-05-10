import Anthropic from "@anthropic-ai/sdk";
import { generateBragCard, isVibeModifier } from "@/lib/claude";
import { generateHandle } from "@/lib/handle";
import { checkRate } from "@/lib/rate-limit";
import { clientFingerprint } from "@/lib/client-ip";
import { getRawStoryById, insertCard } from "@/lib/cards-store";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const MIN_STORY = 30;
const MAX_STORY = 2000;

function fail(code: string, message: string, status: number, extra?: HeadersInit) {
  return Response.json(
    { error: { code, message } },
    { status, headers: extra },
  );
}

export async function POST(request: Request) {
  // 1. Parse + validate body
  const body = (await request.json().catch(() => null)) as Record<
    string,
    unknown
  > | null;
  if (!body) return fail("BAD_REQUEST", "Invalid JSON body.", 400);

  const cardId = typeof body.card_id === "string" ? body.card_id : null;
  if (!cardId) return fail("BAD_REQUEST", "Missing card_id.", 400);

  if (!isVibeModifier(body.vibe_modifier)) {
    return fail(
      "BAD_REQUEST",
      "vibe_modifier must be one of: soft, chaotic, confident, cryptic.",
      400,
    );
  }
  const modifier = body.vibe_modifier;

  // 2. Resolve raw_story — prefer client-supplied (current session card),
  // fall back to DB lookup (cards loaded from feed without local cache).
  let rawStory: string | null = null;
  if (
    typeof body.raw_story === "string" &&
    body.raw_story.trim().length >= MIN_STORY &&
    body.raw_story.trim().length <= MAX_STORY
  ) {
    rawStory = body.raw_story.trim();
  } else {
    rawStory = await getRawStoryById(cardId);
  }
  if (!rawStory) {
    return fail(
      "NOT_FOUND",
      "Couldn't find the original story for this card.",
      404,
    );
  }

  // 3. Rate limit (refine shares the same per-IP bucket as /api/generate
  // would in production, but we use a separate key so users can do one
  // generate + one refine per minute rather than one of either).
  const fingerprint = clientFingerprint(request);
  const rate = await checkRate(`refine:${fingerprint}`);
  if (!rate.ok) {
    return fail(
      "RATE_LIMITED",
      "Take a breath — try again in a minute.",
      429,
      { "Retry-After": String(rate.retryAfterSec) },
    );
  }

  // 4. Anthropic key required
  if (!process.env.ANTHROPIC_API_KEY) {
    return fail(
      "AI_NOT_CONFIGURED",
      "Set ANTHROPIC_API_KEY to enable refinement.",
      503,
    );
  }

  // 5. Generate with the chosen modifier, persist a new card, redirect.
  try {
    const generated = await generateBragCard(rawStory, modifier);
    const handle = generateHandle();
    const persisted = await insertCard({
      nickname: handle,
      rawStory,
      title: generated.title,
      bragPoints: generated.bragPoints,
      vibeCaption: generated.vibeCaption,
      emoji: generated.emoji,
      colorTheme: generated.colorTheme,
      parentId: cardId,
      relationType: "refine",
    });

    const card =
      persisted ?? {
        id: crypto.randomUUID(),
        nickname: handle,
        title: generated.title,
        bragPoints: generated.bragPoints,
        vibeCaption: generated.vibeCaption,
        emoji: generated.emoji,
        colorTheme: generated.colorTheme,
        cheersCount: 0,
        unhingedCount: 0,
        factsCount: 0,
        feltThatCount: 0,
      };

    return Response.json({ card, rawStory });
  } catch (err) {
    if (err instanceof Anthropic.AuthenticationError) {
      console.error("[refine] auth failed", err.message);
      return fail("AI_AUTH_FAILED", "AI auth failed — check the API key.", 503);
    }
    if (err instanceof Anthropic.RateLimitError) {
      return fail(
        "AI_RATE_LIMITED",
        "Our AI is overwhelmed. Try again soon?",
        429,
      );
    }
    if (err instanceof Anthropic.APIError) {
      console.error("[refine] Anthropic", err.status, err.message);
      if (err.status === 529) {
        return fail(
          "AI_OVERLOADED",
          "AI is overloaded right now. One more try?",
          503,
        );
      }
    } else {
      console.error("[refine] unknown", err);
    }
    return fail("AI_FAILED", "Hmm, our AI is shy right now. Try again?", 502);
  }
}
