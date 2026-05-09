import type { Metadata } from "next";
import { CardDetail } from "@/components/card/CardDetail";
import { CardClientView } from "@/components/card/CardClientView";
import { getMockCardById } from "@/lib/mock";

type RouteParams = { id: string };
type RouteSearch = { premium?: string };

export async function generateMetadata({
  params,
}: {
  params: Promise<RouteParams>;
}): Promise<Metadata> {
  const { id } = await params;
  const card = getMockCardById(id);

  if (!card) {
    return {
      title: "Brag card",
      description: "Spill your mess. We'll find your magic.",
    };
  }

  const description = card.vibeCaption;
  return {
    title: card.title,
    description,
    openGraph: {
      title: card.title,
      description,
      // /api/og?id=... lands in step 9 SEO sweep — meta tags are ready early.
      images: [{ url: `/api/og?id=${id}`, width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title: card.title,
      description,
      images: [`/api/og?id=${id}`],
    },
  };
}

export default async function CardPage({
  params,
  searchParams,
}: {
  params: Promise<RouteParams>;
  searchParams: Promise<RouteSearch>;
}) {
  const { id } = await params;
  const { premium } = await searchParams;
  const watermark = !premium;
  const premiumUrl = process.env.LEMON_PREMIUM_URL ?? null;
  const card = getMockCardById(id);

  return (
    <main className="mx-auto flex w-full flex-1 flex-col items-center px-6 py-12">
      {card ? (
        <CardDetail
          data={card}
          watermark={watermark}
          premiumUrl={premiumUrl}
        />
      ) : (
        <CardClientView
          id={id}
          watermark={watermark}
          premiumUrl={premiumUrl}
        />
      )}
    </main>
  );
}
