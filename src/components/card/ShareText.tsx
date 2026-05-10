"use client";

import { useMemo, useState } from "react";
import type { CardData } from "./Card";
import { bumpShareCount } from "@/lib/share-tracking";

type Props = {
  data: CardData;
};

function getOrigin(): string {
  if (typeof window !== "undefined") return window.location.origin;
  return process.env.NEXT_PUBLIC_SITE_URL ?? "https://bragme.app";
}

function buildShareText(data: CardData, origin: string): string {
  return [
    `${data.emoji} ${data.title}`,
    `“${data.vibeCaption}”`,
    `${origin}/card/${data.id}`,
  ].join("\n");
}

function buildEmbedHtml(data: CardData, origin: string): string {
  return `<iframe src="${origin}/embed/${data.id}" width="360" height="640" style="border:0;border-radius:24px" loading="lazy" title="BragMe card"></iframe>`;
}

export function ShareText({ data }: Props) {
  const origin = useMemo(() => getOrigin(), []);
  const text = useMemo(() => buildShareText(data, origin), [data, origin]);
  const embed = useMemo(() => buildEmbedHtml(data, origin), [data, origin]);

  return (
    <div className="space-y-3 rounded-2xl border border-foreground/10 bg-foreground/5 p-4">
      <Snippet label="Share text" body={text} />
      <Snippet label="Embed" body={embed} />
    </div>
  );
}

function Snippet({ label, body }: { label: string; body: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(body);
      setCopied(true);
      bumpShareCount();
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard is best-effort; fail silently if denied.
    }
  }

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted">
          {label}
        </span>
        <button
          type="button"
          onClick={copy}
          className="rounded-full bg-foreground px-3 py-1 text-xs font-medium text-background transition-opacity hover:opacity-90"
        >
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>
      <pre className="overflow-x-auto whitespace-pre-wrap break-words font-mono text-xs leading-relaxed text-muted">
        {body}
      </pre>
    </div>
  );
}
