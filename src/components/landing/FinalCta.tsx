import Link from "next/link";

export function FinalCta() {
  return (
    <section className="mx-auto w-full max-w-3xl rounded-3xl border border-foreground/10 bg-foreground/5 px-6 py-12 text-center sm:py-16">
      <span className="font-mono text-xs uppercase tracking-[0.28em] text-muted">
        you&apos;re still here
      </span>
      <h2 className="mt-3 text-balance text-3xl font-semibold leading-[1.1] tracking-tight sm:text-4xl">
        Stop reading.
        <br />
        Make your card.
      </h2>
      <p className="mx-auto mt-3 max-w-md text-sm text-muted sm:text-base">
        Sixty seconds. No signup. Worst case you laugh at it and close the tab.
      </p>
      <Link
        href="#spill"
        className="mt-6 inline-flex h-12 items-center justify-center gap-2 rounded-full bg-foreground px-6 text-base font-medium text-background transition-opacity hover:opacity-90"
      >
        Take me to the form ↑
      </Link>
    </section>
  );
}
