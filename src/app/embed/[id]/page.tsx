import { notFound } from "next/navigation";
import Link from "next/link";
import { Card } from "@/components/card/Card";
import { getCardById } from "@/lib/cards-store";

type Params = { id: string };

// No noindex header — embeds are intentionally referenceable, but the
// content is the same as /card/[id] so we don't want duplicate indexing.
// `robots` metadata signals this without harming embed behavior.
export const metadata = {
  robots: { index: false, follow: false },
  title: "Embed",
};

export default async function EmbedPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { id } = await params;
  const card = await getCardById(id);
  if (!card) notFound();

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-3 bg-background p-4">
      <Card data={card} variant="story" watermark={true} />
      <Link
        href={`/card/${id}`}
        target="_top"
        className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted hover:text-foreground"
      >
        made with bragme
      </Link>
    </main>
  );
}
