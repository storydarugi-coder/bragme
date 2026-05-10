"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { FeedCard } from "./FeedCard";
import type { CardData } from "./card/Card";
import { listCreatedIds, loadCard } from "@/lib/card-storage";
import { loadShareCount } from "@/lib/share-tracking";

type State =
  | { kind: "loading" }
  | { kind: "empty" }
  | { kind: "ready"; cards: CardData[]; shareCount: number };

export function MineView() {
  const [state, setState] = useState<State>({ kind: "loading" });

  useEffect(() => {
    const ids = listCreatedIds();
    const cards: CardData[] = [];
    for (let i = ids.length - 1; i >= 0; i--) {
      const card = loadCard(ids[i]);
      if (card) cards.push(card);
    }
    if (cards.length === 0) {
      setState({ kind: "empty" });
    } else {
      setState({
        kind: "ready",
        cards,
        shareCount: loadShareCount(),
      });
    }
  }, []);

  if (state.kind === "loading") {
    return (
      <p className="py-16 text-center font-mono text-xs uppercase tracking-[0.2em] text-muted">
        loading your session…
      </p>
    );
  }

  if (state.kind === "empty") {
    return (
      <div className="flex flex-col items-center gap-4 py-16 text-center">
        <p className="text-base text-muted">
          You haven&apos;t made a card this session.
        </p>
        <Link
          href="/"
          className="rounded-full bg-foreground px-5 py-2.5 text-sm font-medium text-background hover:opacity-90"
        >
          Spill it →
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <SessionStats
        cardCount={state.cards.length}
        shareCount={state.shareCount}
      />
      <div className="columns-1 gap-6 sm:columns-2 lg:columns-3">
        {state.cards.map((card) => (
          <FeedCard key={card.id} data={card} />
        ))}
      </div>
    </div>
  );
}

function SessionStats({
  cardCount,
  shareCount,
}: {
  cardCount: number;
  shareCount: number;
}) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:max-w-md">
      <div className="rounded-2xl border border-foreground/10 bg-foreground/5 px-4 py-3">
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted">
          cards spilled
        </p>
        <p className="mt-1 text-2xl font-semibold tabular-nums">
          {cardCount.toLocaleString()}
        </p>
      </div>
      <div className="rounded-2xl border border-foreground/10 bg-foreground/5 px-4 py-3">
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted">
          shares cast
        </p>
        <p className="mt-1 text-2xl font-semibold tabular-nums">
          {shareCount.toLocaleString()}
        </p>
      </div>
    </div>
  );
}
