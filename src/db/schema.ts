import {
  boolean,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
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
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    isPublic: boolean("is_public").notNull().default(true),
  },
  (t) => [
    index("cards_created_at_idx").on(t.createdAt.desc()),
    index("cards_is_public_idx").on(t.isPublic),
  ],
);

export type Card = typeof cards.$inferSelect;
export type NewCard = typeof cards.$inferInsert;
