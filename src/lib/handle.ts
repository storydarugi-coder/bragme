const ADJECTIVES = [
  "soft", "loud", "quiet", "brave", "slick", "golden", "velvet", "mellow",
  "brisk", "snug", "witty", "plush", "salty", "sweet", "bright", "swift",
  "calm", "wild", "lone", "sleepy", "cosmic", "lush", "jazzy", "prime",
  "fresh", "wired", "cozy", "frank", "bold", "gentle", "lucky", "tidy",
];

const NOUNS = [
  "comet", "kettle", "volt", "ghost", "spoon", "peach", "panda", "bagel",
  "pixel", "harbor", "planet", "donut", "lemon", "fern", "parade", "mango",
  "otter", "atlas", "basil", "candle", "stitch", "koala", "halo", "garden",
  "finch", "bridge", "oracle", "quartz", "river", "cloud", "cactus", "moth",
];

export function generateHandle(): string {
  const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
  const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)];
  // Two- or three-digit suffix keeps handles short and reduces collision noise.
  const num = Math.floor(Math.random() * 990) + 10;
  return `${adj}_${noun}_${num}`;
}
