"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function TopBar() {
  const pathname = usePathname();
  if (pathname?.startsWith("/embed")) return null;

  return (
    <header className="sticky top-0 z-30 border-b border-foreground/5 bg-background/80 backdrop-blur">
      <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-3">
        <Link
          href="/"
          className="font-mono text-sm font-semibold tracking-[0.2em] uppercase"
        >
          BragMe
        </Link>
        <nav className="flex items-center gap-1 text-sm">
          <Link
            href="/feed"
            className="rounded-full px-3 py-1.5 hover:bg-foreground/5"
          >
            Feed
          </Link>
          <Link
            href="/stats"
            className="rounded-full px-3 py-1.5 hover:bg-foreground/5"
          >
            Stats
          </Link>
          <Link
            href="/mine"
            className="rounded-full px-3 py-1.5 hover:bg-foreground/5"
          >
            Mine
          </Link>
        </nav>
      </div>
    </header>
  );
}
