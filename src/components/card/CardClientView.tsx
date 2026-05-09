"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { CardData } from "./Card";
import { CardDetail } from "./CardDetail";
import { loadCard } from "@/lib/card-storage";

type Props = {
  id: string;
  watermark: boolean;
  premiumUrl: string | null;
};

type State = { kind: "loading" } | { kind: "missing" } | { kind: "ok"; card: CardData };

export function CardClientView({ id, watermark, premiumUrl }: Props) {
  const [state, setState] = useState<State>({ kind: "loading" });

  useEffect(() => {
    const stored = loadCard(id);
    setState(stored ? { kind: "ok", card: stored } : { kind: "missing" });
  }, [id]);

  if (state.kind === "loading") {
    return (
      <div className="flex flex-col items-center gap-6">
        <div className="aspect-[9/16] w-[320px] animate-pulse rounded-3xl bg-foreground/10" />
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted">
          Hydrating card…
        </p>
      </div>
    );
  }

  if (state.kind === "missing") {
    return (
      <div className="flex max-w-md flex-col items-center gap-4 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">
          This card flew away.
        </h1>
        <p className="text-sm text-muted">
          Cards live in your session for now — once we wire the database, links
          will stick around. For the moment, generate a fresh one.
        </p>
        <Link
          href="/"
          className="rounded-full bg-foreground px-5 py-2.5 text-sm font-medium text-background hover:opacity-90"
        >
          Make a new card →
        </Link>
      </div>
    );
  }

  return (
    <CardDetail
      data={state.card}
      watermark={watermark}
      premiumUrl={premiumUrl}
    />
  );
}
