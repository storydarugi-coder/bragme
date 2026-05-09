"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Card, type CardData, type CardVariant } from "./Card";
import { CardActions } from "./CardActions";
import { ThemePicker } from "./ThemePicker";
import { EmojiPicker } from "./EmojiPicker";
import { LayoutTabs, type LayoutMode } from "./LayoutTabs";
import { ShareText } from "./ShareText";
import { RefinePicker } from "./RefinePicker";
import { TranslatePicker } from "./TranslatePicker";
import { PremiumCta } from "@/components/PremiumCta";
import { loadCard, saveCard } from "@/lib/card-storage";
import {
  hasCheered,
  loadCheerCount,
  markCheered,
  saveCheerCount,
} from "@/lib/cheer-storage";
import type { ColorTheme } from "@/db/schema";

type Props = {
  data: CardData;
  watermark: boolean;
  premiumUrl: string | null;
};

const VARIANTS_BY_LAYOUT: Record<LayoutMode, CardVariant[]> = {
  default: ["story", "post"],
  photocard: ["photocard"],
  polaroid: ["polaroid"],
  magazine: ["magazine"],
  receipt: ["receipt"],
  notebook: ["notebook"],
};

export function CardDetail({ data, watermark, premiumUrl }: Props) {
  const [theme, setTheme] = useState<ColorTheme>(data.colorTheme);
  const [emoji, setEmoji] = useState(data.emoji);
  const [cheers, setCheers] = useState(data.cheersCount);
  const [cheered, setCheered] = useState(false);
  const [layoutMode, setLayoutMode] = useState<LayoutMode>("default");
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const stored = loadCard(data.id);
    if (stored) {
      setTheme(stored.colorTheme);
      setEmoji(stored.emoji);
    }
    const storedCount = loadCheerCount(data.id);
    if (storedCount !== null) setCheers(storedCount);
    setCheered(hasCheered(data.id));
    setHydrated(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.id]);

  useEffect(() => {
    if (!hydrated) return;
    saveCard({ ...data, colorTheme: theme, emoji, cheersCount: cheers });
  }, [data, theme, emoji, cheers, hydrated]);

  function handleCheer() {
    if (cheered) return;
    const next = cheers + 1;
    setCheers(next);
    setCheered(true);
    markCheered(data.id);
    saveCheerCount(data.id, next);

    void fetch("/api/cheer", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ card_id: data.id }),
    }).catch((err) => console.warn("[cheer] persist failed", err));
  }

  const customized: CardData = {
    ...data,
    colorTheme: theme,
    emoji,
    cheersCount: cheers,
  };

  const variants = VARIANTS_BY_LAYOUT[layoutMode];

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

      <LayoutTabs value={layoutMode} onChange={setLayoutMode} />

      <div className="flex w-full flex-wrap items-start justify-center gap-8">
        {variants.map((v) => (
          <div key={v} className="flex flex-col items-center gap-3">
            <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted">
              {labelFor(v)}
            </span>
            <Card data={customized} variant={v} watermark={watermark} />
          </div>
        ))}
      </div>

      <section className="w-full max-w-md space-y-4 rounded-2xl border border-foreground/10 bg-foreground/5 p-5">
        <h2 className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted">
          Tweak the vibe
        </h2>
        <ThemePicker value={theme} onChange={setTheme} />
        <EmojiPicker value={emoji} onChange={setEmoji} />
      </section>

      <RefinePicker cardId={data.id} />

      <TranslatePicker cardId={data.id} />

      <div className="w-full max-w-md space-y-3">
        <CardActions
          data={customized}
          targetSelector={`[data-card-id="${data.id}"]`}
          variants={variants}
        />
        <PremiumCta
          cardId={data.id}
          alreadyPremium={!watermark}
          premiumUrl={premiumUrl}
        />
        <CheersRow count={cheers} cheered={cheered} onCheer={handleCheer} />
        <ShareText data={customized} />
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

function labelFor(variant: CardVariant): string {
  switch (variant) {
    case "story":
      return "9:16 · story";
    case "post":
      return "1:1 · post";
    case "photocard":
      return "photocard";
    case "polaroid":
      return "polaroid";
    case "magazine":
      return "magazine";
    case "receipt":
      return "receipt";
    case "notebook":
      return "notebook";
  }
}

function CheersRow({
  count,
  cheered,
  onCheer,
}: {
  count: number;
  cheered: boolean;
  onCheer: () => void;
}) {
  const [pulse, setPulse] = useState(false);

  function handleClick() {
    if (cheered) return;
    setPulse(true);
    setTimeout(() => setPulse(false), 400);
    onCheer();
  }

  return (
    <div className="flex items-center justify-between rounded-2xl border border-foreground/10 bg-foreground/5 px-4 py-3 text-sm">
      <span className="text-muted">
        <span
          className={[
            "inline-block font-semibold text-foreground tabular-nums transition-transform duration-300",
            pulse ? "scale-125" : "scale-100",
          ].join(" ")}
        >
          {count.toLocaleString()}
        </span>{" "}
        cheers
      </span>
      <button
        type="button"
        onClick={handleClick}
        disabled={cheered}
        aria-pressed={cheered}
        className={[
          "rounded-full px-4 py-1.5 font-mono text-xs font-medium uppercase tracking-[0.15em] transition-all duration-200",
          pulse ? "scale-110" : "scale-100",
          cheered
            ? "cursor-default bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
            : "bg-foreground/10 hover:bg-foreground/20",
        ].join(" ")}
      >
        {cheered ? "🥂 cheered" : "🥂 cheer"}
      </button>
    </div>
  );
}
