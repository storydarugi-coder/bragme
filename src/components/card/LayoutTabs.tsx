"use client";

export type LayoutMode =
  | "default"
  | "photocard"
  | "polaroid"
  | "magazine"
  | "receipt"
  | "notebook";

type Props = {
  value: LayoutMode;
  onChange: (mode: LayoutMode) => void;
};

const TABS: Array<{ value: LayoutMode; label: string; sub: string }> = [
  { value: "default", label: "Default", sub: "9:16 + 1:1" },
  { value: "photocard", label: "📸 Photocard", sub: "K-pop frame" },
  { value: "polaroid", label: "🖼️ Polaroid", sub: "vintage square" },
  { value: "magazine", label: "📰 Magazine", sub: "cover story" },
  { value: "receipt", label: "🧾 Receipt", sub: "itemized" },
  { value: "notebook", label: "📓 Notebook", sub: "journal page" },
];

export function LayoutTabs({ value, onChange }: Props) {
  return (
    <nav
      aria-label="Card layout"
      className="flex flex-wrap justify-center gap-1.5 rounded-2xl border border-foreground/10 bg-background/60 p-1.5"
    >
      {TABS.map((t) => {
        const active = value === t.value;
        return (
          <button
            key={t.value}
            type="button"
            onClick={() => onChange(t.value)}
            aria-pressed={active}
            className={[
              "flex flex-col items-start rounded-xl px-3 py-1.5 text-left transition",
              active
                ? "bg-foreground text-background"
                : "text-muted hover:bg-foreground/5 hover:text-foreground",
            ].join(" ")}
          >
            <span className="text-sm font-medium leading-tight">{t.label}</span>
            <span
              className={[
                "text-[10px] font-mono uppercase tracking-wider leading-tight",
                active ? "opacity-70" : "",
              ].join(" ")}
            >
              {t.sub}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
