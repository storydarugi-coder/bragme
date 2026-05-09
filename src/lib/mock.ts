import type { CardData } from "@/components/card/Card";
import type { ColorTheme } from "@/db/schema";
import { COLOR_THEMES } from "@/db/schema";
import { generateHandle } from "./handle";

export const MOCK_CARDS: CardData[] = [
  {
    id: "mock-1",
    nickname: "quiet_kettle_42",
    title: "Quietly Carrying The Whole Crew",
    bragPoints: [
      "Group chat therapist with receipts",
      "Remembers everyone's coffee order",
      "Wrote a 40-page fic nobody asked for",
      "Boundaries: finally a thing she has",
    ],
    vibeCaption: "Soft launch energy with a hardcover plot.",
    emoji: "📓",
    colorTheme: "sunset",
    cheersCount: 142,
  },
  {
    id: "mock-2",
    nickname: "brisk_harbor_881",
    title: "Built Like A Plot Twist In Act Two",
    bragPoints: [
      "Three jobs, one nervous system, zero L's",
      "Speaks fluent sarcasm and Excel",
      "Made the gym girlies a playlist",
      "Cried at a Pixar movie last week",
    ],
    vibeCaption: "Burnout tried, the lore won.",
    emoji: "🌊",
    colorTheme: "ocean",
    cheersCount: 318,
  },
  {
    id: "mock-3",
    nickname: "fresh_fern_07",
    title: "Local Forest Sprite Reporting In",
    bragPoints: [
      "Names every plant on her balcony",
      "Codes better with a candle lit",
      "Will explain mushrooms to anyone",
      "Soft heart, scary good at chess",
    ],
    vibeCaption: "Cottagecore with a side of cron jobs.",
    emoji: "🌿",
    colorTheme: "forest",
    cheersCount: 87,
  },
  {
    id: "mock-4",
    nickname: "cosmic_oracle_19",
    title: "Delulu Is Indeed The Solulu",
    bragPoints: [
      "Manifested a job and got it",
      "Reads tarot for the group chat",
      "Makes any outfit look intentional",
      "Texts back, but on her terms",
    ],
    vibeCaption: "Main character syndrome, clinically diagnosed.",
    emoji: "🔮",
    colorTheme: "lavender",
    cheersCount: 521,
  },
  {
    id: "mock-5",
    nickname: "sweet_peach_322",
    title: "Soft On The Outside, Spreadsheet Inside",
    bragPoints: [
      "Bakes when stressed, ships when calm",
      "Knows every K-drama trope by heart",
      "Cancelled brunch to read instead",
      "Makes eye contact like a champion",
    ],
    vibeCaption: "Sweet enough to mean it, sharp enough to bite.",
    emoji: "🍑",
    colorTheme: "peach",
    cheersCount: 64,
  },
  {
    id: "mock-6",
    nickname: "lone_quartz_56",
    title: "Whispers Loud, Logs Off Loud",
    bragPoints: [
      "Owns four black hoodies, regrets none",
      "Can fix the printer with a stare",
      "Rates restaurants by the lighting",
      "Therapy on Tuesdays, thrives on Wednesdays",
    ],
    vibeCaption: "Minimalist fits, maximalist receipts.",
    emoji: "🖤",
    colorTheme: "mono",
    cheersCount: 209,
  },
  {
    id: "mock-7",
    nickname: "golden_donut_91",
    title: "Built A Whole Lore From One Bad Date",
    bragPoints: [
      "Turns the chaos into a TED talk",
      "Saves the gif for the right moment",
      "Friend group's official vibe checker",
      "Falls asleep mid-podcast, wakes up smarter",
    ],
    vibeCaption: "Ate the spiral and called it research.",
    emoji: "🍯",
    colorTheme: "sunset",
    cheersCount: 96,
  },
  {
    id: "mock-8",
    nickname: "calm_atlas_77",
    title: "The Calm In Other People's Group Chats",
    bragPoints: [
      "Mediates fights with one voice memo",
      "Has playlists for every mood you have",
      "Never been late, refuses to start now",
      "Sends 'thinking of you' texts unprompted",
    ],
    vibeCaption: "Lighthouse vibes in a coastal hoodie.",
    emoji: "⚓",
    colorTheme: "ocean",
    cheersCount: 153,
  },
];

export function getMockCardById(id: string): CardData | undefined {
  return MOCK_CARDS.find((c) => c.id === id);
}

const THEME_BY_KEYWORD: Array<{ test: RegExp; theme: ColorTheme }> = [
  { test: /\b(sad|tired|burnt? ?out|cry|messy|lost)\b/i, theme: "sunset" },
  { test: /\b(work|hustle|grind|career|study|coding)\b/i, theme: "ocean" },
  { test: /\b(quiet|nature|plant|soft|calm|cottage)\b/i, theme: "forest" },
  { test: /\b(love|crush|delu|manifest|dream|magic)\b/i, theme: "lavender" },
  { test: /\b(cute|pretty|girlie|baking|sweet)\b/i, theme: "peach" },
  { test: /\b(dark|edgy|alone|introvert|moody)\b/i, theme: "mono" },
];

function pickTheme(text: string): ColorTheme {
  for (const { test, theme } of THEME_BY_KEYWORD) {
    if (test.test(text)) return theme;
  }
  return COLOR_THEMES[Math.floor(Math.random() * COLOR_THEMES.length)];
}

const FALLBACK_TITLES = [
  "Main Character With Receipts",
  "Soft Power, Sharp Edges",
  "Quietly Cooking, Loudly Loved",
  "Built Different, Wired Right",
  "Plot Twist In A Hoodie",
];

const FALLBACK_VIBES = [
  "Glitter on the chaos, glue on the rest.",
  "Burnt the script, kept the storyline.",
  "Slightly delulu, mostly loved.",
  "Crying optional, winning standard.",
];

const FALLBACK_EMOJIS = ["✨", "💫", "🌙", "🔥", "🪄", "🌈", "🦋"];

/** Mock generator — stand-in for /api/generate during UI build. */
export function mockGenerate({ rawStory }: { rawStory: string }): CardData {
  const id = `mock-${Date.now().toString(36)}-${Math.random()
    .toString(36)
    .slice(2, 6)}`;

  const theme = pickTheme(rawStory);

  // Naive bullet extraction: split by sentences, take first 4 short ones.
  const sentences = rawStory
    .split(/(?<=[.!?])\s+|\n+/g)
    .map((s) => s.trim())
    .filter((s) => s.length > 6 && s.length < 90);

  const bragPoints = (
    sentences.length >= 3
      ? sentences.slice(0, 4)
      : [
          "Walked into the room, owned it",
          "Has receipts and refuses to share them",
          "Knows the playlist by heart",
          "Sends voice memos, gets things done",
        ]
  ).map((p) => p.replace(/[\."!?]+$/g, ""));

  return {
    id,
    nickname: generateHandle(),
    title: FALLBACK_TITLES[Math.floor(Math.random() * FALLBACK_TITLES.length)],
    bragPoints,
    vibeCaption:
      FALLBACK_VIBES[Math.floor(Math.random() * FALLBACK_VIBES.length)],
    emoji: FALLBACK_EMOJIS[Math.floor(Math.random() * FALLBACK_EMOJIS.length)],
    colorTheme: theme,
    cheersCount: Math.floor(Math.random() * 200) + 5,
  };
}
