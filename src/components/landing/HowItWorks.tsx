const STEPS = [
  {
    n: "01",
    emoji: "✍️",
    title: "Spill it",
    body: "Type the messy thoughts. Vents, wins, soft launches — anything bouncing around inside.",
  },
  {
    n: "02",
    emoji: "🪄",
    title: "AI brews your card",
    body: "Claude picks your title, your vibe, your color. Fresh in under 3 seconds.",
  },
  {
    n: "03",
    emoji: "🥂",
    title: "Share + cheer",
    body: "Download the PNG, drop the link, embed it anywhere. Watch strangers cheer.",
  },
];

export function HowItWorks() {
  return (
    <section className="mx-auto w-full max-w-5xl px-2">
      <header className="mb-10 text-center">
        <span className="font-mono text-xs uppercase tracking-[0.28em] text-muted">
          how it works
        </span>
        <h2 className="mt-2 text-balance text-2xl font-semibold tracking-tight sm:text-3xl">
          Mess in, magic out.
        </h2>
      </header>
      <ol className="grid gap-6 sm:grid-cols-3">
        {STEPS.map((step) => (
          <li
            key={step.n}
            className="flex flex-col gap-3 rounded-3xl border border-foreground/10 bg-foreground/5 p-6"
          >
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs uppercase tracking-[0.2em] text-muted">
                {step.n}
              </span>
              <span className="text-2xl" aria-hidden>
                {step.emoji}
              </span>
            </div>
            <h3 className="text-lg font-semibold tracking-tight">
              {step.title}
            </h3>
            <p className="text-sm leading-relaxed text-muted">{step.body}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
