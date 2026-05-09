"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Props = {
  variant?: "ghost" | "solid";
};

export function SurpriseMeButton({ variant = "ghost" }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    if (loading) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/random", { cache: "no-store" });
      if (!res.ok) {
        if (res.status === 404) {
          setError("Feed is empty.");
        } else {
          setError("Couldn't pick one.");
        }
        return;
      }
      const body = (await res.json()) as { id?: string };
      if (body.id) {
        router.push(`/card/${body.id}`);
      } else {
        setError("Feed is empty.");
      }
    } catch (err) {
      console.error("[surprise]", err);
      setError("Couldn't pick one.");
    } finally {
      setLoading(false);
    }
  }

  const cls =
    variant === "solid"
      ? "bg-foreground text-background hover:opacity-90"
      : "border border-foreground/15 bg-background/60 text-foreground hover:bg-foreground/5";

  return (
    <div className="flex flex-col items-center gap-1">
      <button
        type="button"
        onClick={handleClick}
        disabled={loading}
        className={[
          "inline-flex h-10 items-center gap-2 rounded-full px-4 text-sm font-medium transition-all duration-200 disabled:opacity-60",
          loading ? "scale-95" : "hover:-translate-y-0.5",
          cls,
        ].join(" ")}
      >
        <span aria-hidden className={loading ? "animate-spin" : ""}>
          🎲
        </span>
        {loading ? "Spinning…" : "Surprise me"}
      </button>
      {error && (
        <span className="text-xs text-rose-500" role="status">
          {error}
        </span>
      )}
    </div>
  );
}
