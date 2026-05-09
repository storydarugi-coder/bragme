"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { CardData } from "./Card";
import { loadRawStory, saveCard, saveRawStory } from "@/lib/card-storage";
import { VIBE_MODIFIERS, type VibeModifier } from "@/lib/claude";

type Props = {
  cardId: string;
};

const LABELS: Record<VibeModifier, { emoji: string; label: string; desc: string }> = {
  soft: { emoji: "🤍", label: "Softer", desc: "gentler, warmer" },
  chaotic: { emoji: "🔥", label: "Chaotic", desc: "more delulu" },
  confident: { emoji: "👑", label: "Confident", desc: "no apologies" },
  cryptic: { emoji: "🌑", label: "Cryptic", desc: "atmospheric" },
};

const NETWORK_ERROR = "Couldn't refine right now. Try again?";

export function RefinePicker({ cardId }: Props) {
  const router = useRouter();
  const [active, setActive] = useState<VibeModifier | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function refine(modifier: VibeModifier) {
    if (active) return;
    setActive(modifier);
    setError(null);

    try {
      const rawStory = loadRawStory(cardId);
      const res = await fetch("/api/refine", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          card_id: cardId,
          vibe_modifier: modifier,
          raw_story: rawStory ?? undefined,
        }),
      });

      const body = (await res.json().catch(() => null)) as
        | { card: CardData; rawStory: string }
        | { error: { code: string; message: string } }
        | null;

      if (!res.ok || !body || "error" in body) {
        const msg =
          body && "error" in body ? body.error.message : NETWORK_ERROR;
        setError(msg);
        setActive(null);
        return;
      }

      saveCard(body.card);
      saveRawStory(body.card.id, body.rawStory);
      router.push(`/card/${body.card.id}`);
    } catch (err) {
      console.error("[refine]", err);
      setError(NETWORK_ERROR);
      setActive(null);
    }
  }

  return (
    <section className="w-full max-w-md space-y-3 rounded-2xl border border-foreground/10 bg-foreground/5 p-5">
      <div>
        <h2 className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted">
          Try a different angle
        </h2>
        <p className="mt-1 text-xs text-muted/80">
          Same story, fresh tone. Lands on a new card so the original stays put.
        </p>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {VIBE_MODIFIERS.map((m) => {
          const meta = LABELS[m];
          const busy = active === m;
          const disabled = active !== null;
          return (
            <button
              key={m}
              type="button"
              onClick={() => refine(m)}
              disabled={disabled}
              className={[
                "flex flex-col items-start gap-0.5 rounded-xl border px-3 py-2.5 text-left transition",
                busy
                  ? "border-foreground/30 bg-foreground/10"
                  : "border-foreground/10 bg-background hover:border-foreground/30",
                disabled && !busy ? "opacity-40" : "",
              ].join(" ")}
            >
              <span className="text-sm font-medium">
                {meta.emoji} {meta.label}
                {busy && <span className="ml-1 animate-pulse">…</span>}
              </span>
              <span className="text-[11px] text-muted">{meta.desc}</span>
            </button>
          );
        })}
      </div>
      {error && (
        <p
          role="alert"
          className="text-center text-xs text-rose-500"
        >
          {error}
        </p>
      )}
    </section>
  );
}
