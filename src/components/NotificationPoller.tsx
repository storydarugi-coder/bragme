"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import type { CardData } from "@/components/card/Card";
import { listCreatedIds } from "@/lib/card-storage";
import {
  bumpUnread,
  loadSnapshot,
  saveSnapshot,
  type ReactionSnapshot,
  NOTIFICATION_TOAST_EVENT,
} from "@/lib/notification-store";

const POLL_MS = 60_000;
const FIRST_POLL_DELAY_MS = 5_000;

function snapshotOf(card: CardData): ReactionSnapshot {
  return {
    cheer: card.cheersCount,
    unhinged: card.unhingedCount,
    facts: card.factsCount,
    feltThat: card.feltThatCount,
  };
}

function totalDelta(prev: ReactionSnapshot, next: ReactionSnapshot) {
  return {
    cheer: Math.max(0, next.cheer - prev.cheer),
    unhinged: Math.max(0, next.unhinged - prev.unhinged),
    facts: Math.max(0, next.facts - prev.facts),
    feltThat: Math.max(0, next.feltThat - prev.feltThat),
  };
}

export function NotificationPoller() {
  const pathname = usePathname() ?? "";

  useEffect(() => {
    // Don't poll on the password-gated Korean preview pages.
    if (pathname.startsWith("/glorious")) return;

    let timeout: ReturnType<typeof setTimeout> | null = null;
    let cancelled = false;

    async function tick() {
      if (cancelled) return;
      if (typeof document !== "undefined" && document.hidden) {
        timeout = setTimeout(tick, POLL_MS);
        return;
      }

      const ids = listCreatedIds();
      if (ids.length === 0) {
        timeout = setTimeout(tick, POLL_MS);
        return;
      }

      try {
        const results = await Promise.allSettled(
          ids.map((id) =>
            fetch(`/api/card/${id}`, { cache: "no-store" }).then((r) =>
              r.ok ? r.json() : null,
            ),
          ),
        );

        for (let i = 0; i < ids.length; i++) {
          const res = results[i];
          if (
            res.status !== "fulfilled" ||
            !res.value ||
            !("card" in res.value)
          ) {
            continue;
          }
          const card = (res.value as { card: CardData }).card;
          const next = snapshotOf(card);
          const prev = loadSnapshot(card.id);
          saveSnapshot(card.id, next);

          if (!prev) continue; // first poll for this card; baseline only
          const delta = totalDelta(prev, next);
          const total =
            delta.cheer + delta.unhinged + delta.facts + delta.feltThat;
          if (total <= 0) continue;

          bumpUnread(total);
          window.dispatchEvent(
            new CustomEvent(NOTIFICATION_TOAST_EVENT, {
              detail: { card, delta },
            }),
          );
        }
      } catch (err) {
        console.warn("[notif] poll failed", err);
      }

      if (!cancelled) timeout = setTimeout(tick, POLL_MS);
    }

    timeout = setTimeout(tick, FIRST_POLL_DELAY_MS);
    return () => {
      cancelled = true;
      if (timeout) clearTimeout(timeout);
    };
  }, [pathname]);

  return null;
}
