// Day-of-year picker → rotates a prompt every day. Servers in different
// regions might land on different dates around midnight; that's fine,
// the prompt is decorative inspiration, not load-bearing copy.

const PROMPTS_EN = [
  "your last L, but make it cute",
  "the meanest thing your group chat ever said about you",
  "a soft launch nobody noticed but you",
  "the dumbest reason you didn't text back",
  "a hill you'd die on, no negotiation",
  "a confession that's actually a brag",
  "what's underrated about you",
  "your villain origin story, briefly",
  "a thing only your therapist knows",
  "the hardest you've laughed alone",
  "the role you've been auto-cast in",
  "the last time you cried at something stupid",
  "what your delulu is doing this week",
  "the receipt you keep in your pocket",
];

const PROMPTS_KO = [
  "최근에 당한 L, 근데 귀엽게",
  "단톡이 너한테 한 가장 못된 말",
  "아무도 못 알아챈 너의 소프트 런칭",
  "답장 안 한 가장 멍청한 이유",
  "절대 못 굽히는 의견 하나",
  "사실은 자랑인 고백 하나",
  "너의 저평가된 점",
  "너의 빌런 기원설, 짧게",
  "상담사만 아는 거 하나",
  "혼자 웃다 진짜 죽을 뻔한 순간",
  "친구들이 너에게 자동으로 맡기는 역할",
  "최근에 멍청한 것에 운 순간",
  "이번 주 너의 델루루가 뭐 하고 있는지",
  "주머니에 들고 다니는 작은 영수증",
];

function dayOfYear(date = new Date()): number {
  const start = Date.UTC(date.getUTCFullYear(), 0, 0);
  const diff = date.getTime() - start;
  return Math.floor(diff / 86400000);
}

export function pickDailyPrompt(lang: "en" | "ko"): string {
  const list = lang === "ko" ? PROMPTS_KO : PROMPTS_EN;
  return list[dayOfYear() % list.length];
}
