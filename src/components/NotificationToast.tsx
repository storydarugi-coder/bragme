"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { CardData } from "@/components/card/Card";
import {
  NOTIFICATION_TOAST_EVENT,
  type ReactionSnapshot,
} from "@/lib/notification-store";

type Toast = {
  id: string;
  emoji: string;
  message: string;
  href: string;
};

const TOAST_TTL_MS = 6_000;

function topReaction(delta: ReactionSnapshot): {
  emoji: string;
  label: string;
} {
  const entries: Array<{ key: keyof ReactionSnapshot; emoji: string; label: string }> = [
    { key: "cheer", emoji: "🥂", label: "cheered" },
    { key: "unhinged", emoji: "🔥", label: "unhinged" },
    { key: "facts", emoji: "💯", label: "facts" },
    { key: "feltThat", emoji: "🥲", label: "felt that" },
  ];
  let best = entries[0];
  let bestVal = delta[best.key];
  for (const e of entries) {
    if (delta[e.key] > bestVal) {
      best = e;
      bestVal = delta[e.key];
    }
  }
  return { emoji: best.emoji, label: best.label };
}

export function NotificationToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    function handler(e: Event) {
      const detail = (e as CustomEvent<{
        card: CardData;
        delta: ReactionSnapshot;
      }>).detail;
      if (!detail) return;
      const top = topReaction(detail.delta);
      const toast: Toast = {
        id: `${detail.card.id}::${Date.now()}`,
        emoji: top.emoji,
        message: `Someone ${top.label} "${detail.card.title}"`,
        href: `/card/${detail.card.id}`,
      };
      setToasts((prev) => [...prev, toast]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== toast.id));
      }, TOAST_TTL_MS);
    }
    window.addEventListener(NOTIFICATION_TOAST_EVENT, handler);
    return () => window.removeEventListener(NOTIFICATION_TOAST_EVENT, handler);
  }, []);

  function dismiss(id: string) {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }

  if (toasts.length === 0) return null;

  return (
    <div
      className="fixed bottom-4 left-4 z-40 flex max-w-[calc(100vw-2rem)] flex-col gap-2 sm:left-auto sm:right-4 sm:max-w-sm"
      aria-live="polite"
    >
      {toasts.map((t) => (
        <Link
          key={t.id}
          href={t.href}
          onClick={() => dismiss(t.id)}
          className="fade-up flex items-center gap-3 rounded-2xl border border-foreground/10 bg-background/95 px-4 py-3 shadow-2xl backdrop-blur transition hover:border-foreground/30"
        >
          <span className="text-2xl leading-none" aria-hidden>
            {t.emoji}
          </span>
          <span className="flex-1 text-sm leading-snug">{t.message}</span>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              dismiss(t.id);
            }}
            aria-label="Dismiss"
            className="font-mono text-xs text-muted hover:text-foreground"
          >
            ✕
          </button>
        </Link>
      ))}
    </div>
  );
}
