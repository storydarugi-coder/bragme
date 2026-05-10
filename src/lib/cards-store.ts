import { and, desc, eq, ilike, lt, or, sql, type SQL } from "drizzle-orm";
import { getDb, schema } from "@/db/client";
import type { CardData } from "@/components/card/Card";
import type { ColorTheme } from "@/db/schema";
import { MOCK_CARDS, getMockCardById } from "@/lib/mock";

/**
 * Single source of truth for card reads/writes. Falls back to MOCK_CARDS
 * when DATABASE_URL is unset, so the app stays browsable in dev without
 * Supabase configured. When DB is wired, all pages and API routes go
 * through these helpers — no direct Drizzle calls scattered around.
 */

export const FEED_PAGE_SIZE = 20;

export function dbConfigured(): boolean {
  return Boolean(process.env.DATABASE_URL);
}

type CardRow = typeof schema.cards.$inferSelect;

function toCardData(row: CardRow): CardData {
  return {
    id: row.id,
    nickname: row.nickname,
    title: row.title,
    bragPoints: row.bragPoints,
    vibeCaption: row.vibeCaption,
    emoji: row.emoji,
    colorTheme: row.colorTheme,
    cheersCount: row.cheersCount,
    unhingedCount: row.unhingedCount,
    factsCount: row.factsCount,
    feltThatCount: row.feltThatCount,
  };
}

export type FeedPage = {
  cards: CardData[];
  nextCursor: string | null;
};

export type FeedSort = "latest" | "trending";

export type ListFeedOpts = {
  cursor?: string | null;
  sort?: FeedSort;
  theme?: ColorTheme | null;
  q?: string | null;
};

export async function getCardById(id: string): Promise<CardData | null> {
  if (!dbConfigured()) {
    return getMockCardById(id) ?? null;
  }
  const db = getDb();
  const rows = await db
    .select()
    .from(schema.cards)
    .where(eq(schema.cards.id, id))
    .limit(1);
  const row = rows[0];
  return row ? toCardData(row) : null;
}

export type GlobalStats = {
  totalCards: number;
  totalReactions: {
    cheer: number;
    unhinged: number;
    facts: number;
    feltThat: number;
  };
  topTheme: { theme: ColorTheme; count: number } | null;
  topCard: CardData | null;
};

export async function getGlobalStats(): Promise<GlobalStats> {
  if (!dbConfigured()) {
    const totals = MOCK_CARDS.reduce(
      (acc, c) => ({
        cheer: acc.cheer + c.cheersCount,
        unhinged: acc.unhinged + c.unhingedCount,
        facts: acc.facts + c.factsCount,
        feltThat: acc.feltThat + c.feltThatCount,
      }),
      { cheer: 0, unhinged: 0, facts: 0, feltThat: 0 },
    );
    const themeCounts = MOCK_CARDS.reduce<Record<string, number>>(
      (acc, c) => {
        acc[c.colorTheme] = (acc[c.colorTheme] ?? 0) + 1;
        return acc;
      },
      {},
    );
    const topThemeEntry = Object.entries(themeCounts).sort(
      (a, b) => b[1] - a[1],
    )[0];
    const topCard = [...MOCK_CARDS].sort(
      (a, b) => b.cheersCount - a.cheersCount,
    )[0];
    return {
      totalCards: MOCK_CARDS.length,
      totalReactions: totals,
      topTheme: topThemeEntry
        ? {
            theme: topThemeEntry[0] as ColorTheme,
            count: topThemeEntry[1],
          }
        : null,
      topCard: topCard ?? null,
    };
  }

  const db = getDb();

  const [agg] = await db
    .select({
      totalCards: sql<number>`count(*)::int`,
      totalCheer: sql<number>`coalesce(sum(${schema.cards.cheersCount}), 0)::int`,
      totalUnhinged: sql<number>`coalesce(sum(${schema.cards.unhingedCount}), 0)::int`,
      totalFacts: sql<number>`coalesce(sum(${schema.cards.factsCount}), 0)::int`,
      totalFeltThat: sql<number>`coalesce(sum(${schema.cards.feltThatCount}), 0)::int`,
    })
    .from(schema.cards)
    .where(eq(schema.cards.isPublic, true));

  const themeRows = await db
    .select({
      theme: schema.cards.colorTheme,
      count: sql<number>`count(*)::int`,
    })
    .from(schema.cards)
    .where(eq(schema.cards.isPublic, true))
    .groupBy(schema.cards.colorTheme)
    .orderBy(desc(sql`count(*)`))
    .limit(1);

  const [topRow] = await db
    .select()
    .from(schema.cards)
    .where(eq(schema.cards.isPublic, true))
    .orderBy(desc(schema.cards.cheersCount))
    .limit(1);

  return {
    totalCards: agg?.totalCards ?? 0,
    totalReactions: {
      cheer: agg?.totalCheer ?? 0,
      unhinged: agg?.totalUnhinged ?? 0,
      facts: agg?.totalFacts ?? 0,
      feltThat: agg?.totalFeltThat ?? 0,
    },
    topTheme: themeRows[0]
      ? { theme: themeRows[0].theme, count: themeRows[0].count }
      : null,
    topCard: topRow ? toCardData(topRow) : null,
  };
}

/**
 * Pick a random public card id. Used by /api/random / "Surprise me".
 * Mock mode picks from MOCK_CARDS; DB mode uses ORDER BY random()
 * which is fine at our scale — bigger tables would want TABLESAMPLE
 * or a stored procedure that picks an offset.
 */
export async function pickRandomCardId(): Promise<string | null> {
  if (!dbConfigured()) {
    if (MOCK_CARDS.length === 0) return null;
    return MOCK_CARDS[Math.floor(Math.random() * MOCK_CARDS.length)].id;
  }
  const db = getDb();
  const rows = await db
    .select({ id: schema.cards.id })
    .from(schema.cards)
    .where(eq(schema.cards.isPublic, true))
    .orderBy(sql`random()`)
    .limit(1);
  return rows[0]?.id ?? null;
}

/**
 * Server-only — fetches the original raw_story behind a card so the
 * refine flow can regenerate without the client having to send it. Used
 * as a fallback when the client doesn't have the story in sessionStorage
 * (e.g. they navigated to a card from /feed).
 */
export async function getRawStoryById(id: string): Promise<string | null> {
  if (!dbConfigured()) return null;
  const db = getDb();
  const rows = await db
    .select({ rawStory: schema.cards.rawStory })
    .from(schema.cards)
    .where(eq(schema.cards.id, id))
    .limit(1);
  return rows[0]?.rawStory ?? null;
}

export async function listFeed(opts: ListFeedOpts = {}): Promise<FeedPage> {
  const sort = opts.sort ?? "latest";
  const cursor = opts.cursor ?? null;
  const theme = opts.theme ?? null;
  const q = opts.q?.trim() || null;

  if (!dbConfigured()) {
    let cards = theme
      ? MOCK_CARDS.filter((c) => c.colorTheme === theme)
      : MOCK_CARDS;
    if (q) {
      const needle = q.toLowerCase();
      cards = cards.filter(
        (c) =>
          c.title.toLowerCase().includes(needle) ||
          c.vibeCaption.toLowerCase().includes(needle) ||
          c.bragPoints.some((p) => p.toLowerCase().includes(needle)),
      );
    }
    if (sort === "trending") {
      cards = [...cards].sort((a, b) => b.cheersCount - a.cheersCount);
    }
    return { cards, nextCursor: null };
  }

  const db = getDb();
  const conditions: SQL[] = [eq(schema.cards.isPublic, true)];
  if (theme) {
    conditions.push(eq(schema.cards.colorTheme, theme));
  }
  if (q) {
    // Title + vibe_caption are plain text columns. brag_points is jsonb; we
    // cast it to text and ILIKE that as a cheap full-string match. Good
    // enough at our scale — proper full-text search (tsvector) is a
    // post-MVP optimization.
    const needle = `%${q}%`;
    const search = or(
      ilike(schema.cards.title, needle),
      ilike(schema.cards.vibeCaption, needle),
      sql`${schema.cards.bragPoints}::text ILIKE ${needle}`,
    );
    if (search) conditions.push(search);
  }

  if (sort === "trending") {
    // Top by cheers, recency tiebreak. v1 returns one page; cursor
    // pagination on a moving target (cheers can change) is messy and
    // can wait until we have enough data to need it.
    const rows = await db
      .select()
      .from(schema.cards)
      .where(and(...conditions))
      .orderBy(desc(schema.cards.cheersCount), desc(schema.cards.createdAt))
      .limit(FEED_PAGE_SIZE);
    return { cards: rows.map(toCardData), nextCursor: null };
  }

  // sort === "latest" with cursor pagination
  if (cursor) {
    const cursorDate = new Date(cursor);
    if (!Number.isNaN(cursorDate.getTime())) {
      conditions.push(lt(schema.cards.createdAt, cursorDate));
    }
  }

  // Fetch one extra to detect "has more" without a separate COUNT.
  const rows = await db
    .select()
    .from(schema.cards)
    .where(and(...conditions))
    .orderBy(desc(schema.cards.createdAt))
    .limit(FEED_PAGE_SIZE + 1);

  const hasMore = rows.length > FEED_PAGE_SIZE;
  const visible = hasMore ? rows.slice(0, FEED_PAGE_SIZE) : rows;
  const nextCursor =
    hasMore && visible.length > 0
      ? visible[visible.length - 1].createdAt.toISOString()
      : null;

  return { cards: visible.map(toCardData), nextCursor };
}

export type InsertCardInput = {
  nickname: string;
  rawStory: string;
  title: string;
  bragPoints: string[];
  vibeCaption: string;
  emoji: string;
  colorTheme: ColorTheme;
};

export async function insertCard(
  input: InsertCardInput,
): Promise<CardData | null> {
  if (!dbConfigured()) return null;
  const db = getDb();
  const [row] = await db.insert(schema.cards).values(input).returning();
  return row ? toCardData(row) : null;
}

import type { Reaction } from "@/components/card/Card";

/**
 * Atomically increments the column for the given reaction. Returns the
 * new count, or null if DB isn't configured (mock mode — caller should
 * fall back to optimistic local state).
 */
export async function bumpReaction(
  id: string,
  reaction: Reaction,
): Promise<number | null> {
  if (!dbConfigured()) return null;
  const db = getDb();

  switch (reaction) {
    case "cheer": {
      const [row] = await db
        .update(schema.cards)
        .set({ cheersCount: sql`${schema.cards.cheersCount} + 1` })
        .where(eq(schema.cards.id, id))
        .returning({ count: schema.cards.cheersCount });
      return row?.count ?? null;
    }
    case "unhinged": {
      const [row] = await db
        .update(schema.cards)
        .set({ unhingedCount: sql`${schema.cards.unhingedCount} + 1` })
        .where(eq(schema.cards.id, id))
        .returning({ count: schema.cards.unhingedCount });
      return row?.count ?? null;
    }
    case "facts": {
      const [row] = await db
        .update(schema.cards)
        .set({ factsCount: sql`${schema.cards.factsCount} + 1` })
        .where(eq(schema.cards.id, id))
        .returning({ count: schema.cards.factsCount });
      return row?.count ?? null;
    }
    case "felt-that": {
      const [row] = await db
        .update(schema.cards)
        .set({ feltThatCount: sql`${schema.cards.feltThatCount} + 1` })
        .where(eq(schema.cards.id, id))
        .returning({ count: schema.cards.feltThatCount });
      return row?.count ?? null;
    }
  }
}
