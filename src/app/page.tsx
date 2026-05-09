import Link from "next/link";
import { BragForm } from "@/components/BragForm";
import { HeroCardStack } from "@/components/landing/HeroCardStack";
import { TrustStrip } from "@/components/landing/TrustStrip";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { FeaturedCards } from "@/components/landing/FeaturedCards";
import { FinalCta } from "@/components/landing/FinalCta";
import { listFeed } from "@/lib/cards-store";

// Featured cards may move with new content — re-fetch on visit.
export const dynamic = "force-dynamic";

export default async function Home() {
  const { cards } = await listFeed({ sort: "trending" });
  const featured = cards.slice(0, 4);

  return (
    <main className="flex flex-1 flex-col gap-20 px-6 pb-24 pt-10 sm:gap-24 sm:pt-16">
      <section className="mx-auto flex w-full max-w-5xl flex-col items-center gap-10">
        <HeroCardStack />

        <div className="flex w-full max-w-2xl flex-col items-center gap-5 text-center">
          <span className="font-mono text-xs uppercase tracking-[0.28em] text-muted">
            beta · no login · anonymous
          </span>
          <h1 className="text-balance text-4xl font-semibold leading-[1.05] tracking-tight sm:text-6xl">
            Spill your mess.
            <br />
            We&apos;ll find your magic.
          </h1>
          <p className="max-w-xl text-pretty text-base text-muted sm:text-lg">
            Type the chaos. AI turns it into a brag card the internet wants —
            tweak the vibe, save the PNG, share it, all anonymous.
          </p>
        </div>

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
