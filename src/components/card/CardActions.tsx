"use client";

import { useState } from "react";
import { toPng } from "html-to-image";
import type { CardData, CardVariant } from "./Card";

type Props = {
  data: CardData;
  /** Selector prefix used to find the visible card node — appended with `[data-variant="..."]`. */
  targetSelector: string;
  /** Variants currently rendered in the page. CardActions emits one Download button per. */
  variants: CardVariant[];
};

const PIXEL_RATIO = 3;

const SHARE_FAILURE = "Couldn't open share. Try the download button instead.";
const DOWNLOAD_FAILURE = "Couldn't bake the PNG. Refresh and try again?";

const VARIANT_LABEL: Record<CardVariant, string> = {
  story: "9:16",
  post: "1:1",
  photocard: "Photocard",
  polaroid: "Polaroid",
  magazine: "Magazine",
  receipt: "Receipt",
  notebook: "Notebook",
};

export function CardActions({ data, targetSelector, variants }: Props) {
  const [busy, setBusy] = useState<CardVariant | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function exportPng(variant: CardVariant) {
    setBusy(variant);
    setError(null);
    try {
      const node = document.querySelector<HTMLElement>(
        `${targetSelector}[data-variant="${variant}"]`,
      );
      if (!node) throw new Error("Card node not found");

      const dataUrl = await toPng(node, {
        pixelRatio: PIXEL_RATIO,
        cacheBust: true,
        skipFonts: false,
      });

      const link = document.createElement("a");
      link.href = dataUrl;
      link.download = `bragme-${data.id}-${variant}.png`;
      link.click();
    } catch (err) {
      console.error(err);
      setError(DOWNLOAD_FAILURE);
    } finally {
      setBusy(null);
    }
  }

  async function shareLink() {
    setError(null);
    const url =
      typeof window !== "undefined"
        ? `${window.location.origin}/card/${data.id}`
        : `/card/${data.id}`;
    try {
      if (navigator.share) {
        await navigator.share({
          title: `BragMe — ${data.title}`,
          text: data.vibeCaption,
          url,
        });
      } else {
        await navigator.clipboard.writeText(url);
        setError("Link copied to clipboard");
      }
    } catch (err) {
      if ((err as Error).name === "AbortError") return;
      console.error(err);
      setError(SHARE_FAILURE);
    }
  }

  return (
    <div className="flex w-full flex-col gap-2">
      <div className="flex flex-wrap gap-2">
        {variants.map((v) => (
          <button
            key={v}
            type="button"
            onClick={() => exportPng(v)}
            disabled={busy !== null}
            className="flex-1 min-w-[140px] rounded-full border border-foreground/15 bg-foreground/5 px-4 py-2.5 text-sm font-medium hover:bg-foreground/10 disabled:opacity-50"
          >
            {busy === v ? "Baking…" : `Download ${VARIANT_LABEL[v]}`}
          </button>
        ))}
      </div>
      <button
        type="button"
        onClick={shareLink}
        className="rounded-full bg-foreground px-4 py-2.5 text-sm font-medium text-background hover:opacity-90"
      >
        Share link
      </button>
      {error && (
        <p className="text-xs text-muted text-center" role="status">
          {error}
        </p>
      )}
    </div>
  );
}
