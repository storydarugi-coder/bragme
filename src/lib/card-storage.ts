import type { CardData } from "@/components/card/Card";

const KEY = (id: string) => `bragme:card:${id}`;
const RAW_KEY = (id: string) => `bragme:raw:${id}`;

export function saveCard(card: CardData): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(KEY(card.id), JSON.stringify(card));
  } catch {
    // sessionStorage may be disabled / quota exceeded; ignore.
  }
}

export function loadCard(id: string): CardData | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(KEY(id));
    if (!raw) return null;
    return JSON.parse(raw) as CardData;
  } catch {
    return null;
  }
}

/**
 * Persist the user's original raw_story alongside the generated card so
 * the refine flow can re-call /api/generate without round-tripping to
 * the database. Only ever holds the active session's stories.
 */
export function saveRawStory(id: string, raw: string): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(RAW_KEY(id), raw);
  } catch {
    // ignore
  }
}

export function loadRawStory(id: string): string | null {
  if (typeof window === "undefined") return null;
  try {
    return sessionStorage.getItem(RAW_KEY(id));
  } catch {
    return null;
  }
}
