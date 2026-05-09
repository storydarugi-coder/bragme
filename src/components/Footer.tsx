"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function Footer() {
  const pathname = usePathname();
  if (pathname?.startsWith("/embed")) return null;

  const bmc = process.env.NEXT_PUBLIC_BMC_USERNAME;

  return (
    <footer className="mt-auto border-t border-foreground/5 px-6 py-6">
      <div className="mx-auto flex w-full max-w-5xl flex-col items-center justify-between gap-3 text-xs text-muted sm:flex-row">
        <span className="font-mono uppercase tracking-[0.2em]">
          © BragMe · main character energy only
        </span>
        <div className="flex items-center gap-4">
          <Link
            href="/feed"
            className="hover:text-foreground"
          >
            Feed
          </Link>
          {bmc && (
            <a
              href={`https://buymeacoffee.com/${bmc}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foreground"
            >
              ☕ Buy me a coffee
            </a>
          )}
        </div>
      </div>
    </footer>
  );
}
