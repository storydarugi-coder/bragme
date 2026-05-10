// SessionStorage-backed reaction state for the UI-first build. Real
// version replaces these helpers with `fetch("/api/react", …)` + a
// server-side IP rate limit per (card, reaction).

import type { Reaction } from "@/components/card/Card";

const VOTED_KEY = (id: string, reaction: Reaction) =>
  `bragme:reacted:${reaction}:${id}`;
const COUNT_KEY = (id: string, reaction: Reaction) =>
  `bragme:count:${reaction}:${id}`;

export function hasReacted(id: string, reaction: Reaction): boolean {
  if (typeof window === "undefined") return false;
  return sessionStorage.getItem(VOTED_KEY(id, reaction)) === "1";
}

export function markReacted(id: string, reaction: Reaction): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(VOTED_KEY(id, reaction), "1");
  } catch {
    // ignore
  }
}

export function loadReactionCount(
  id: string,
  reaction: Reaction,
): number | null {
  if (typeof window === "undefined") return null;
  const raw = sessionStorage.getItem(COUNT_KEY(id, reaction));
  if (raw === null) return null;
  const n = Number.parseInt(raw, 10);
  return Number.isFinite(n) ? n : null;
}

export function saveReactionCount(
  id: string,
  reaction: Reaction,
  count: number,
): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(COUNT_KEY(id, reaction), String(count));
  } catch {
    // ignore
  }
}

// Backwards-compat shims for code that still imports the cheer-only
// helpers. Cheer is just one specific reaction now.
export function hasCheered(id: string): boolean {
  return hasReacted(id, "cheer");
}
export function markCheered(id: string): void {
  markReacted(id, "cheer");
}
export function loadCheerCount(id: string): number | null {
  return loadReactionCount(id, "cheer");
}
export function saveCheerCount(id: string, count: number): void {
  saveReactionCount(id, "cheer", count);
}
