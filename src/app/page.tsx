import Link from "next/link";
import { BragForm } from "@/components/BragForm";
import { DailyPrompt } from "@/components/landing/DailyPrompt";
import { HeroCardStack } from "@/components/landing/HeroCardStack";
import { TrustStrip } from "@/components/landing/TrustStrip";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { FeaturedCards } from "@/components/landing/FeaturedCards";
import { FinalCta } from "@/components/landing/FinalCta";
import { listFeed } from "@/lib/cards-store";
import { pickHeroVariant } from "@/lib/hero-variants";
import { pickDailyPrompt } from "@/lib/daily-prompts";

// Featured cards may move with new content — re-fetch on visit.
export const dynamic = "force-dynamic";

export default async function Home() {
  const { cards } = await listFeed({ sort: "trending" });
  const featured = cards.slice(0, 4);
  const hero = pickHeroVariant();
  const prompt = pickDailyPrompt("en");

  return (
    <main className="flex flex-1 flex-col gap-20 px-6 pb-24 pt-10 sm:gap-24 sm:pt-16">
      <section className="mx-auto flex w-full max-w-5xl flex-col items-center gap-10">
        <HeroCardStack />

        <div className="flex w-full max-w-2xl flex-col items-center gap-5 text-center">
          <span className="font-mono text-xs uppercase tracking-[0.28em] text-muted">
            {hero.tag}
          </span>
          <h1 className="text-balance text-4xl font-semibold leading-[1.05] tracking-tight sm:text-6xl">
            {hero.headline[0]}
            <br />
            {hero.headline[1]}
          </h1>
          <p className="max-w-xl text-pretty text-base text-muted sm:text-lg">
            {hero.subtitle}
          </p>
        </div>

        <DailyPrompt prompt={prompt} label="today's prompt · pick this or yours" />

        <div id="spill" className="flex w-full justify-center scroll-mt-20">
          <BragForm />
        </div>

        <TrustStrip />

        <p className="text-sm text-muted">
          Or peek at what others made →{" "}
          <Link
            href="/feed"
            className="underline-offset-4 hover:text-foreground hover:underline"
          >
            the feed
          </Link>
        </p>
      </section>

      <HowItWorks />

      <FeaturedCards cards={featured} />

      <FinalCta />
    </main>
  );
}
