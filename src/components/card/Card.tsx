import type { ColorTheme } from "@/db/schema";
import { THEMES, type ThemeDef } from "./themes";

export type CardVariant =
  | "story"
  | "post"
  | "photocard"
  | "polaroid"
  | "magazine"
  | "receipt"
  | "notebook";

export type CardData = {
  id: string;
  nickname: string;
  title: string;
  bragPoints: string[];
  vibeCaption: string;
  emoji: string;
  colorTheme: ColorTheme;
  cheersCount: number;
};

type Props = {
  data: CardData;
  variant?: CardVariant;
  watermark?: boolean;
  className?: string;
};

export function Card({
  data,
  variant = "story",
  watermark = true,
  className,
}: Props) {
  const theme = THEMES[data.colorTheme];

  switch (variant) {
    case "photocard":
      return (
        <PhotocardLayout
          data={data}
          theme={theme}
          watermark={watermark}
          className={className}
        />
      );
    case "polaroid":
      return (
        <PolaroidLayout
          data={data}
          theme={theme}
          watermark={watermark}
          className={className}
        />
      );
    case "magazine":
      return (
        <MagazineLayout
          data={data}
          theme={theme}
          watermark={watermark}
          className={className}
        />
      );
    case "receipt":
      return (
        <ReceiptLayout
          data={data}
          theme={theme}
          watermark={watermark}
          className={className}
        />
      );
    case "notebook":
      return (
        <NotebookLayout
          data={data}
          theme={theme}
          watermark={watermark}
          className={className}
        />
      );
    default:
      return (
        <DefaultLayout
          data={data}
          theme={theme}
          variant={variant}
          watermark={watermark}
          className={className}
        />
      );
  }
}

type LayoutProps = {
  data: CardData;
  theme: ThemeDef;
  watermark: boolean;
  className?: string;
};

const DEFAULT_ASPECT: Record<"story" | "post", string> = {
  story: "aspect-[9/16] max-w-[420px]",
  post: "aspect-square max-w-[480px]",
};

function DefaultLayout({
  data,
  theme,
  variant,
  watermark,
  className,
}: LayoutProps & { variant: "story" | "post" }) {
  return (
    <article
      data-card-id={data.id}
      data-variant={variant}
      className={[
        "relative w-full overflow-hidden rounded-3xl shadow-2xl",
        theme.gradient,
        theme.text,
        DEFAULT_ASPECT[variant],
        className ?? "",
      ].join(" ")}
    >
      <div className="flex h-full flex-col px-7 py-8 sm:px-8 sm:py-10">
        <header className="flex items-center justify-between">
          <span className="font-mono text-[10px] uppercase tracking-[0.28em] opacity-80">
            BragMe
          </span>
          <span className="text-3xl leading-none" aria-hidden>
            {data.emoji}
          </span>
        </header>

        <div className="mt-6 flex-1">
          <h2 className="font-sans text-2xl font-semibold leading-[1.15] tracking-tight sm:text-3xl">
            {data.title}
          </h2>

          <ul className="mt-5 space-y-2.5">
            {data.bragPoints.map((point, i) => (
              <li
                key={i}
                className={[
                  "rounded-full px-3.5 py-2 text-sm leading-snug",
                  theme.chip,
                ].join(" ")}
              >
                {point}
              </li>
            ))}
          </ul>
        </div>

        <footer className="mt-6">
          <div className={`h-px w-full ${theme.divider}`} />
          <div className="mt-4 flex items-end justify-between gap-4">
            <div className="min-w-0 flex-1">
              <p
                className={`text-xs font-mono uppercase tracking-[0.2em] ${theme.subtext}`}
              >
                @{data.nickname}
              </p>
              <p
                className={`mt-1 line-clamp-2 text-sm italic leading-snug ${theme.subtext}`}
              >
                &ldquo;{data.vibeCaption}&rdquo;
              </p>
            </div>
            <div className="flex shrink-0 flex-col items-end">
              <span
                className={`font-mono text-[10px] uppercase tracking-[0.2em] ${theme.subtext}`}
              >
                cheers
              </span>
              <span className="font-mono text-lg font-semibold tabular-nums">
                {data.cheersCount}
              </span>
            </div>
          </div>

          {watermark && (
            <p
              className={`mt-3 text-center font-mono text-[9px] uppercase tracking-[0.3em] ${theme.subtext}`}
            >
              bragme.app
            </p>
          )}
        </footer>
      </div>
    </article>
  );
}

/**
 * K-pop-style photocard: thin white frame around the gradient. The inside
 * is the same content as the story variant but a touch tighter (3 brag
 * points max so it doesn't overflow the frame).
 */
function PhotocardLayout({ data, theme, watermark, className }: LayoutProps) {
  const points = data.bragPoints.slice(0, 3);
  return (
    <article
      data-card-id={data.id}
      data-variant="photocard"
      className={[
        "relative w-full max-w-[420px] aspect-[9/16] rounded-2xl bg-white p-3 shadow-2xl",
        className ?? "",
      ].join(" ")}
    >
      <div
        className={[
          "h-full w-full overflow-hidden rounded-xl",
          theme.gradient,
          theme.text,
        ].join(" ")}
      >
        <div className="flex h-full flex-col px-5 py-6">
          <header className="flex items-center justify-between">
            <span className="font-mono text-[10px] uppercase tracking-[0.28em] opacity-80">
              BragMe
            </span>
            <span className="text-2xl leading-none" aria-hidden>
              {data.emoji}
            </span>
          </header>
          <div className="mt-4 flex-1">
            <h2 className="font-sans text-xl font-semibold leading-[1.15] tracking-tight">
              {data.title}
            </h2>
            <ul className="mt-3 space-y-1.5">
              {points.map((point, i) => (
                <li
                  key={i}
                  className={[
                    "rounded-full px-3 py-1.5 text-xs leading-snug",
                    theme.chip,
                  ].join(" ")}
                >
                  {point}
                </li>
              ))}
            </ul>
          </div>
          <footer className="mt-4">
            <div className={`h-px w-full ${theme.divider}`} />
            <div className="mt-3">
              <p
                className={`font-mono text-[9px] uppercase tracking-[0.2em] ${theme.subtext}`}
              >
                @{data.nickname}
              </p>
              <p
                className={`mt-1 line-clamp-2 text-xs italic leading-snug ${theme.subtext}`}
              >
                &ldquo;{data.vibeCaption}&rdquo;
              </p>
            </div>
            {watermark && (
              <p
                className={`mt-2 text-center font-mono text-[8px] uppercase tracking-[0.3em] ${theme.subtext}`}
              >
                bragme.app
              </p>
            )}
          </footer>
        </div>
      </div>
    </article>
  );
}

/**
 * Vintage Polaroid: 1:1 gradient "photo" up top, white caption strip
 * below with the vibe caption + handle. Slight rotation gives it the
 * "stuck on a fridge" feel.
 */
function PolaroidLayout({ data, theme, watermark, className }: LayoutProps) {
  return (
    <article
      data-card-id={data.id}
      data-variant="polaroid"
      className={[
        "relative w-full max-w-[440px] -rotate-1 rounded-md bg-white p-3 pb-2 shadow-2xl",
        className ?? "",
      ].join(" ")}
    >
      <div
        className={[
          "aspect-square w-full overflow-hidden rounded-sm",
          theme.gradient,
          theme.text,
        ].join(" ")}
      >
        <div className="flex h-full flex-col items-center justify-center gap-3 p-6 text-center">
          <span className="text-7xl leading-none" aria-hidden>
            {data.emoji}
          </span>
          <h2 className="font-sans text-2xl font-semibold leading-[1.1] tracking-tight">
            {data.title}
          </h2>
          <span
            className={`font-mono text-[10px] uppercase tracking-[0.3em] ${theme.subtext}`}
          >
            BragMe
          </span>
        </div>
      </div>
      <div className="px-1 pt-3 pb-1 text-center">
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">
          @{data.nickname}
        </p>
        <p className="mt-1 text-sm italic leading-snug text-zinc-700">
          &ldquo;{data.vibeCaption}&rdquo;
        </p>
        {watermark && (
          <p className="mt-2 font-mono text-[8px] uppercase tracking-[0.3em] text-zinc-400">
            bragme.app
          </p>
        )}
      </div>
    </article>
  );
}

/**
 * Magazine cover: full-bleed gradient with a giant transparent emoji as
 * the "cover photo," BRAGME masthead at the top, the title rendered as
 * the cover line in big bold serif, and the vibe caption as the
 * issue tagline at the bottom.
 */
function MagazineLayout({ data, theme, watermark, className }: LayoutProps) {
  return (
    <article
      data-card-id={data.id}
      data-variant="magazine"
      className={[
        "relative w-full max-w-[420px] aspect-[9/16] overflow-hidden rounded-2xl shadow-2xl",
        theme.gradient,
        theme.text,
        className ?? "",
      ].join(" ")}
    >
      {/* Background emoji — outsized + dim, acts as cover photo */}
      <div
        className="pointer-events-none absolute inset-0 flex items-center justify-center text-[16rem] leading-none opacity-20"
        aria-hidden
      >
        {data.emoji}
      </div>

      <div className="relative flex h-full flex-col justify-between px-6 py-7">
        <header className="flex items-start justify-between">
          <span className="font-serif text-3xl font-black italic leading-none tracking-tight">
            BragMe
          </span>
          <div
            className={`text-right font-mono text-[9px] uppercase leading-tight tracking-[0.25em] ${theme.subtext}`}
          >
            <div>Issue #{data.id.slice(0, 4).toUpperCase()}</div>
            <div className="mt-0.5">{data.colorTheme}</div>
          </div>
        </header>

        <div>
          <h2 className="font-serif text-[2.75rem] font-black uppercase leading-[0.95] tracking-tight">
            {data.title}
          </h2>
          {data.bragPoints[0] && (
            <p
              className={`mt-3 max-w-[85%] text-sm font-medium leading-snug ${theme.subtext}`}
            >
              ★ {data.bragPoints[0]}
            </p>
          )}
        </div>

        <footer>
          <p className="font-serif text-base italic leading-snug">
            &ldquo;{data.vibeCaption}&rdquo;
          </p>
          <div
            className={`mt-3 flex items-end justify-between border-t border-current pt-2 opacity-80`}
          >
            <span
              className={`font-mono text-[10px] uppercase tracking-[0.25em] ${theme.subtext}`}
            >
              @{data.nickname}
            </span>
            {watermark && (
              <span
                className={`font-mono text-[9px] uppercase tracking-[0.3em] ${theme.subtext}`}
              >
                bragme.app
              </span>
            )}
          </div>
        </footer>
      </div>
    </article>
  );
}

/**
 * Vintage receipt: monospace, dashed dividers, line-itemized brag
 * points. Theme color appears only as a thin accent strip up top.
 */
function ReceiptLayout({ data, theme, watermark, className }: LayoutProps) {
  return (
    <article
      data-card-id={data.id}
      data-variant="receipt"
      className={[
        "relative w-full max-w-[360px] aspect-[9/16] overflow-hidden bg-[#f8f5ec] font-mono text-stone-900 shadow-2xl",
        className ?? "",
      ].join(" ")}
    >
      <div
        className={`flex items-center justify-center py-1.5 text-center text-[10px] font-bold tracking-[0.3em] text-white ${theme.gradient}`}
      >
        BRAGME · OFFICIAL RECEIPT
      </div>

      <div className="px-5 pb-5 pt-4 text-[11px] leading-relaxed">
        <div className="flex justify-between text-[10px] text-stone-500">
          <span>ORDER #{data.id.slice(0, 6).toUpperCase()}</span>
          <span>QTY 01</span>
        </div>

        <Dashed />

        <div className="text-base font-bold uppercase leading-tight tracking-tight">
          {data.title}
        </div>
        <div className="mt-1 italic text-stone-700">
          {data.emoji} for @{data.nickname}
        </div>

        <Dashed />

        <div className="mb-1 text-[9px] uppercase tracking-widest text-stone-500">
          Items
        </div>
        <ul className="space-y-1">
          {data.bragPoints.slice(0, 4).map((p, i) => (
            <li key={i} className="flex justify-between gap-3">
              <span className="flex-1">- {p}</span>
              <span>★</span>
            </li>
          ))}
        </ul>

        <Dashed />

        <div className="flex justify-between text-xs">
          <span>CHEERS</span>
          <span className="font-bold tabular-nums">
            {data.cheersCount}
          </span>
        </div>

        <div className="my-3 border-t-2 border-stone-800" />

        <div className="px-2 text-center text-[10px] italic leading-snug text-stone-700">
          &ldquo;{data.vibeCaption}&rdquo;
        </div>

        {watermark && (
          <div className="mt-4 text-center text-[9px] tracking-[0.3em] text-stone-500">
            BRAGME.APP · THANK U
          </div>
        )}
      </div>

      {/* Zigzag bottom edge — decorative */}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-3"
        style={{
          backgroundImage:
            "linear-gradient(45deg, #f8f5ec 25%, transparent 25%), linear-gradient(-45deg, #f8f5ec 25%, transparent 25%)",
          backgroundSize: "12px 12px",
          backgroundPosition: "0 6px, 6px 6px",
          backgroundColor: "var(--background)",
        }}
        aria-hidden
      />
    </article>
  );
}

function Dashed() {
  return <div className="my-3 border-t border-dashed border-stone-300" />;
}

/**
 * Notebook page: ruled background via repeating-linear-gradient, red
 * margin line, hole punches on the left, italic serif body so it reads
 * like a journal entry.
 */
function NotebookLayout({ data, theme, watermark, className }: LayoutProps) {
  void theme; // notebook intentionally ignores theme color (paper is paper)
  const today = new Date().toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
  return (
    <article
      data-card-id={data.id}
      data-variant="notebook"
      className={[
        "relative w-full max-w-[400px] aspect-[9/16] overflow-hidden bg-[#fefef8] text-stone-800 shadow-2xl",
        className ?? "",
      ].join(" ")}
      style={{
        backgroundImage:
          "repeating-linear-gradient(transparent 0, transparent 31px, rgba(0,0,0,0.08) 32px)",
      }}
    >
      <div className="absolute inset-y-0 left-12 w-px bg-rose-300/80" aria-hidden />

      <div
        className="absolute inset-y-0 left-3 flex w-6 flex-col items-center justify-around py-12"
        aria-hidden
      >
        {Array.from({ length: 7 }).map((_, i) => (
          <span
            key={i}
            className="h-3 w-3 rounded-full bg-stone-200/80 ring-1 ring-stone-300/60"
          />
        ))}
      </div>

      <div className="relative flex h-full flex-col py-7 pl-16 pr-6">
        <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-stone-500">
          ENTRY · {today}
        </div>

        <div className="mt-3 flex items-start gap-2">
          <h2 className="flex-1 font-serif text-2xl italic leading-tight text-stone-900">
            {data.title}
          </h2>
          <span className="text-2xl leading-none">{data.emoji}</span>
        </div>

        <ul className="mt-4 flex-1 space-y-2.5">
          {data.bragPoints.slice(0, 4).map((p, i) => (
            <li
              key={i}
              className="font-serif text-sm italic leading-relaxed text-stone-800"
            >
              ★ {p}
            </li>
          ))}
        </ul>

        <p className="border-t border-dashed border-stone-300 pt-3 font-serif text-sm italic leading-snug text-stone-700">
          &ldquo;{data.vibeCaption}&rdquo;
        </p>

        <div className="mt-3 flex items-end justify-between">
          <span className="font-serif text-base italic text-stone-700">
            — @{data.nickname}
          </span>
          {watermark && (
            <span className="font-mono text-[8px] uppercase tracking-[0.3em] text-stone-400">
              bragme.app
            </span>
          )}
        </div>
      </div>
    </article>
  );
}
