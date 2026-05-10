import Anthropic from "@anthropic-ai/sdk";
import { translateCard } from "@/lib/claude";
import { generateHandle } from "@/lib/handle";
import { checkRate } from "@/lib/rate-limit";
import { clientFingerprint } from "@/lib/client-ip";
import {
  getCardById,
  getRawStoryById,
  insertCard,
} from "@/lib/cards-store";
import { isLanguageCode, nameForLanguage } from "@/lib/languages";
import { bumpAndCheckDailyCap } from "@/lib/ai-cost-cap";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function fail(code: string, message: string, status: number, extra?: HeadersInit) {
  return Response.json(
    { error: { code, message } },
    { status, headers: extra },
  );
}

export async function POST(request: Request) {
  // 1. Validate body
  const body = (await request.json().catch(() => null)) as Record<
    string,
    unknown
  > | null;
  if (!body) return fail("BAD_REQUEST", "Invalid JSON body.", 400);

  const cardId = typeof body.card_id === "string" ? body.card_id : null;
  if (!cardId) return fail("BAD_REQUEST", "Missing card_id.", 400);

  if (!isLanguageCode(body.target_language)) {
    return fail("BAD_REQUEST", "Unsupported target_language.", 400);
  }
  const targetCode = body.target_language;

  // 2. Rate limit (own bucket)
  const fingerprint = clientFingerprint(request);
  const rate = await checkRate(`translate:${fingerprint}`);
  if (!rate.ok) {
    return fail(
      "RATE_LIMITED",
      "Take a breath — try again in a minute.",
      429,
      { "Retry-After": String(rate.retryAfterSec) },
    );
  }

  // 3. AI key check
  if (!process.env.ANTHROPIC_API_KEY) {
    return fail(
      "AI_NOT_CONFIGURED",
      "Set ANTHROPIC_API_KEY to enable translation.",
      503,
    );
  }

  // 4. Global daily cost cap.
  const cap = await bumpAndCheckDailyCap();
  if (!cap.ok) {
    return fail(
      "AI_DAILY_CAP_REACHED",
      "AI is taking a break for the day. Try again tomorrow?",
      503,
    );
  }

  // 5. Load source card
  const source = await getCardById(cardId);
  if (!source) {
    return fail("NOT_FOUND", "Couldn't find that card.", 404);
  }

  // 5. Translate + persist
  try {
    const translated = await translateCard(
      {
        title: source.title,
        bragPoints: source.bragPoints,
        vibeCaption: source.vibeCaption,
        emoji: source.emoji,
        colorTheme: source.colorTheme,
      },
      nameForLanguage(targetCode),
    );

    const handle = generateHandle();
    // The translated card shares the original's raw_story so refine still
    // has something to work with. Limitation: refining a translated card
    // regenerates in the source language. Acceptable for v1.
    const rawStory = (await getRawStoryById(cardId)) ?? source.title;

    const persisted = await insertCard({
      nickname: handle,
      rawStory,
      title: translated.title,
      bragPoints: translated.bragPoints,
      vibeCaption: translated.vibeCaption,
      emoji: translated.emoji,
      colorTheme: translated.colorTheme,
      parentId: cardId,
      relationType: "translate",
    });

    const card =
      persisted ?? {
        id: crypto.randomUUID(),
        nickname: handle,
        title: translated.title,
        bragPoints: translated.bragPoints,
        vibeCaption: translated.vibeCaption,
        emoji: translated.emoji,
        colorTheme: translated.colorTheme,
        cheersCount: 0,
        unhingedCount: 0,
        factsCount: 0,
        feltThatCount: 0,
      };

    return Response.json({ card });
  } catch (err) {
    if (err instanceof Anthropic.AuthenticationError) {
      console.error("[translate] auth failed", err.message);
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
      console.error("[translate] Anthropic", err.status, err.message);
      if (err.status === 529) {
        return fail(
          "AI_OVERLOADED",
          "AI is overloaded right now. One more try?",
          503,
        );
      }
    } else {
      console.error("[translate] unknown", err);
    }
    return fail(
      "AI_FAILED",
      "Translation hit a snag. Try again?",
      502,
    );
  }
}
