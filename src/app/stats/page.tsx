import Link from "next/link";
import { FeedCard } from "@/components/FeedCard";
import { REACTIONS, type Reaction } from "@/components/card/Card";
import { THEMES } from "@/components/card/themes";
import { getGlobalStats, type GlobalStats } from "@/lib/cards-store";

export const metadata = {
  title: "Stats",
  description: "Live BragMe numbers — cards spilled, reactions cast, top vibes.",
};

export const dynamic = "force-dynamic";

const REACTION_TO_TOTAL_KEY: Record<
  Reaction,
  keyof GlobalStats["totalReactions"]
> = {
  cheer: "cheer",
  unhinged: "unhinged",
  facts: "facts",
  "felt-that": "feltThat",
};

export default async function StatsPage() {
  const stats = await getGlobalStats();

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-12 px-6 py-12">
      <header className="max-w-2xl">
        <span className="font-mono text-xs uppercase tracking-[0.28em] text-muted">
          stats · live
        </span>
        <h1 className="mt-2 text-balance text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl">
          By the numbers.
        </h1>
        <p className="mt-3 text-sm text-muted sm:text-base">
          What strangers have been brewing across BragMe. Updated whenever you
          reload — no analytics platform attached.
        </p>
      </header>

      <section className="rounded-3xl border border-foreground/10 bg-foreground/5 p-8 text-center sm:p-12">
        <p className="font-mono text-xs uppercase tracking-[0.28em] text-muted">
          cards spilled
        </p>
        <p className="mt-3 text-7xl font-semibold tabular-nums sm:text-8xl">
          {stats.totalCards.toLocaleString()}
        </p>
        {stats.totalCards === 0 && (
          <p className="mt-4 text-sm text-muted">
            Empty for now —{" "}
            <Link
              href="/"
              className="underline-offset-4 hover:text-foreground hover:underline"
            >
              be the first to spill →
            </Link>
          </p>
        )}
      </section>

      <section>
        <h2 className="mb-4 font-mono text-xs uppercase tracking-[0.28em] text-muted">
          reactions cast
        </h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {REACTIONS.map((r) => {
            const count = stats.totalReactions[REACTION_TO_TOTAL_KEY[r.id]];
            return (
              <div
                key={r.id}
                className="rounded-2xl border border-foreground/10 bg-foreground/5 p-4 text-center"
              >
                <span className="text-3xl leading-none" aria-hidden>
                  {r.emoji}
                </span>
                <p className="mt-2 text-2xl font-semibold tabular-nums sm:text-3xl">
                  {count.toLocaleString()}
                </p>
                <p className="mt-0.5 font-mono text-[10px] uppercase tracking-wider text-muted">
                  {r.label}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {stats.topTheme && (
        <section>
          <h2 className="mb-4 font-mono text-xs uppercase tracking-[0.28em] text-muted">
            most-picked vibe
          </h2>
          <div className="flex items-center gap-5 rounded-2xl border border-foreground/10 bg-foreground/5 p-5">
            <div
              className={[
                "h-16 w-16 shrink-0 rounded-full ring-1 ring-foreground/15",
                THEMES[stats.topTheme.theme].gradient,
              ].join(" ")}
              aria-hidden
            />
            <div>
              <p className="text-2xl font-semibold capitalize sm:text-3xl">
                {stats.topTheme.theme}
              </p>
              <p className="text-sm text-muted">
                {stats.topTheme.count.toLocaleString()}{" "}
                {stats.topTheme.count === 1 ? "card" : "cards"} ·{" "}
                <Link
                  href={`/feed?theme=${stats.topTheme.theme}`}
                  className="underline-offset-4 hover:text-foreground hover:underline"
                >
                  see them all →
                </Link>
              </p>
            </div>
          </div>
        </section>
      )}

      {stats.topCard && (
        <section>
          <h2 className="mb-4 font-mono text-xs uppercase tracking-[0.28em] text-muted">
            most-cheered card
          </h2>
          <div className="mx-auto w-full max-w-sm">
            <FeedCard data={stats.topCard} />
          </div>
        </section>
      )}
    </main>
  );
}
