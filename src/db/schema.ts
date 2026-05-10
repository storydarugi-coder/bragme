import {
  bigserial,
  boolean,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

export const COLOR_THEMES = [
  "sunset",
  "ocean",
  "forest",
  "lavender",
  "peach",
  "mono",
] as const;

export type ColorTheme = (typeof COLOR_THEMES)[number];

export const colorThemeEnum = pgEnum("color_theme", COLOR_THEMES);

export const cards = pgTable(
  "cards",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    nickname: text("nickname").notNull(),
    rawStory: text("raw_story").notNull(),
    title: text("title").notNull(),
    bragPoints: jsonb("brag_points").$type<string[]>().notNull(),
    vibeCaption: text("vibe_caption").notNull(),
    emoji: text("emoji").notNull(),
    colorTheme: colorThemeEnum("color_theme").notNull(),
    cheersCount: integer("cheers_count").notNull().default(0),
    unhingedCount: integer("unhinged_count").notNull().default(0),
    factsCount: integer("facts_count").notNull().default(0),
    feltThatCount: integer("felt_that_count").notNull().default(0),
    parentId: uuid("parent_id"),
    relationType: text("relation_type"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    isPublic: boolean("is_public").notNull().default(true),
  },
  (t) => [
    index("cards_created_at_idx").on(t.createdAt.desc()),
    index("cards_is_public_idx").on(t.isPublic),
    index("cards_parent_id_idx").on(t.parentId),
    uniqueIndex("cards_nickname_unique_idx").on(t.nickname),
    // Trending feed: ORDER BY cheers_count DESC, created_at DESC. Composite
    // index lets Postgres satisfy both the sort and the recency tiebreak
    // with a single index walk instead of a sort step over a seq scan.
    index("cards_trending_idx").on(t.cheersCount.desc(), t.createdAt.desc()),
  ],
);

export type Card = typeof cards.$inferSelect;
export type NewCard = typeof cards.$inferInsert;

// Token-bucket-style rate limit. One row per (key) — when expires_at is
// in the past, the slot is free and the next caller upserts a new TTL.
// Cleanup is intentionally lazy: rows with stale expires_at are
// overwritten on contention, and the index supports a periodic
// `DELETE WHERE expires_at < NOW()` if we ever need to reclaim space.
export const rateLimit = pgTable(
  "rate_limit",
  {
    key: text("key").primaryKey(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  },
  (t) => [index("rate_limit_expires_at_idx").on(t.expiresAt)],
);

// Reaction log. The composite UNIQUE enforces "one (card, ip_hash, kind)
// can only fire once" — replaces the old in-memory VOTED Map. Keeping
// rows forever (no TTL) gives us a permanent dedupe and a reaction log
// we can mine for analytics later.
export const reactions = pgTable(
  "reactions",
  {
    id: bigserial("id", { mode: "number" }).primaryKey(),
    cardId: uuid("card_id").notNull(),
    ipHash: text("ip_hash").notNull(),
    reaction: text("reaction").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    uniqueIndex("reactions_unique_idx").on(t.cardId, t.ipHash, t.reaction),
  ],
);

export type RateLimitRow = typeof rateLimit.$inferSelect;
export type ReactionRow = typeof reactions.$inferSelect;

// Daily counter of Anthropic API calls. One row per UTC date. Bumped by
// every successful generate / refine / translate; checked against
// AI_DAILY_CAP before kicking off a new call so a runaway / abuse
// scenario can't accidentally drain the API budget.
export const dailyAiCalls = pgTable("daily_ai_calls", {
  dateKey: text("date_key").primaryKey(),
  count: integer("count").notNull().default(0),
});

export type DailyAiCallsRow = typeof dailyAiCalls.$inferSelect;
