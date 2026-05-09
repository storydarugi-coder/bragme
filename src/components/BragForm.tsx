"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { mockGenerate } from "@/lib/mock";
import { saveCard, saveRawStory } from "@/lib/card-storage";

const MAX_STORY = 2000;
const MIN_STORY = 30;

const LOADING_LINES = [
  "Reading your aura…",
  "Distilling the chaos…",
  "Polishing the receipts…",
  "Asking the universe for your color…",
  "Cooking up your main character moment…",
  "Untangling the lore…",
  "Finding your delulu range…",
  "Translating chaos into a vibe…",
  "Auditing your soft launch…",
  "Calling your shot for you…",
  "Reading between your group-chat lines…",
  "Bottling the main character energy…",
  "Picking the receipts that go on the card…",
  "Choosing your color before you do…",
];

const PLACEHOLDER =
  "vented to your group chat for 2 hours? loved your last presentation? hate your boss? cried at a Pixar trailer? type whatever's bouncing around inside.";

const NETWORK_ERROR = "Hmm, our AI is shy right now. Try again?";

function pickLoadingLine(prev?: string): string {
  if (LOADING_LINES.length === 1) return LOADING_LINES[0];
  let next = prev;
  while (!next || next === prev) {
    next = LOADING_LINES[Math.floor(Math.random() * LOADING_LINES.length)];
  }
  return next;
}

export function BragForm() {
  const router = useRouter();
  const [story, setStory] = useState("");
  const [generating, setGenerating] = useState(false);
  const [loadingLine, setLoadingLine] = useState(LOADING_LINES[0]);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(
    () => () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    },
    [],
  );

  function validate(): string | null {
    const raw = story.trim();
    if (raw.length < MIN_STORY)
      return `Tell us a bit more — at least ${MIN_STORY} characters.`;
    if (raw.length > MAX_STORY)
      return `Whoa, that's too much — keep it under ${MAX_STORY} characters.`;
    return null;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const v = validate();
    if (v) {
      setError(v);
      return;
    }

    setGenerating(true);
    setLoadingLine(pickLoadingLine());
    intervalRef.current = setInterval(() => {
      setLoadingLine((prev) => pickLoadingLine(prev));
    }, 1100);

    try {
      const trimmed = story.trim();
      const card = await callGenerate(trimmed);
      saveCard(card);
      saveRawStory(card.id, trimmed);
      router.push(`/card/${card.id}`);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : NETWORK_ERROR);
      setGenerating(false);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
  }

  if (generating) {
    return <GeneratingView line={loadingLine} />;
  }

  const charCount = story.length;
  const overLimit = charCount > MAX_STORY;

  return (
    <form
      onSubmit={handleSubmit}
      className="flex w-full max-w-2xl flex-col gap-4"
      noValidate
    >
      <label className="flex flex-col gap-1.5">
        <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted">
          Spill it
        </span>
        <textarea
          value={story}
          onChange={(e) => setStory(e.target.value)}
          rows={8}
          placeholder={PLACEHOLDER}
          className="w-full resize-y rounded-2xl border border-foreground/15 bg-background px-4 py-3 text-base leading-relaxed outline-none placeholder:text-muted/60 focus:border-foreground/40"
        />
        <div className="flex items-center justify-between text-xs text-muted">
          <span>
            {overLimit ? (
              <span className="text-rose-500">over the limit</span>
            ) : (
              <>min {MIN_STORY} chars · keep it real · 100% anonymous</>
            )}
          </span>
          <span
            className={`font-mono tabular-nums ${overLimit ? "text-rose-500" : ""}`}
          >
            {charCount} / {MAX_STORY}
          </span>
        </div>
      </label>

      <button
        type="submit"
        className="mt-2 inline-flex h-12 items-center justify-center gap-2 rounded-full bg-foreground px-6 text-base font-medium text-background transition-opacity hover:opacity-90"
      >
        Generate my brag card →
      </button>

      <p className="text-center text-xs text-muted">
        We&apos;ll mint you a one-time anonymous handle (like{" "}
        <span className="font-mono">quiet_kettle_42</span>) — no signup, no
        email, no real names.
      </p>

      {error && (
        <p
          role="alert"
          className="text-center text-sm text-rose-500"
        >
          {error}
        </p>
      )}
    </form>
  );
}

type ApiResponse =
  | { card: import("./card/Card").CardData }
  | { error: { code: string; message: string } };

async function callGenerate(
  rawStory: string,
): Promise<import("./card/Card").CardData> {
  const res = await fetch("/api/generate", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ raw_story: rawStory }),
  });

  if (res.status === 503) {
    const body = (await res.json().catch(() => null)) as ApiResponse | null;
    if (body && "error" in body && body.error.code === "AI_NOT_CONFIGURED") {
      console.info("[bragme] AI key not configured — using local mock generator");
      await new Promise((r) => setTimeout(r, 1000));
      return mockGenerate({ rawStory });
    }
  }

  const body = (await res.json().catch(() => null)) as ApiResponse | null;
  if (!res.ok || !body || "error" in body) {
    const msg = body && "error" in body ? body.error.message : NETWORK_ERROR;
    throw new Error(msg);
  }
  return body.card;
}

function GeneratingView({ line }: { line: string }) {
  return (
    <div className="flex w-full max-w-2xl flex-col items-center gap-7">
      <div className="aspect-[9/16] w-[280px] overflow-hidden rounded-3xl bg-gradient-to-br from-foreground/5 via-foreground/10 to-foreground/5 shadow-xl">
        <div className="flex h-full animate-pulse flex-col justify-between p-6">
          <div className="flex items-center justify-between">
            <div className="h-2.5 w-14 rounded-full bg-foreground/20" />
            <div className="h-8 w-8 rounded-full bg-foreground/20" />
          </div>
          <div className="flex flex-col gap-4">
            <div className="space-y-2">
              <div className="h-5 w-5/6 rounded-md bg-foreground/25" />
              <div className="h-5 w-2/3 rounded-md bg-foreground/25" />
            </div>
            <div className="space-y-1.5">
              <div className="h-6 w-full rounded-full bg-foreground/15" />
              <div className="h-6 w-5/6 rounded-full bg-foreground/15" />
              <div className="h-6 w-2/3 rounded-full bg-foreground/15" />
            </div>
          </div>
          <div className="space-y-1.5">
            <div className="h-2 w-1/3 rounded-full bg-foreground/15" />
            <div className="h-3 w-3/5 rounded-full bg-foreground/15" />
          </div>
        </div>
      </div>
      <div className="flex flex-col items-center gap-1.5 text-center">
        <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-muted">
          brewing your card
        </p>
        <p
          className="text-base text-foreground sm:text-lg"
          aria-live="polite"
        >
          {line}
        </p>
      </div>
    </div>
  );
}
