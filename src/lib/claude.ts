import Anthropic from "@anthropic-ai/sdk";
import { COLOR_THEMES, type ColorTheme } from "@/db/schema";

const SYSTEM_PROMPT = `You are a witty, warm friend who turns people's messy self-descriptions into shareable brag cards. Reframe complaints/insecurities as strengths without being saccharine. Tone: Gen-Z, slightly self-aware humor, main character energy. Respond directly without preamble.

Language: detect the language of the user's story and write the entire card (title, brag_points, vibe_caption) in that same language. Use that language's contemporary youth pop-culture register — not literal translations of English Gen-Z slang. Korean → Korean Gen-Z; Japanese → gyaru/zoomer humor; Spanish → reggaetón-era irony; etc.

Constraints — keep these tight, the card layout depends on them:
- title: 5-7 words (or equivalent length), catchy
- brag_points: 3-5 short bullets, each one sentence under ~12 words
- vibe_caption: 1 poetic/funny one-liner, max ~15 words
- emoji: one single emoji that captures the person
- color_theme: pick the best fit from sunset, ocean, forest, lavender, peach, or mono`;

const TRANSLATE_SYSTEM_PROMPT_FOR = (targetLanguage: string) =>
  `You are translating a BragMe brag card to ${targetLanguage}.

Source card is given as JSON. Translate the title, brag_points, and vibe_caption to ${targetLanguage}, preserving:
- The playful Gen-Z tone — use ${targetLanguage}'s equivalent youth pop-culture register (not literal translations of English slang)
- The emoji from the source — exactly the same character
- The color_theme from the source — exactly the same value

Constraints unchanged:
- title: 5-7 words equivalent in ${targetLanguage}
- brag_points: same number as source (3-5), each one short sentence
- vibe_caption: 1 line, equivalent of <15 English words

Output the same JSON schema.`;

export const VIBE_MODIFIERS = ["soft", "chaotic", "confident", "cryptic"] as const;
export type VibeModifier = (typeof VIBE_MODIFIERS)[number];

const MODIFIER_PROMPTS: Record<VibeModifier, string> = {
  soft: "For this version, lean specifically into gentleness, vulnerability, and the quiet wins. Less swagger, more warmth. Peach or lavender often fit.",
  chaotic:
    "For this version, crank up the maximalist chaotic-girlie energy. More delulu, more sparkle, more 'I am unwell but in a fun way'. Brag points should feel like a group-chat avalanche.",
  confident:
    "For this version, go bolder. Audacious 'I'm that girl' confidence. No apologies, no hedging. Sunset or ocean often fit.",
  cryptic:
    "For this version, keep it mysterious. Fewer adjectives, more atmosphere. Quietly powerful, slightly haunted. Mono or lavender often fit.",
};

export function isVibeModifier(value: unknown): value is VibeModifier {
  return (
    typeof value === "string" &&
    (VIBE_MODIFIERS as readonly string[]).includes(value)
  );
}

const RESPONSE_SCHEMA = {
  type: "object",
  properties: {
    title: { type: "string" },
    brag_points: {
      type: "array",
      items: { type: "string" },
    },
    vibe_caption: { type: "string" },
    emoji: { type: "string" },
    color_theme: {
      type: "string",
      enum: [...COLOR_THEMES],
    },
  },
  required: ["title", "brag_points", "vibe_caption", "emoji", "color_theme"],
  additionalProperties: false,
};

let _client: Anthropic | null = null;
function getClient(): Anthropic {
  if (_client) return _client;
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) {
    throw new Error("ANTHROPIC_API_KEY is not set");
  }
  _client = new Anthropic({ apiKey: key });
  return _client;
}

export type GeneratedCard = {
  title: string;
  bragPoints: string[];
  vibeCaption: string;
  emoji: string;
  colorTheme: ColorTheme;
};

/**
 * Calls Claude with a strict-JSON system prompt + json_schema output_config.
 * Retries once on parse / validation failure. When `modifier` is set, an
 * extra "Refinement guidance" line is appended to the system prompt to
 * shift the tonal register for the refine flow.
 */
export async function generateBragCard(
  rawStory: string,
  modifier?: VibeModifier,
): Promise<GeneratedCard> {
  let lastError: unknown = null;
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      return await callOnce(rawStory, modifier);
    } catch (err) {
      lastError = err;
      console.warn(`[generate] attempt ${attempt + 1} failed:`, err);
      // Bail out on auth / rate-limit errors — retrying won't help.
      if (
        err instanceof Anthropic.AuthenticationError ||
        err instanceof Anthropic.RateLimitError ||
        err instanceof Anthropic.PermissionDeniedError
      ) {
        throw err;
      }
    }
  }
  throw lastError ?? new Error("Generation failed");
}

async function callOnce(
  rawStory: string,
  modifier?: VibeModifier,
): Promise<GeneratedCard> {
  const client = getClient();

  const system = modifier
    ? `${SYSTEM_PROMPT}\n\nRefinement guidance: ${MODIFIER_PROMPTS[modifier]}`
    : SYSTEM_PROMPT;

  return callModel(client, system, rawStory);
}

/**
 * Translate an existing card's text to another language. Preserves the
 * emoji and color_theme verbatim — only language changes. Retries once
 * on parse / validation failure, mirroring generateBragCard.
 */
export async function translateCard(
  card: GeneratedCard,
  targetLanguageName: string,
): Promise<GeneratedCard> {
  const sourcePayload = JSON.stringify({
    title: card.title,
    brag_points: card.bragPoints,
    vibe_caption: card.vibeCaption,
    emoji: card.emoji,
    color_theme: card.colorTheme,
  });

  let lastError: unknown = null;
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const client = getClient();
      const system = TRANSLATE_SYSTEM_PROMPT_FOR(targetLanguageName);
      const result = await callModel(client, system, sourcePayload);
      // Defensive: enforce emoji + color_theme didn't drift even though
      // the prompt asks to preserve them. If Claude got creative, snap back.
      return {
        ...result,
        emoji: card.emoji,
        colorTheme: card.colorTheme,
      };
    } catch (err) {
      lastError = err;
      console.warn(`[translate] attempt ${attempt + 1} failed:`, err);
      if (
        err instanceof Anthropic.AuthenticationError ||
        err instanceof Anthropic.RateLimitError ||
        err instanceof Anthropic.PermissionDeniedError
      ) {
        throw err;
      }
    }
  }
  throw lastError ?? new Error("Translation failed");
}

async function callModel(
  client: Anthropic,
  system: string,
  userInput: string,
): Promise<GeneratedCard> {
  // @anthropic-ai/sdk 0.68 hasn't typed `output_config` (the GA
  // structured-outputs param) yet. The wire-level field is supported
  // by the API; we augment the request type locally so the return type
  // (Anthropic.Message) still narrows correctly.
  const params: Anthropic.MessageCreateParamsNonStreaming & {
    output_config?: {
      format: { type: "json_schema"; schema: typeof RESPONSE_SCHEMA };
    };
  } = {
    model: "claude-sonnet-4-6",
    max_tokens: 600,
    system,
    messages: [{ role: "user", content: userInput }],
    output_config: {
      format: { type: "json_schema", schema: RESPONSE_SCHEMA },
    },
  };

  const message = await client.messages.create(params);

  const textBlock = message.content.find((b) => b.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    throw new Error("No text block in Claude response");
  }

  // output_config enforces the schema server-side, but parse + validate
  // defensively so a malformed response surfaces as a clean retry signal.
  const parsed = JSON.parse(textBlock.text);
  return validate(parsed);
}

function validate(raw: unknown): GeneratedCard {
  if (typeof raw !== "object" || raw === null) {
    throw new Error("response is not an object");
  }
  const obj = raw as Record<string, unknown>;

  if (typeof obj.title !== "string" || !obj.title.trim()) {
    throw new Error("invalid title");
  }
  if (!Array.isArray(obj.brag_points)) {
    throw new Error("brag_points must be an array");
  }
  if (obj.brag_points.length < 3 || obj.brag_points.length > 5) {
    throw new Error(`brag_points must be 3-5 items, got ${obj.brag_points.length}`);
  }
  if (!obj.brag_points.every((p): p is string => typeof p === "string" && p.trim().length > 0)) {
    throw new Error("brag_points must be non-empty strings");
  }
  if (typeof obj.vibe_caption !== "string" || !obj.vibe_caption.trim()) {
    throw new Error("invalid vibe_caption");
  }
  if (typeof obj.emoji !== "string" || !obj.emoji.trim()) {
    throw new Error("invalid emoji");
  }
  if (typeof obj.color_theme !== "string") {
    throw new Error("invalid color_theme type");
  }
  if (!(COLOR_THEMES as readonly string[]).includes(obj.color_theme)) {
    throw new Error(`color_theme not in enum: ${obj.color_theme}`);
  }

  return {
    title: obj.title.trim(),
    bragPoints: obj.brag_points.map((s) => s.trim()),
    vibeCaption: obj.vibe_caption.trim(),
    emoji: obj.emoji.trim(),
    colorTheme: obj.color_theme as ColorTheme,
  };
}
