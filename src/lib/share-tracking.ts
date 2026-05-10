// Tiny sessionStorage counter that bumps every time the user copies a
// share snippet or hits the Share button. Surfaced on /mine as a tiny
// "you shared X today" stat so the experience feels less ephemeral
// without breaking anonymity (no accounts, no server-side tracking).

const KEY = "bragme:shares";

export function bumpShareCount(): number {
  if (typeof window === "undefined") return 0;
  try {
    const raw = sessionStorage.getItem(KEY);
    const current = raw ? Number.parseInt(raw, 10) : 0;
    const next = (Number.isFinite(current) ? current : 0) + 1;
    sessionStorage.setItem(KEY, String(next));
    return next;
  } catch {
    return 0;
  }
}

export function loadShareCount(): number {
  if (typeof window === "undefined") return 0;
  try {
    const raw = sessionStorage.getItem(KEY);
    if (!raw) return 0;
    const n = Number.parseInt(raw, 10);
    return Number.isFinite(n) ? n : 0;
  } catch {
    return 0;
  }
}
