"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ThemeToggle } from "./ThemeToggle";
import {
  loadUnreadCount,
  NOTIFICATION_CHANGE_EVENT,
} from "@/lib/notification-store";

export function TopBar() {
  const pathname = usePathname();
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    function update() {
      setUnread(loadUnreadCount());
    }
    update();
    window.addEventListener(NOTIFICATION_CHANGE_EVENT, update);
    return () =>
      window.removeEventListener(NOTIFICATION_CHANGE_EVENT, update);
  }, []);

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
            className="relative rounded-full px-3 py-1.5 hover:bg-foreground/5"
          >
            Mine
            {unread > 0 && (
              <span
                aria-label={`${unread} unread`}
                className="absolute right-1 top-1 inline-block h-2 w-2 rounded-full bg-rose-500"
              />
            )}
          </Link>
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}
