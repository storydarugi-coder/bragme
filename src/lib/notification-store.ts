// SessionStorage-backed notification state. The poller writes per-card
// reaction snapshots; deltas between polls fire toast events. Cleared
// on tab close, like everything else session-scoped.

const SNAP_KEY = (id: string) => `bragme:notif:snap:${id}`;
const UNREAD_KEY = "bragme:notif:unread";
const CHANGE_EVENT = "bragme:notif:change";

export type ReactionSnapshot = {
  cheer: number;
  unhinged: number;
  facts: number;
  feltThat: number;
};

export function loadSnapshot(cardId: string): ReactionSnapshot | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(SNAP_KEY(cardId));
    if (!raw) return null;
    return JSON.parse(raw) as ReactionSnapshot;
  } catch {
    return null;
  }
}

export function saveSnapshot(
  cardId: string,
  snap: ReactionSnapshot,
): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(SNAP_KEY(cardId), JSON.stringify(snap));
  } catch {
    // ignore
  }
}

export function loadUnreadCount(): number {
  if (typeof window === "undefined") return 0;
  try {
    const raw = sessionStorage.getItem(UNREAD_KEY);
    if (!raw) return 0;
    const n = Number.parseInt(raw, 10);
    return Number.isFinite(n) ? n : 0;
  } catch {
    return 0;
  }
}

export function bumpUnread(by = 1): number {
  if (typeof window === "undefined") return 0;
  try {
    const next = loadUnreadCount() + by;
    sessionStorage.setItem(UNREAD_KEY, String(next));
    window.dispatchEvent(new CustomEvent(CHANGE_EVENT));
    return next;
  } catch {
    return 0;
  }
}

export function clearUnread(): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(UNREAD_KEY, "0");
    window.dispatchEvent(new CustomEvent(CHANGE_EVENT));
  } catch {
    // ignore
  }
}

export const NOTIFICATION_CHANGE_EVENT = CHANGE_EVENT;
export const NOTIFICATION_TOAST_EVENT = "bragme:notif:new";
