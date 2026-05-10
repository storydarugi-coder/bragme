import Anthropic from "@anthropic-ai/sdk";
import { insertCard } from "@/lib/cards-store";
import { generateBragCard } from "@/lib/claude";
import { generateHandle } from "@/lib/handle";
import { checkRate } from "@/lib/rate-limit";
import { clientFingerprint } from "@/lib/client-ip";

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
  const body = await request.json().catch(() => null);
  if (!body || typeof (body as Record<string, unknown>).raw_story !== "string") {
    return fail("BAD_REQUEST", "Missing raw_story.", 400);
  }
  const rawStory = ((body as Record<string, unknown>).raw_story as string).trim();
  if (rawStory.length < MIN_STORY) {
    return fail(
      "BAD_REQUEST",
      `Tell us a bit more — at least ${MIN_STORY} characters.`,
      400,
    );
  }
  if (rawStory.length > MAX_STORY) {
    return fail(
      "BAD_REQUEST",
      `Whoa, that's too much — keep it under ${MAX_STORY} characters.`,
      400,
    );
  }

  // 2. Rate limit (key is hashed IP — never the raw IP)
  const fingerprint = clientFingerprint(request);
  const rate = await checkRate(`generate:${fingerprint}`);
  if (!rate.ok) {
    return fail(
      "RATE_LIMITED",
      "Take a breath — try again in a minute.",
      429,
      { "Retry-After": String(rate.retryAfterSec) },
    );
  }

  // 3. Require Anthropic key — surface a friendly status so the form can
  // optionally fall back to mock generation in dev environments.
  if (!process.env.ANTHROPIC_API_KEY) {
    return fail(
      "AI_NOT_CONFIGURED",
      "Set ANTHROPIC_API_KEY in .env.local to enable AI generation.",
      503,
    );
  }

  // 4. Generate + persist
  try {
    const generated = await generateBragCard(rawStory);
    const handle = generateHandle();

    // If DATABASE_URL is set, INSERT and use the DB-generated row (real uuid,
    // server timestamp). If not, build a session-only card so the form still
    // works in mock-only environments.
    const persisted = await insertCard({
      nickname: handle,
      rawStory,
      title: generated.title,
      bragPoints: generated.bragPoints,
      vibeCaption: generated.vibeCaption,
      emoji: generated.emoji,
      colorTheme: generated.colorTheme,
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

    return Response.json({ card });
  } catch (err) {
    if (err instanceof Anthropic.AuthenticationError) {
      console.error("[generate] auth failed", err.message);
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
      // 529 / overloaded falls through here; surface the status so
      // ops can tell apart auth (401), rate (429), overload (529).
      console.error("[generate] Anthropic", err.status, err.message);
      if (err.status === 529) {
        return fail(
          "AI_OVERLOADED",
          "AI is overloaded right now. One more try?",
          503,
        );
      }
    } else {
      console.error("[generate] unknown", err);
    }
    return fail("AI_FAILED", "Hmm, our AI is shy right now. Try again?", 502);
  }
}
