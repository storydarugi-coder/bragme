"use client";

import type { ColorTheme } from "@/db/schema";
import { COLOR_THEMES } from "@/db/schema";
import { THEMES } from "./themes";

type Props = {
  value: ColorTheme;
  onChange: (theme: ColorTheme) => void;
};

export function ThemePicker({ value, onChange }: Props) {
  return (
    <div className="flex flex-col gap-2">
      <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted">
        Theme
      </span>
      <div className="flex gap-2">
        {COLOR_THEMES.map((t) => {
          const active = value === t;
          return (
            <button
              key={t}
              type="button"
              onClick={() => onChange(t)}
              aria-label={`Use ${THEMES[t].label} theme`}
              aria-pressed={active}
              title={THEMES[t].label}
              className={[
                "h-10 w-10 rounded-full transition-transform",
                THEMES[t].gradient,
                active
                  ? "ring-2 ring-foreground ring-offset-2 ring-offset-background"
                  : "ring-1 ring-foreground/15 hover:scale-105",
              ].join(" ")}
            />
          );
        })}
      </div>
    </div>
  );
}
