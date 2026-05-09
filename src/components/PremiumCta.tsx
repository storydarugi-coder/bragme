type Props = {
  cardId: string;
  alreadyPremium: boolean;
  premiumUrl: string | null;
};

export function PremiumCta({ cardId, alreadyPremium, premiumUrl }: Props) {
  if (alreadyPremium) {
    return (
      <div className="flex items-center justify-center gap-2 rounded-2xl border border-amber-300/30 bg-amber-100/30 px-4 py-3 text-sm dark:bg-amber-300/10">
        <span aria-hidden>✨</span>
        <span>Premium card unlocked — watermark off, hi-res ready.</span>
      </div>
    );
  }

  if (!premiumUrl) {
    return (
      <div className="rounded-2xl border border-foreground/10 bg-foreground/5 px-4 py-3 text-center text-sm text-muted">
        Premium card{" "}
        <span className="font-mono text-xs">$3</span> — coming soon. Set
        <code className="mx-1 rounded bg-foreground/10 px-1 py-0.5 font-mono text-xs">
          LEMON_PREMIUM_URL
        </code>
        to enable.
      </div>
    );
  }

  // Pass card id through to Lemon so the webhook can mark the right card
  // premium when payment lands. `redirect_url` brings the user back to this
  // page with `?premium=<token>` once checkout completes.
  const params = new URLSearchParams({
    "checkout[custom][card_id]": cardId,
    redirect_url: `https://bragme.app/card/${cardId}?premium=ok`,
  });
  const href = `${premiumUrl}${premiumUrl.includes("?") ? "&" : "?"}${params}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center justify-center gap-2 rounded-2xl bg-amber-400 px-5 py-3 text-sm font-semibold text-amber-950 shadow-sm transition-transform hover:-translate-y-0.5"
    >
      <span aria-hidden>✨</span>
      <span>Get premium card · $3</span>
      <span className="text-xs font-normal opacity-70">no watermark · hi-res</span>
    </a>
  );
}
