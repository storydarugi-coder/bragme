"use client";

import { Card } from "@/components/card/Card";
import { MOCK_CARDS } from "@/lib/mock";

// Three deliberately diverse themes for visual contrast. We pull from
// MOCK_CARDS (always available) so the hero renders even before any DB
// or AI is wired up.
const PICK_IDS = ["mock-2", "mock-4", "mock-1"];

export function HeroCardStack() {
  const [left, center, right] = PICK_IDS.map(
    (id) => MOCK_CARDS.find((c) => c.id === id) ?? MOCK_CARDS[0],
  );

  return (
    <div
      className="relative mx-auto h-[280px] w-[280px] sm:h-[340px] sm:w-[460px]"
      aria-hidden
    >
      <div className="hero-float-left absolute left-0 top-6 w-[150px] sm:left-2 sm:w-[180px]">
        <Card data={left} variant="story" watermark={false} />
      </div>
      <div className="hero-float-right absolute right-0 top-6 w-[150px] sm:right-2 sm:w-[180px]">
        <Card data={right} variant="story" watermark={false} />
      </div>
      <div className="hero-float-center absolute inset-x-0 z-10 mx-auto w-[170px] sm:w-[210px]">
        <Card data={center} variant="story" watermark={false} />
      </div>
    </div>
  );
}
