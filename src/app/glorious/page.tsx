import Link from "next/link";
import { BragFormKo } from "@/components/glorious/BragFormKo";
import { GloriousNav } from "@/components/glorious/GloriousNav";
import { DailyPrompt } from "@/components/landing/DailyPrompt";
import { HeroCardStack } from "@/components/landing/HeroCardStack";
import { FeedCard } from "@/components/FeedCard";
import { listFeed } from "@/lib/cards-store";
import { pickDailyPrompt } from "@/lib/daily-prompts";

export const metadata = {
  title: "BragMe · 한국어 미리보기",
  description: "한국어 사용자를 위한 BragMe 미리보기 페이지.",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

const TRUST_ITEMS = [
  { icon: "🚫", label: "가입 없음" },
  { icon: "🤐", label: "100% 익명" },
  { icon: "🆓", label: "평생 무료" },
  { icon: "✨", label: "AI 제작" },
];

const STEPS = [
  {
    n: "01",
    emoji: "✍️",
    title: "쏟아내라",
    body: "메시한 생각, 푸념, 자랑, 소프트 런칭 — 머릿속에 굴러다니는 거 아무거나 입력하세요.",
  },
  {
    n: "02",
    emoji: "🪄",
    title: "AI가 카드를 만든다",
    body: "Claude가 제목, 바이브, 색상, 이모지를 골라줍니다. 3초 이내.",
  },
  {
    n: "03",
    emoji: "🥂",
    title: "공유 + 응원",
    body: "PNG 다운로드, 링크 공유, 어디든 임베드. 낯선 사람들의 응원이 굴러옵니다.",
  },
];

export default async function GloriousHome() {
  const { cards } = await listFeed({ sort: "trending" });
  const featured = cards.slice(0, 4);
  const prompt = pickDailyPrompt("ko");

  return (
    <main className="flex flex-1 flex-col gap-20 px-6 pb-24 pt-10 sm:gap-24 sm:pt-16">
      <GloriousNav />

      <section className="mx-auto flex w-full max-w-5xl flex-col items-center gap-10">
        <HeroCardStack />

        <div className="flex w-full max-w-2xl flex-col items-center gap-5 text-center">
          <span className="font-mono text-xs uppercase tracking-[0.28em] text-muted">
            베타 · 가입 없음 · 익명
          </span>
          <h1 className="text-balance text-4xl font-semibold leading-[1.05] tracking-tight sm:text-6xl">
            당신의 혼란을 쏟아내세요.
            <br />
            마법은 우리가 찾을게요.
          </h1>
          <p className="max-w-xl text-pretty text-base text-muted sm:text-lg">
            혼돈을 적어주세요. AI가 인터넷이 좋아할 브래그 카드로 만들어
            드립니다 — 바이브 다듬기, PNG 저장, 공유까지 전부 익명.
          </p>
        </div>

        <DailyPrompt prompt={prompt} label="오늘의 주제 · 이거 써도 되고 너의 거 써도 됨" />

        <div id="spill" className="flex w-full justify-center scroll-mt-20">
          <BragFormKo />
        </div>

        <ul className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-muted">
          {TRUST_ITEMS.map((item) => (
            <li key={item.label} className="flex items-center gap-1.5">
              <span aria-hidden>{item.icon}</span>
              <span>{item.label}</span>
            </li>
          ))}
        </ul>

        <p className="text-sm text-muted">
          다른 사람 카드 구경하기 →{" "}
          <Link
            href="/feed"
            className="underline-offset-4 hover:text-foreground hover:underline"
          >
            피드 (영어)
          </Link>
        </p>
      </section>

      <section className="mx-auto w-full max-w-5xl px-2">
        <header className="mb-10 text-center">
          <span className="font-mono text-xs uppercase tracking-[0.28em] text-muted">
            작동 방식
          </span>
          <h2 className="mt-2 text-balance text-2xl font-semibold tracking-tight sm:text-3xl">
            혼란 입력 → 마법 출력.
          </h2>
        </header>
        <ol className="grid gap-6 sm:grid-cols-3">
          {STEPS.map((step) => (
            <li
              key={step.n}
              className="flex flex-col gap-3 rounded-3xl border border-foreground/10 bg-foreground/5 p-6"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs uppercase tracking-[0.2em] text-muted">
                  {step.n}
                </span>
                <span className="text-2xl" aria-hidden>
                  {step.emoji}
                </span>
              </div>
              <h3 className="text-lg font-semibold tracking-tight">
                {step.title}
              </h3>
              <p className="text-sm leading-relaxed text-muted">{step.body}</p>
            </li>
          ))}
        </ol>
      </section>

      {featured.length > 0 && (
        <section className="mx-auto w-full max-w-7xl">
          <header className="mb-8 flex flex-wrap items-end justify-between gap-3">
            <div>
              <span className="font-mono text-xs uppercase tracking-[0.28em] text-muted">
                낯선 사람들의 자랑
              </span>
              <h2 className="mt-2 text-balance text-2xl font-semibold tracking-tight sm:text-3xl">
                지금 주인공 중인 사람들.
              </h2>
              <p className="mt-1 text-xs text-muted">
                ※ 카드 자체는 작성자가 입력한 언어 그대로 표시돼요 (대부분
                영어).
              </p>
            </div>
            <Link
              href="/feed"
              className="font-mono text-xs uppercase tracking-[0.2em] text-muted underline-offset-4 hover:text-foreground hover:underline"
            >
              전체 피드 →
            </Link>
          </header>
          <div className="columns-1 gap-6 sm:columns-2 lg:columns-4">
            {featured.map((c) => (
              <FeedCard key={c.id} data={c} />
            ))}
          </div>
        </section>
      )}

      <section className="mx-auto w-full max-w-3xl rounded-3xl border border-foreground/10 bg-foreground/5 px-6 py-12 text-center sm:py-16">
        <span className="font-mono text-xs uppercase tracking-[0.28em] text-muted">
          아직 여기 있네요
        </span>
        <h2 className="mt-3 text-balance text-3xl font-semibold leading-[1.1] tracking-tight sm:text-4xl">
          그만 읽고
          <br />
          카드를 만들어요.
        </h2>
        <p className="mx-auto mt-3 max-w-md text-sm text-muted sm:text-base">
          60초면 됩니다. 가입 없음. 최악의 경우 웃고 탭 닫으면 끝.
        </p>
        <Link
          href="#spill"
          className="mt-6 inline-flex h-12 items-center justify-center gap-2 rounded-full bg-foreground px-6 text-base font-medium text-background transition-opacity hover:opacity-90"
        >
          폼으로 데려다줘 ↑
        </Link>
      </section>
    </main>
  );
}
