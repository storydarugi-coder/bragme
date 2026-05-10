import type { ColorTheme } from "@/db/schema";
import { THEMES, type ThemeDef } from "./themes";

export type CardVariant =
  | "story"
  | "post"
  | "photocard"
  | "polaroid"
  | "magazine"
  | "receipt"
  | "notebook"
  | "trading"
  | "stamp"
  | "manga"
  | "scrapbook"
  | "businesscard"
  | "reportcard"
  | "movieposter"
  | "resume"
  | "ticket";

export type CardData = {
  id: string;
  nickname: string;
  title: string;
  bragPoints: string[];
  vibeCaption: string;
  emoji: string;
  colorTheme: ColorTheme;
  cheersCount: number;
  unhingedCount: number;
  factsCount: number;
  feltThatCount: number;
};

export type Reaction = "cheer" | "unhinged" | "facts" | "felt-that";

export const REACTIONS: Readonly<
  Array<{ id: Reaction; emoji: string; label: string; field: keyof CardData }>
> = [
  { id: "cheer", emoji: "🥂", label: "cheer", field: "cheersCount" },
  { id: "unhinged", emoji: "🔥", label: "unhinged", field: "unhingedCount" },
  { id: "facts", emoji: "💯", label: "facts", field: "factsCount" },
  { id: "felt-that", emoji: "🥲", label: "felt that", field: "feltThatCount" },
] as const;

export function isReaction(value: unknown): value is Reaction {
  return REACTIONS.some((r) => r.id === value);
}

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
    case "trading":
      return (
        <TradingLayout
          data={data}
          theme={theme}
          watermark={watermark}
          className={className}
        />
      );
    case "stamp":
      return (
        <StampLayout
          data={data}
          theme={theme}
          watermark={watermark}
          className={className}
        />
      );
    case "manga":
      return (
        <MangaLayout
          data={data}
          theme={theme}
          watermark={watermark}
          className={className}
        />
      );
    case "scrapbook":
      return (
        <ScrapbookLayout
          data={data}
          theme={theme}
          watermark={watermark}
          className={className}
        />
      );
    case "businesscard":
      return (
        <BusinessCardLayout
          data={data}
          theme={theme}
          watermark={watermark}
          className={className}
        />
      );
    case "reportcard":
      return (
        <ReportCardLayout
          data={data}
          theme={theme}
          watermark={watermark}
          className={className}
        />
      );
    case "movieposter":
      return (
        <MoviePosterLayout
          data={data}
          theme={theme}
          watermark={watermark}
          className={className}
        />
      );
    case "resume":
      return (
        <ResumeLayout
          data={data}
          theme={theme}
          watermark={watermark}
          className={className}
        />
      );
    case "ticket":
      return (
        <TicketLayout
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
          <span
            className="text-3xl leading-none transition-transform duration-500 group-hover:scale-125 group-hover:-rotate-12"
            aria-hidden
          >
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

/**
 * Trading card / TCG style: gold-leaf outer frame, gradient inner with
 * the emoji as the "creature artwork," brag points as moves with the
 * theme as the "type." Aspect 5:7 to feel like a real card.
 */
function TradingLayout({ data, theme, watermark, className }: LayoutProps) {
  const moves = data.bragPoints.slice(0, 3);
  return (
    <article
      data-card-id={data.id}
      data-variant="trading"
      className={[
        "relative w-full max-w-[400px] aspect-[5/7] overflow-hidden rounded-2xl p-2.5 shadow-2xl",
        "bg-[linear-gradient(135deg,#fef3c7_0%,#fde68a_50%,#fbbf24_100%)]",
        className ?? "",
      ].join(" ")}
    >
      <div
        className={[
          "flex h-full w-full flex-col overflow-hidden rounded-xl",
          theme.gradient,
          theme.text,
        ].join(" ")}
      >
        <header className="flex items-start justify-between px-4 pt-4">
          <h2 className="font-serif text-lg font-bold leading-tight tracking-tight">
            {data.title}
          </h2>
          <div className="flex flex-col items-end leading-none">
            <span
              className={`font-mono text-[9px] uppercase tracking-[0.2em] ${theme.subtext}`}
            >
              cheers
            </span>
            <span className="font-mono text-2xl font-bold tabular-nums">
              {data.cheersCount}
            </span>
          </div>
        </header>

        <div className="relative mx-3 mt-2 flex aspect-square items-center justify-center overflow-hidden rounded-lg border-2 border-white/30 bg-white/15">
          <span
            className="text-[7rem] leading-none drop-shadow-[0_4px_8px_rgba(0,0,0,0.25)]"
            aria-hidden
          >
            {data.emoji}
          </span>
        </div>

        <div
          className={`mx-4 mt-2 flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.2em] ${theme.subtext}`}
        >
          <span>@{data.nickname}</span>
          <span>{data.colorTheme} type</span>
        </div>

        <ul className="mx-4 mt-2 flex-1 space-y-0">
          {moves.map((p, i) => (
            <li
              key={i}
              className={`flex items-start gap-2 border-b ${theme.divider} py-1.5 text-[11px] leading-snug last:border-b-0`}
            >
              <span className="mt-0.5">★</span>
              <span className="flex-1 font-medium">{p}</span>
            </li>
          ))}
        </ul>

        <footer className="mx-4 mb-3 mt-1 border-t-2 border-current border-opacity-40 pt-2">
          <p
            className={`text-[10px] italic leading-snug ${theme.subtext}`}
          >
            &ldquo;{data.vibeCaption}&rdquo;
          </p>
          {watermark && (
            <p
              className={`mt-1 text-center font-mono text-[8px] uppercase tracking-[0.3em] ${theme.subtext}`}
            >
              ★ BRAGME · NO.{data.id.slice(0, 3).toUpperCase()} ★
            </p>
          )}
        </footer>
      </div>
    </article>
  );
}

/**
 * Vintage postage stamp: cream paper with a double-line border, theme
 * gradient as the stamp art rectangle, emoji as the artwork, title as
 * the legend, cheers as the "denomination."
 */
function StampLayout({ data, theme, watermark, className }: LayoutProps) {
  return (
    <article
      data-card-id={data.id}
      data-variant="stamp"
      className={[
        "relative w-full max-w-[380px] aspect-[7/9] overflow-hidden bg-[#f4eed8] p-3 shadow-2xl",
        className ?? "",
      ].join(" ")}
    >
      <div className="flex h-full w-full flex-col border-[3px] border-double border-stone-700 p-3">
        <div className="text-center font-mono text-[10px] font-bold uppercase tracking-[0.4em] text-stone-700">
          BragMe · Postage
        </div>
        <div className="text-center font-mono text-[8px] uppercase tracking-[0.25em] text-stone-500">
          {new Date().getFullYear()} · {data.colorTheme}
        </div>

        <div
          className={[
            "my-3 flex flex-1 items-center justify-center rounded-sm",
            theme.gradient,
          ].join(" ")}
        >
          <span
            className="text-[6rem] leading-none drop-shadow-[0_3px_6px_rgba(0,0,0,0.25)]"
            aria-hidden
          >
            {data.emoji}
          </span>
        </div>

        <div className="text-center">
          <h2 className="px-2 font-serif text-sm font-bold uppercase leading-tight tracking-tight text-stone-800">
            {data.title}
          </h2>
          <p className="mt-1 line-clamp-2 px-2 text-[9px] italic leading-snug text-stone-600">
            &ldquo;{data.vibeCaption}&rdquo;
          </p>
        </div>

        <div className="mt-2 flex items-end justify-between font-mono text-[8px] uppercase tracking-[0.2em] text-stone-500">
          <span>@{data.nickname}</span>
          <span className="font-bold">★ {data.cheersCount}¢</span>
        </div>

        {watermark && (
          <div className="mt-1 text-center font-mono text-[7px] uppercase tracking-[0.3em] text-stone-400">
            BRAGME.APP
          </div>
        )}
      </div>
    </article>
  );
}

/**
 * Manga panel: black-and-white aesthetic regardless of theme. Three
 * stacked panels separated by 4px black gaps — top has the emoji with
 * SFX text, middle has the title in heavy serif, bottom has brag points
 * as caption text and the handle + caption signature.
 */
function MangaLayout({ data, theme, watermark, className }: LayoutProps) {
  void theme; // manga deliberately ignores theme color
  const captions = data.bragPoints.slice(0, 4);
  return (
    <article
      data-card-id={data.id}
      data-variant="manga"
      className={[
        "relative w-full max-w-[400px] aspect-[9/16] overflow-hidden bg-black p-1 shadow-2xl",
        className ?? "",
      ].join(" ")}
    >
      <div className="grid h-full grid-rows-[5fr_3fr_5fr] gap-1">
        <div className="relative flex items-center justify-center overflow-hidden bg-white">
          <span className="text-[8rem] leading-none">{data.emoji}</span>
          <span
            className="absolute right-3 top-3 font-serif text-3xl font-black italic uppercase text-black"
            style={{
              transform: "rotate(-10deg)",
              WebkitTextStroke: "1.5px black",
              textShadow: "3px 3px 0 #fff",
            }}
            aria-hidden
          >
            BAM!
          </span>
          <span
            className="absolute bottom-3 left-3 font-serif text-base font-black italic uppercase text-black"
            style={{
              transform: "rotate(3deg)",
              WebkitTextStroke: "1px black",
            }}
            aria-hidden
          >
            ★ZOOM★
          </span>
        </div>

        <div className="flex items-center justify-center bg-white px-3 py-2">
          <h2 className="text-balance text-center font-serif text-2xl font-black uppercase leading-[0.95] tracking-tight text-black">
            &ldquo;{data.title}&rdquo;
          </h2>
        </div>

        <div className="flex flex-col bg-white p-3">
          <ul className="flex-1 space-y-1.5">
            {captions.map((p, i) => (
              <li
                key={i}
                className="border-l-[3px] border-black pl-2 font-serif text-[13px] italic leading-snug text-black"
              >
                {p}
              </li>
            ))}
          </ul>
          <div className="mt-2 flex items-end justify-between border-t border-black pt-1.5">
            <div className="min-w-0 flex-1">
              <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-black/70">
                @{data.nickname}
              </p>
              <p className="mt-0.5 line-clamp-1 font-serif text-xs italic text-black">
                — {data.vibeCaption}
              </p>
            </div>
            {watermark && (
              <p className="ml-2 shrink-0 font-mono text-[8px] uppercase tracking-[0.3em] text-black/50">
                BRAGME MANGA
              </p>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}

/**
 * Scrapbook page: cream paper + decorative washi-tape strips, the
 * emoji rendered as the centerpiece "photo" inside a slightly
 * tilted Polaroid-style frame, brag points on yellow sticky-notes
 * with alternating tilts, vibe caption in handwritten serif italic
 * at the bottom.
 */
function ScrapbookLayout({ data, theme, watermark, className }: LayoutProps) {
  const stickies = data.bragPoints.slice(0, 3);
  return (
    <article
      data-card-id={data.id}
      data-variant="scrapbook"
      className={[
        "relative w-full max-w-[400px] aspect-[9/16] overflow-hidden bg-[#fdf8e8] p-5 text-stone-900 shadow-2xl",
        className ?? "",
      ].join(" ")}
    >
      <div
        className="absolute -top-1 left-12 h-5 w-24 -rotate-6 bg-rose-300/70 shadow-sm"
        aria-hidden
      />
      <div
        className="absolute right-6 top-3 h-5 w-16 rotate-[8deg] bg-amber-300/70 shadow-sm"
        aria-hidden
      />

      <div className="relative mx-auto mt-6 w-[68%] -rotate-2 bg-white p-2 shadow-md">
        <div
          className={[
            "flex aspect-square items-center justify-center",
            theme.gradient,
          ].join(" ")}
        >
          <span className="text-7xl leading-none drop-shadow-[0_4px_8px_rgba(0,0,0,0.2)]">
            {data.emoji}
          </span>
        </div>
        <p className="pt-1 text-center font-serif text-[10px] italic text-stone-700">
          @{data.nickname}
        </p>
      </div>

      <ul className="mt-4 space-y-2">
        {stickies.map((p, i) => (
          <li
            key={i}
            className={[
              "bg-yellow-100/85 px-2.5 py-1.5 font-serif text-xs italic leading-tight text-stone-800 shadow-sm",
              i % 2 === 0 ? "rotate-[-1deg]" : "rotate-[1deg]",
            ].join(" ")}
          >
            ✏️ {p}
          </li>
        ))}
      </ul>

      <div className="absolute inset-x-0 bottom-3 px-5 text-center">
        <p className="font-serif text-[10px] italic text-stone-600">
          &ldquo;{data.vibeCaption}&rdquo;
        </p>
        <h2 className="mt-1 font-serif text-base font-bold leading-tight italic text-stone-900">
          {data.title}
        </h2>
        {watermark && (
          <p className="mt-1 font-mono text-[8px] uppercase tracking-[0.3em] text-stone-400">
            — bragme journal
          </p>
        )}
      </div>
    </article>
  );
}

/**
 * Business card: 16:9 horizontal — the only landscape variant. Theme
 * accent stripe on the left, name/title (= title), role (= vibe
 * caption) and skills (= brag points) on the left, emoji as a circular
 * "logo" on the right.
 */
function BusinessCardLayout({ data, theme, watermark, className }: LayoutProps) {
  const skills = data.bragPoints.slice(0, 3);
  return (
    <article
      data-card-id={data.id}
      data-variant="businesscard"
      className={[
        "relative w-full max-w-[480px] aspect-[16/9] overflow-hidden rounded-md bg-white text-stone-900 shadow-2xl",
        className ?? "",
      ].join(" ")}
    >
      <div
        className={`absolute inset-y-0 left-0 w-2 ${theme.gradient}`}
        aria-hidden
      />

      <div className="flex h-full gap-3 py-4 pl-5 pr-4">
        <div className="flex min-w-0 flex-1 flex-col">
          <h2 className="font-serif text-lg font-bold leading-tight tracking-tight">
            {data.title}
          </h2>
          <p className="line-clamp-2 text-xs italic leading-snug text-stone-600">
            {data.vibeCaption}
          </p>

          <ul className="mt-2 flex-1 space-y-0.5">
            {skills.map((p, i) => (
              <li
                key={i}
                className="line-clamp-1 text-[10px] leading-tight text-stone-700"
              >
                → {p}
              </li>
            ))}
          </ul>

          <div className="mt-auto flex items-end justify-between border-t border-stone-300 pt-2">
            <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-stone-500">
              @{data.nickname}
            </span>
            {watermark && (
              <span className="font-mono text-[8px] uppercase tracking-[0.3em] text-stone-400">
                BRAGME.APP
              </span>
            )}
          </div>
        </div>

        <div className="flex shrink-0 items-center justify-center">
          <div
            className={[
              "flex h-16 w-16 items-center justify-center rounded-full",
              theme.gradient,
            ].join(" ")}
          >
            <span className="text-3xl leading-none">{data.emoji}</span>
          </div>
        </div>
      </div>
    </article>
  );
}

/**
 * School report card: cream paper, double-line border, "BragMe Academy"
 * letterhead, brag points listed as subjects with A+ grades, vibe
 * caption as the teacher's comment. Theme color appears as a small
 * "major" stamp.
 */
function ReportCardLayout({ data, theme, watermark, className }: LayoutProps) {
  const subjects = data.bragPoints.slice(0, 4);
  return (
    <article
      data-card-id={data.id}
      data-variant="reportcard"
      className={[
        "relative w-full max-w-[380px] aspect-[9/16] overflow-hidden bg-[#fafaf3] text-stone-900 shadow-2xl",
        className ?? "",
      ].join(" ")}
    >
      <div className="m-3 flex h-[calc(100%-1.5rem)] flex-col border-2 border-stone-800">
        <div className="border-b-2 border-stone-800 p-3 text-center">
          <h2 className="font-serif text-lg font-bold uppercase tracking-tight">
            BragMe Academy
          </h2>
          <p className="font-serif text-[10px] italic text-stone-600">
            Annual Report Card · {new Date().getFullYear()}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2 border-b-2 border-stone-800 p-3 text-xs">
          <div>
            <span className="font-mono text-[9px] uppercase tracking-wider text-stone-500">
              Student
            </span>
            <p className="font-serif font-bold leading-tight">
              @{data.nickname}
            </p>
          </div>
          <div>
            <span className="font-mono text-[9px] uppercase tracking-wider text-stone-500">
              Major
            </span>
            <p
              className={[
                "inline-block rounded px-1.5 py-0.5 font-serif text-[11px] font-bold capitalize leading-tight text-white",
                theme.gradient,
              ].join(" ")}
            >
              {data.colorTheme} {data.emoji}
            </p>
          </div>
        </div>

        <div className="flex flex-1 flex-col p-3">
          <span className="mb-2 font-mono text-[9px] uppercase tracking-wider text-stone-500">
            Subjects
          </span>
          <ul className="flex-1 space-y-1.5">
            {subjects.map((p, i) => (
              <li
                key={i}
                className="flex justify-between gap-2 border-b border-dashed border-stone-300 pb-1"
              >
                <span className="line-clamp-2 flex-1 font-serif text-[11px] italic leading-tight">
                  {p}
                </span>
                <span className="font-mono text-sm font-bold text-emerald-700">
                  A+
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="border-t-2 border-stone-800 p-3">
          <span className="font-mono text-[9px] uppercase tracking-wider text-stone-500">
            Distinction
          </span>
          <p className="line-clamp-2 font-serif text-xs font-bold uppercase leading-tight tracking-tight">
            ★ {data.title} ★
          </p>
          <span className="mt-2 block font-mono text-[9px] uppercase tracking-wider text-stone-500">
            Teacher&apos;s Comment
          </span>
          <p className="mt-0.5 line-clamp-2 font-serif text-[11px] italic leading-snug text-stone-700">
            &ldquo;{data.vibeCaption}&rdquo;
          </p>
          <div className="mt-2 flex items-end justify-between">
            <p className="font-serif text-[11px] italic text-stone-600">
              — Headmaster
            </p>
            {watermark && (
              <span className="font-mono text-[8px] uppercase tracking-[0.3em] text-stone-400">
                BRAGME.APP
              </span>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}

/**
 * Movie poster: full-bleed gradient with the emoji as a giant centerpiece,
 * title rendered as the big movie title at the bottom in heavy uppercase
 * serif, vibe caption as the tagline, brag points as a "STARRING" credit
 * roll above the title.
 */
function MoviePosterLayout({ data, theme, watermark, className }: LayoutProps) {
  const cast = data.bragPoints.slice(0, 3);
  return (
    <article
      data-card-id={data.id}
      data-variant="movieposter"
      className={[
        "relative w-full max-w-[400px] aspect-[2/3] overflow-hidden rounded-md shadow-2xl",
        theme.gradient,
        theme.text,
        className ?? "",
      ].join(" ")}
    >
      <div
        className="pointer-events-none absolute inset-0 flex items-center justify-center text-[20rem] leading-none opacity-25"
        aria-hidden
      >
        {data.emoji}
      </div>

      <div className="relative flex h-full flex-col justify-between px-6 py-7">
        <div
          className={`flex items-center justify-between font-mono text-[9px] uppercase tracking-[0.3em] ${theme.subtext}`}
        >
          <span>★ ★ ★ ★ ★</span>
          <span>RATED MC</span>
        </div>

        <div>
          <p
            className={`mb-2 font-mono text-[10px] uppercase tracking-[0.25em] ${theme.subtext}`}
          >
            ★ Starring ★
          </p>
          <ul className="mb-4 space-y-0.5">
            {cast.map((c, i) => (
              <li
                key={i}
                className="font-serif text-xs italic leading-snug uppercase tracking-wide line-clamp-1"
              >
                · {c}
              </li>
            ))}
          </ul>

          <p className="mb-2 font-serif text-sm italic leading-snug">
            &ldquo;{data.vibeCaption}&rdquo;
          </p>
          <h2 className="font-serif text-[2.5rem] font-black uppercase leading-[0.9] tracking-tight">
            {data.title}
          </h2>

          <div
            className={`mt-3 flex items-end justify-between border-t border-current pt-2 opacity-80`}
          >
            <span
              className={`font-mono text-[10px] uppercase tracking-[0.25em] ${theme.subtext}`}
            >
              @{data.nickname} productions
            </span>
            {watermark && (
              <span
                className={`font-mono text-[9px] uppercase tracking-[0.3em] ${theme.subtext}`}
              >
                bragme films
              </span>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}

/**
 * One-page résumé: clean monospace, theme color appears only as an
 * accent rule. Title becomes the candidate's "name," vibe caption their
 * "objective," brag points each grouped under a fake "Experience" section
 * with the theme as the company.
 */
function ResumeLayout({ data, theme, watermark, className }: LayoutProps) {
  const exp = data.bragPoints.slice(0, 4);
  return (
    <article
      data-card-id={data.id}
      data-variant="resume"
      className={[
        "relative w-full max-w-[380px] aspect-[9/16] overflow-hidden bg-white p-6 font-mono text-stone-900 shadow-2xl",
        className ?? "",
      ].join(" ")}
    >
      <header className="border-b border-stone-300 pb-3">
        <h2 className="font-serif text-xl font-bold uppercase leading-tight tracking-tight">
          {data.title}
        </h2>
        <p className="mt-1 text-[10px] uppercase tracking-[0.25em] text-stone-500">
          @{data.nickname} · {data.colorTheme} dept.
        </p>
      </header>

      <section className="mt-3">
        <h3 className="text-[9px] uppercase tracking-[0.25em] text-stone-500">
          Objective
        </h3>
        <p className="mt-1 font-serif text-[11px] italic leading-snug text-stone-800">
          &ldquo;{data.vibeCaption}&rdquo;
        </p>
      </section>

      <section className="mt-3">
        <h3 className="text-[9px] uppercase tracking-[0.25em] text-stone-500">
          Experience
        </h3>
        <ul className="mt-1 space-y-2">
          {exp.map((p, i) => (
            <li key={i} className="text-[10px] leading-tight">
              <div className="flex items-baseline justify-between gap-2">
                <span className="text-[11px] font-bold uppercase">
                  Role {String(exp.length - i).padStart(2, "0")}
                </span>
                <span className="text-stone-500">
                  {2025 - i}–{2026 - i}
                </span>
              </div>
              <p className="mt-0.5 font-serif italic text-stone-800">
                · {p}
              </p>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-3 border-t border-stone-300 pt-2">
        <h3 className="text-[9px] uppercase tracking-[0.25em] text-stone-500">
          Specialty
        </h3>
        <div
          className={[
            "mt-1 inline-flex items-center gap-1.5 rounded px-2 py-0.5 text-[11px] font-bold capitalize text-white",
            theme.gradient,
          ].join(" ")}
        >
          <span>{data.emoji}</span>
          <span>{data.colorTheme} energy</span>
        </div>
      </section>

      {watermark && (
        <p className="absolute inset-x-0 bottom-3 text-center text-[8px] uppercase tracking-[0.3em] text-stone-400">
          References available · bragme.app
        </p>
      )}
    </article>
  );
}

/**
 * Concert ticket: 5:2 horizontal, a perforation-style dashed gap separates
 * the main ticket from the stub. Theme gradient anchors the stub on the
 * right; main ticket is cream paper. Title is the headline, brag points
 * are the lineup, vibe caption is the tagline.
 */
function TicketLayout({ data, theme, watermark, className }: LayoutProps) {
  const lineup = data.bragPoints.slice(0, 3);
  return (
    <article
      data-card-id={data.id}
      data-variant="ticket"
      className={[
        "relative w-full max-w-[520px] aspect-[5/2] overflow-hidden rounded-md font-mono text-stone-900 shadow-2xl",
        className ?? "",
      ].join(" ")}
    >
      <div className="flex h-full">
        <div className="flex flex-1 flex-col justify-between bg-[#fdf8e8] p-4">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-stone-700">
              ★ Admit One ★
            </span>
            <span className="text-[9px] uppercase tracking-[0.25em] text-stone-500">
              No.{data.id.slice(0, 6).toUpperCase()}
            </span>
          </div>

          <div>
            <h2 className="font-serif text-xl font-black uppercase leading-tight tracking-tight">
              {data.title}
            </h2>
            <p className="mt-1 text-[10px] italic text-stone-700 line-clamp-1">
              &ldquo;{data.vibeCaption}&rdquo;
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3 text-[9px] uppercase tracking-wider">
            <div>
              <span className="text-stone-500">Lineup</span>
              <ul className="mt-0.5 space-y-0">
                {lineup.map((p, i) => (
                  <li
                    key={i}
                    className="line-clamp-1 normal-case text-[10px] font-serif italic text-stone-800"
                  >
                    · {p}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <span className="text-stone-500">Venue</span>
              <p className="mt-0.5 normal-case text-[10px] capitalize text-stone-800">
                @{data.nickname}
              </p>
              <span className="mt-1 block text-stone-500">Section</span>
              <p className="mt-0.5 normal-case text-[10px] capitalize text-stone-800">
                {data.colorTheme}
              </p>
            </div>
            <div>
              <span className="text-stone-500">Date</span>
              <p className="mt-0.5 normal-case text-[10px] text-stone-800">
                {new Date().toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </p>
            </div>
          </div>
        </div>

        <div
          className="flex shrink-0 flex-col items-center justify-center gap-2 border-l-2 border-dashed border-stone-700 p-3"
          style={{ width: "30%" }}
        >
          <div
            className={[
              "flex h-16 w-16 items-center justify-center rounded-full",
              theme.gradient,
            ].join(" ")}
          >
            <span className="text-3xl leading-none">{data.emoji}</span>
          </div>
          <p className="text-center text-[9px] uppercase tracking-[0.25em] text-stone-700">
            ★ Stub ★
          </p>
          <p className="text-center text-[8px] uppercase tracking-[0.2em] text-stone-500">
            @{data.nickname}
          </p>
          {watermark && (
            <p className="text-[7px] uppercase tracking-[0.3em] text-stone-400">
              bragme presents
            </p>
          )}
        </div>
      </div>
    </article>
  );
}

