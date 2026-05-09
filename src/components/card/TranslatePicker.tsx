"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { CardData } from "./Card";
import { markCreated, saveCard } from "@/lib/card-storage";
import { LANGUAGES, type LanguageCode } from "@/lib/languages";

type Props = {
  cardId: string;
};

const NETWORK_ERROR = "Couldn't translate right now. Try again?";

export function TranslatePicker({ cardId }: Props) {
  const router = useRouter();
  const [active, setActive] = useState<LanguageCode | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function translate(code: LanguageCode) {
    if (active) return;
    setActive(code);
    setError(null);

    try {
      const res = await fetch("/api/translate", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ card_id: cardId, target_language: code }),
      });

      const body = (await res.json().catch(() => null)) as
        | { card: CardData }
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
      markCreated(body.card.id);
      router.push(`/card/${body.card.id}`);
    } catch (err) {
      console.error("[translate]", err);
      setError(NETWORK_ERROR);
      setActive(null);
    }
  }

  return (
    <section className="w-full max-w-md space-y-3 rounded-2xl border border-foreground/10 bg-foreground/5 p-5">
      <div>
        <h2 className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted">
          Translate
        </h2>
        <p className="mt-1 text-xs text-muted/80">
          Same card, different language. Each translation lands as its own
          shareable card.
        </p>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {LANGUAGES.map((lang) => {
          const busy = active === lang.code;
          const disabled = active !== null;
          return (
            <button
              key={lang.code}
              type="button"
              onClick={() => translate(lang.code)}
              disabled={disabled}
              className={[
                "flex items-center gap-2 rounded-xl border px-3 py-2 text-left text-sm transition",
                busy
                  ? "border-foreground/30 bg-foreground/10"
                  : "border-foreground/10 bg-background hover:border-foreground/30",
                disabled && !busy ? "opacity-40" : "",
              ].join(" ")}
            >
              <span aria-hidden className="text-base leading-none">
                {lang.flag}
              </span>
              <span className="truncate text-xs sm:text-sm">
                {lang.name}
                {busy && <span className="ml-1 animate-pulse">…</span>}
              </span>
            </button>
          );
        })}
      </div>
      {error && (
        <p role="alert" className="text-center text-xs text-rose-500">
          {error}
        </p>
      )}
    </section>
  );
}
