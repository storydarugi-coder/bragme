"use client";

import Link from "next/link";
import { Card, type CardData } from "./Card";
import { CardActions } from "./CardActions";
import { PremiumCta } from "@/components/PremiumCta";

type Props = {
  data: CardData;
  watermark: boolean;
  premiumUrl: string | null;
};

export function CardDetail({ data, watermark, premiumUrl }: Props) {
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
          <Card data={data} variant="story" watermark={watermark} />
        </div>
        <div className="flex flex-col items-center gap-3">
          <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted">
            1:1 · post
          </span>
          <Card data={data} variant="post" watermark={watermark} />
        </div>
      </div>

      <div className="w-full max-w-md space-y-3">
        <CardActions
          data={data}
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
