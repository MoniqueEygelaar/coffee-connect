// Fun icebreaker questions for coffee chats
const ICEBREAKERS = [
  "What's the best thing that happened to you this week?",
  "If you could have any superpower for a day, what would it be?",
  "What's a hobby you've always wanted to pick up?",
  "What's the most interesting thing you've read or watched recently?",
  "If you could travel anywhere tomorrow, where would you go?",
  "What's a fun fact about you that most people don't know?",
  "What's your go-to comfort food?",
  "If you could have dinner with anyone (alive or dead), who would it be?",
  "What's a skill you're secretly proud of?",
  "What's the best piece of advice you've ever received?",
  "If you could learn any language instantly, which one?",
  "What's your favorite way to unwind after work?",
  "What's something on your bucket list?",
  "If you had to eat one cuisine for the rest of your life, what would it be?",
  "What's a movie or show you could rewatch forever?",
  "What's the most adventurous thing you've ever done?",
  "Coffee or tea? And how do you take it?",
  "What would your dream weekend look like?",
  "If you could switch jobs with anyone for a day, who would it be?",
  "What's something that always makes you laugh?",
];

export function getIcebreaker(matchId: string): string {
  // Deterministic based on matchId so both users see the same question
  let hash = 0;
  for (let i = 0; i < matchId.length; i++) {
    hash = (hash * 31 + matchId.charCodeAt(i)) % ICEBREAKERS.length;
  }
  return ICEBREAKERS[Math.abs(hash) % ICEBREAKERS.length];
}

export function getRandomIcebreakers(count: number): string[] {
  const shuffled = [...ICEBREAKERS].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}
