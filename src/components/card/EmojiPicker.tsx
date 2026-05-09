"use client";

const EMOJI_POOL = [
  "✨", "🌙", "🔥", "💫", "🪄", "🌈", "🦋", "🍯",
  "🥂", "🌟", "⚡", "🌊", "🌿", "🍑", "🖤", "💖",
  "🎀", "🪩", "🌸", "🍀", "🌺", "🌻", "🐚", "🌼",
  "☕", "🍓", "🪐", "🎧", "📓", "🎭", "🍵", "🧸",
];

type Props = {
  value: string;
  onChange: (emoji: string) => void;
};

export function EmojiPicker({ value, onChange }: Props) {
  return (
    <div className="flex flex-col gap-2">
      <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted">
        Emoji
      </span>
      <div className="grid grid-cols-8 gap-1.5 sm:grid-cols-16">
        {EMOJI_POOL.map((e) => {
          const active = value === e;
          return (
            <button
              key={e}
              type="button"
              onClick={() => onChange(e)}
              aria-label={`Use ${e}`}
              aria-pressed={active}
              className={[
                "flex h-9 w-9 items-center justify-center rounded-lg text-xl transition",
                active
                  ? "bg-foreground/15 ring-1 ring-foreground/40"
                  : "hover:bg-foreground/5",
              ].join(" ")}
            >
              {e}
            </button>
          );
        })}
      </div>
    </div>
  );
}
