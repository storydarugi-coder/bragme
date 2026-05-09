"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Card, type CardData } from "./Card";
import { CardActions } from "./CardActions";
import { ThemePicker } from "./ThemePicker";
import { EmojiPicker } from "./EmojiPicker";
import { PremiumCta } from "@/components/PremiumCta";
import { loadCard, saveCard } from "@/lib/card-storage";
import type { ColorTheme } from "@/db/schema";

type Props = {
  data: CardData;
  watermark: boolean;
  premiumUrl: string | null;
};

export function CardDetail({ data, watermark, premiumUrl }: Props) {
  const [theme, setTheme] = useState<ColorTheme>(data.colorTheme);
  const [emoji, setEmoji] = useState(data.emoji);
  const [hydrated, setHydrated] = useState(false);

  // Hydrate any prior session-stored customization for this card id.
  useEffect(() => {
    const stored = loadCard(data.id);
    if (stored) {
      setTheme(stored.colorTheme);
      setEmoji(stored.emoji);
    }
    setHydrated(true);
    // We only want this on first mount per id, not whenever the parent
    // happens to re-render with a fresh object literal.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.id]);

  // Persist customization back so reloads + /card/[id] direct visits keep
  // the user's chosen vibe. Skip until we've finished hydrating to avoid
  // overwriting the override with the prop's defaults on first paint.
  useEffect(() => {
    if (!hydrated) return;
    saveCard({ ...data, colorTheme: theme, emoji });
  }, [data, theme, emoji, hydrated]);

  const customized: CardData = { ...data, colorTheme: theme, emoji };

  return (
    <div className="flex w-full max-w-5xl flex-col items-center gap-10">
      <header className="flex flex-col items-center gap-2 text-center">
        <span className="font-mono text-xs uppercase tracking-[0.28em] text-muted">
          your card
        </span>
        <h1 className="text-balance text-2xl font-semibold tracking-tight sm:text-3xl">
          {data.title}
        </h1>
        <p className="text-sm text-muted">@{data.nickname}</p>
      </header>

      <div className="flex w-full flex-wrap items-start justify-center gap-8">
        <div className="flex flex-col items-center gap-3">
          <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted">
            9:16 · story
          </span>
          <Card data={customized} variant="story" watermark={watermark} />
        </div>
        <div className="flex flex-col items-center gap-3">
          <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted">
            1:1 · post
          </span>
          <Card data={customized} variant="post" watermark={watermark} />
        </div>
      </div>

      <section className="w-full max-w-md space-y-4 rounded-2xl border border-foreground/10 bg-foreground/5 p-5">
        <h2 className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted">
          Tweak the vibe
        </h2>
        <ThemePicker value={theme} onChange={setTheme} />
        <EmojiPicker value={emoji} onChange={setEmoji} />
      </section>

      <div className="w-full max-w-md space-y-3">
        <CardActions
          data={customized}
          targetSelector={`[data-card-id="${data.id}"]`}
        />
        <PremiumCta
          cardId={data.id}
          alreadyPremium={!watermark}
          premiumUrl={premiumUrl}
        />
        <CheersRow count={data.cheersCount} />
      </div>

      <Link
        href="/"
        className="font-mono text-xs uppercase tracking-[0.2em] text-muted hover:text-foreground"
      >
        ← Make your own
      </Link>
    </div>
  );
}

function CheersRow({ count }: { count: number }) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-foreground/10 bg-foreground/5 px-4 py-3 text-sm">
      <span className="text-muted">
        <span className="font-semibold text-foreground tabular-nums">
          {count.toLocaleString()}
        </span>{" "}
        cheers
      </span>
      <button
        type="button"
        disabled
        title="Cheering ships in step 8"
        className="rounded-full bg-foreground/10 px-3 py-1 font-mono text-xs uppercase tracking-[0.15em] text-muted disabled:cursor-not-allowed"
      >
        🥂 cheer (soon)
      </button>
    </div>
  );
}
