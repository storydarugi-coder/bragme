"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Card,
  REACTIONS,
  type CardData,
  type CardVariant,
  type Reaction,
} from "./Card";
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
  hasReacted,
  loadReactionCount,
  markReacted,
  saveReactionCount,
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
  trading: ["trading"],
  stamp: ["stamp"],
  manga: ["manga"],
};

type ReactionCounts = {
  cheer: number;
  unhinged: number;
  facts: number;
  "felt-that": number;
};

function initialCounts(data: CardData): ReactionCounts {
  return {
    cheer: data.cheersCount,
    unhinged: data.unhingedCount,
    facts: data.factsCount,
    "felt-that": data.feltThatCount,
  };
}

export function CardDetail({ data, watermark, premiumUrl }: Props) {
  const [theme, setTheme] = useState<ColorTheme>(data.colorTheme);
  const [emoji, setEmoji] = useState(data.emoji);
  const [counts, setCounts] = useState<ReactionCounts>(() => initialCounts(data));
  const [reacted, setReacted] = useState<Set<Reaction>>(() => new Set());
  const [layoutMode, setLayoutMode] = useState<LayoutMode>("default");
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const stored = loadCard(data.id);
    if (stored) {
      setTheme(stored.colorTheme);
      setEmoji(stored.emoji);
    }
    const nextCounts = initialCounts(data);
    const nextReacted = new Set<Reaction>();
    for (const r of REACTIONS) {
      const stored = loadReactionCount(data.id, r.id);
      if (stored !== null) nextCounts[r.id] = stored;
      if (hasReacted(data.id, r.id)) nextReacted.add(r.id);
    }
    setCounts(nextCounts);
    setReacted(nextReacted);
    setHydrated(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.id]);

  useEffect(() => {
    if (!hydrated) return;
    saveCard({
      ...data,
      colorTheme: theme,
      emoji,
      cheersCount: counts.cheer,
      unhingedCount: counts.unhinged,
      factsCount: counts.facts,
      feltThatCount: counts["felt-that"],
    });
  }, [data, theme, emoji, counts, hydrated]);

  function handleReact(reaction: Reaction) {
    if (reacted.has(reaction)) return;
    const next = counts[reaction] + 1;
    setCounts((prev) => ({ ...prev, [reaction]: next }));
    setReacted((prev) => new Set(prev).add(reaction));
    markReacted(data.id, reaction);
    saveReactionCount(data.id, reaction, next);

    void fetch("/api/react", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ card_id: data.id, reaction }),
    }).catch((err) => console.warn("[react] persist failed", err));
  }

  const customized: CardData = {
    ...data,
    colorTheme: theme,
    emoji,
    cheersCount: counts.cheer,
    unhingedCount: counts.unhinged,
    factsCount: counts.facts,
    feltThatCount: counts["felt-that"],
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
        <ReactionsRow counts={counts} reacted={reacted} onReact={handleReact} />
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
    case "trading":
      return "trading card";
    case "stamp":
      return "stamp";
    case "manga":
      return "manga panel";
  }
}

function ReactionsRow({
  counts,
  reacted,
  onReact,
}: {
  counts: ReactionCounts;
  reacted: Set<Reaction>;
  onReact: (r: Reaction) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
      {REACTIONS.map((r) => (
        <ReactionButton
          key={r.id}
          reaction={r.id}
          emoji={r.emoji}
          label={r.label}
          count={counts[r.id]}
          active={reacted.has(r.id)}
          onClick={() => onReact(r.id)}
        />
      ))}
    </div>
  );
}

function ReactionButton({
  reaction,
  emoji,
  label,
  count,
  active,
  onClick,
}: {
  reaction: Reaction;
  emoji: string;
  label: string;
  count: number;
  active: boolean;
  onClick: () => void;
}) {
  void reaction;
  const [pulse, setPulse] = useState(false);

  function handleClick() {
    if (active) return;
    setPulse(true);
    setTimeout(() => setPulse(false), 400);
    onClick();
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={active}
      aria-pressed={active}
      className={[
        "flex flex-col items-center gap-0.5 rounded-2xl border px-2 py-2.5 text-center transition-all duration-200",
        pulse ? "scale-110" : "scale-100",
        active
          ? "cursor-default border-emerald-500/30 bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
          : "border-foreground/10 bg-foreground/5 hover:border-foreground/20 hover:bg-foreground/10",
      ].join(" ")}
    >
      <span className="text-xl leading-none" aria-hidden>
        {emoji}
      </span>
      <span
        className={[
          "font-semibold tabular-nums leading-tight transition-transform duration-300",
          pulse ? "scale-125" : "scale-100",
        ].join(" ")}
      >
        {count.toLocaleString()}
      </span>
      <span className="font-mono text-[9px] uppercase tracking-[0.15em] leading-tight">
        {label}
      </span>
    </button>
  );
}
