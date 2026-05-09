"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Card, type CardData } from "@/components/card/Card";
import { loadCard } from "@/lib/card-storage";
import { loadCheerCount } from "@/lib/cheer-storage";

type Props = {
  data: CardData;
};

/**
 * Feed thumbnail. SSRs the raw `data.cheersCount` for SEO + first paint,
 * then on mount syncs from sessionStorage so a card the user just cheered
 * (or themed/emoji'd) on /card/[id] reflects back here without a refresh.
 */
export function FeedCard({ data }: Props) {
  const [snapshot, setSnapshot] = useState<CardData>(data);

  useEffect(() => {
    const stored = loadCard(data.id);
    const storedCount = loadCheerCount(data.id);
    setSnapshot({
      ...data,
      colorTheme: stored?.colorTheme ?? data.colorTheme,
      emoji: stored?.emoji ?? data.emoji,
      cheersCount: storedCount ?? data.cheersCount,
    });
  }, [data]);

  return (
    <Link
      href={`/card/${data.id}`}
      className="group mb-6 block break-inside-avoid transition-all duration-300 hover:-translate-y-2"
    >
      <div className="transition-shadow duration-300 group-hover:[&>*]:shadow-[0_30px_60px_-25px_rgba(0,0,0,0.45)]">
        <Card data={snapshot} variant="story" watermark={false} />
      </div>
    </Link>
  );
}
