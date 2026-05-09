import { and, desc, eq, lt, sql, type SQL } from "drizzle-orm";
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

  if (!dbConfigured()) {
    let cards = theme
      ? MOCK_CARDS.filter((c) => c.colorTheme === theme)
      : MOCK_CARDS;
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

/** Atomically increments cheers_count and returns the new value. */
export async function bumpCheers(id: string): Promise<number | null> {
  if (!dbConfigured()) return null;
  const db = getDb();
  const [row] = await db
    .update(schema.cards)
    .set({ cheersCount: sql`${schema.cards.cheersCount} + 1` })
    .where(eq(schema.cards.id, id))
    .returning({ cheersCount: schema.cards.cheersCount });
  return row?.cheersCount ?? null;
}
