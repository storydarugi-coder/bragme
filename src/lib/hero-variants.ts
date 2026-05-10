export type HeroVariant = {
  tag: string;
  headline: [string, string];
  subtitle: string;
};

export const HERO_VARIANTS: HeroVariant[] = [
  {
    tag: "beta · no login · anonymous",
    headline: ["Spill your mess.", "We'll find your magic."],
    subtitle:
      "Type the chaos. AI turns it into a brag card the internet wants — tweak the vibe, save the PNG, share it, all anonymous.",
  },
  {
    tag: "you contain multitudes",
    headline: ["Receipts in,", "main character out."],
    subtitle:
      "Drop the messy thoughts; AI finds the headline. Refine, translate, share — no signup, no real names, no losing the link.",
  },
  {
    tag: "60-second glow-up",
    headline: ["Tell me everything.", "Get a glow-up."],
    subtitle:
      "Forty seconds of typing, ten seconds of AI, one beautiful brag card. Anonymous by default, downloadable as PNG, embeddable anywhere.",
  },
  {
    tag: "soft launch yourself",
    headline: ["You're the plot twist.", "Let's print the receipt."],
    subtitle:
      "Vent, brag, spiral, soft-launch. AI distills it into a sharable card with your color, your handle, your one-liner — all auto-anon.",
  },
];

/** Pick a random hero variant. Called server-side per request, so each
 * page hit potentially sees a different headline. SEO-wise the home
 * page is already force-dynamic (it fetches the featured feed), so
 * indexers will see whichever variant landed at crawl time. */
export function pickHeroVariant(): HeroVariant {
  return HERO_VARIANTS[Math.floor(Math.random() * HERO_VARIANTS.length)];
}
