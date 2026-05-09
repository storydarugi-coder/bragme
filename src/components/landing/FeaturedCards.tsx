import Link from "next/link";
import { FeedCard } from "@/components/FeedCard";
import { SurpriseMeButton } from "@/components/SurpriseMeButton";
import type { CardData } from "@/components/card/Card";

type Props = {
  cards: CardData[];
};

export function FeaturedCards({ cards }: Props) {
  if (cards.length === 0) return null;

  return (
    <section className="mx-auto w-full max-w-7xl">
      <header className="mb-8 flex flex-wrap items-end justify-between gap-3">
        <div>
          <span className="font-mono text-xs uppercase tracking-[0.28em] text-muted">
            strangers&apos; brags
          </span>
          <h2 className="mt-2 text-balance text-2xl font-semibold tracking-tight sm:text-3xl">
            Currently main-charactering.
          </h2>
        </div>
        <div className="flex items-center gap-3">
          <SurpriseMeButton />
          <Link
            href="/feed"
            className="font-mono text-xs uppercase tracking-[0.2em] text-muted underline-offset-4 hover:text-foreground hover:underline"
          >
            full feed →
          </Link>
        </div>
      </header>
      <div className="columns-1 gap-6 sm:columns-2 lg:columns-4">
        {cards.map((c) => (
          <FeedCard key={c.id} data={c} />
        ))}
      </div>
    </section>
  );
}
