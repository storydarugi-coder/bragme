import Link from "next/link";
import { BragForm } from "@/components/BragForm";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center px-6 py-14 sm:py-20">
      <section className="flex w-full max-w-2xl flex-col items-center gap-5 text-center">
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
      </section>

      <section className="mt-10 flex w-full justify-center sm:mt-14">
        <BragForm />
      </section>

      <p className="mt-10 text-sm text-muted">
        Or peek at what others made →{" "}
        <Link
          href="/feed"
          className="underline-offset-4 hover:text-foreground hover:underline"
        >
          the feed
        </Link>
      </p>
    </main>
  );
}
