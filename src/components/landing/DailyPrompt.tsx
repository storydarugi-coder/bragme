type Props = {
  prompt: string;
  label: string;
};

export function DailyPrompt({ prompt, label }: Props) {
  return (
    <div className="flex flex-col items-center gap-1.5 text-center">
      <span className="font-mono text-[10px] uppercase tracking-[0.28em] text-muted">
        {label}
      </span>
      <p className="max-w-md text-pretty font-serif text-base italic leading-snug text-foreground/85 sm:text-lg">
        &ldquo;{prompt}&rdquo;
      </p>
    </div>
  );
}
