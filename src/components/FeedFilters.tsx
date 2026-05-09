import Link from "next/link";
import type { FeedSort } from "@/lib/cards-store";
import { COLOR_THEMES, type ColorTheme } from "@/db/schema";
import { SurpriseMeButton } from "./SurpriseMeButton";
import { THEMES } from "./card/themes";

type Props = {
  sort: FeedSort;
  theme: ColorTheme | null;
};

function buildHref(sort: FeedSort, theme: ColorTheme | null): string {
  const params = new URLSearchParams();
  if (sort === "trending") params.set("sort", "trending");
  if (theme) params.set("theme", theme);
  const qs = params.toString();
  return qs ? `/feed?${qs}` : "/feed";
}

const SORT_TABS: Array<{ value: FeedSort; label: string }> = [
  { value: "latest", label: "Latest" },
  { value: "trending", label: "🔥 Trending" },
];

export function FeedFilters({ sort, theme }: Props) {
  return (
    <div className="mb-8 flex flex-wrap items-center gap-3">
      <nav
        aria-label="Feed sort"
        className="inline-flex rounded-full border border-foreground/10 bg-background/60 p-1"
      >
        {SORT_TABS.map((t) => {
          const isActive = sort === t.value;
          return (
            <Link
              key={t.value}
              href={buildHref(t.value, theme)}
              aria-current={isActive ? "page" : undefined}
              className={[
                "rounded-full px-4 py-1.5 text-sm font-medium transition",
                isActive
                  ? "bg-foreground text-background"
                  : "text-muted hover:text-foreground",
              ].join(" ")}
            >
              {t.label}
            </Link>
          );
        })}
      </nav>

      <div className="hidden h-6 w-px bg-foreground/10 sm:block" />

      <SurpriseMeButton />

      <div className="hidden h-6 w-px bg-foreground/10 sm:block" />

      <nav aria-label="Theme filter" className="flex flex-wrap items-center gap-1.5">
        <Link
          href={buildHref(sort, null)}
          aria-current={theme === null ? "page" : undefined}
          className={[
            "rounded-full px-3 py-1.5 text-xs font-medium transition",
            theme === null
              ? "bg-foreground/10 text-foreground"
              : "text-muted hover:text-foreground",
          ].join(" ")}
        >
          All vibes
        </Link>
        {COLOR_THEMES.map((t) => {
          const isActive = theme === t;
          return (
            <Link
              key={t}
              href={buildHref(sort, t)}
              aria-label={`${THEMES[t].label} only`}
              aria-current={isActive ? "page" : undefined}
              title={THEMES[t].label}
              className={[
                "h-7 w-7 rounded-full transition-transform",
                THEMES[t].gradient,
                isActive
                  ? "ring-2 ring-foreground ring-offset-2 ring-offset-background"
                  : "ring-1 ring-foreground/15 hover:scale-110",
              ].join(" ")}
            />
          );
        })}
      </nav>
    </div>
  );
}
