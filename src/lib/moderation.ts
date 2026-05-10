// Lightweight spam/abuse heuristics applied at the API gate before we
// spend a Claude call on someone's story. We deliberately don't attempt
// hate-speech / slur detection here — that's a hard problem with high
// false-positive cost, and Claude's own safeguards already refuse to
// generate cards from genuinely awful prompts. This layer's job is just
// to filter obvious garbage (URL spam, screaming caps, key-mash) so the
// public feed stays readable.

export type ModerationResult =
  | { ok: true }
  | { ok: false; reason: string };

const URL_RE = /\bhttps?:\/\/\S+/i;
const REPEATED_CHAR_RE = /(.)\1{9,}/; // 10+ of the same character in a row
const ALL_CAPS_RUN_RE = /[A-Z]{40,}/; // 40+ consecutive uppercase ASCII letters

export function moderateStory(text: string): ModerationResult {
  const trimmed = text.trim();
  if (URL_RE.test(trimmed)) {
    return {
      ok: false,
      reason:
        "Looks like a link snuck in — keep the story about you, not where to find you.",
    };
  }
  if (REPEATED_CHAR_RE.test(trimmed)) {
    return { ok: false, reason: "Too much keysmashing. Try again with words?" };
  }
  if (ALL_CAPS_RUN_RE.test(trimmed)) {
    return { ok: false, reason: "Tone it down — fewer caps, more vibe." };
  }
  // Cheap signal that the story is actually about a person. We don't
  // require a full sentence — just *some* lowercase letter prevents the
  // pure-emoji / pure-symbol submissions that Claude can't make a card from.
  if (!/[a-zA-ZÀ-ɏЀ-ӿ぀-ヿ一-鿿가-힯]/.test(trimmed)) {
    return { ok: false, reason: "Tell us a bit more — words please." };
  }
  return { ok: true };
}
