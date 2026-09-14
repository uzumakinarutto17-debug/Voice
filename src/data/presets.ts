import { EmotionOption, VoiceOption } from "../types";

export const EMOTIONS: EmotionOption[] = [
  {
    id: "sneering-mocking",
    num: 1,
    label: "1. Sneering, Mocking & Aggressive",
    shortLabel: "Sneering & Mocking",
    category: "mocking",
    summary: "Sharp vocal tension, taunting sneer, aggressive defiance and bratty attitude",
    promptDescription: "Deliver this line in a sneering, mocking, and aggressively hostile tone! The child's voice should sound sharp, strained with bratty vocal tension, sarcastically taunting and full of defiant attitude.",
    color: "rose",
    badgeBg: "bg-rose-100",
    badgeText: "text-rose-800",
  },
  {
    id: "excited-loving-cute",
    num: 2,
    label: "2. Excited, Fast-Paced, Loving & Cute",
    shortLabel: "Excited, Loving & Cute",
    category: "loving",
    summary: "Bubbly rush of words, sweet affection, giggly warmth and endearing enthusiasm",
    promptDescription: "Deliver this line in an excited, fast-paced, deeply loving, warm, affectionate, and extremely cute tone! The child should sound bubbly, beaming with giggly tenderness and adorable bouncy energy.",
    color: "amber",
    badgeBg: "bg-amber-100",
    badgeText: "text-amber-800",
  },
  {
    id: "calm-slow-stuttering-cute",
    num: 3,
    label: "3. Calm, Slow, Stuttering, Cute",
    shortLabel: "Calm, Stuttering & Cute",
    category: "stuttering",
    summary: "Soft gentle cadence, innocent hesitant pauses/stutters, shy and heartwarming",
    promptDescription: "Deliver this line in a calm, very slow-paced, softly stuttering, and cute child tone! The child should sound innocent, quiet, gentle, hesitating with sweet natural child stutters and pauses.",
    color: "emerald",
    badgeBg: "bg-emerald-100",
    badgeText: "text-emerald-800",
  },
  {
    id: "bursting-joy-breathless",
    num: 4,
    label: "4. Bursting with Joy (Breathless)",
    shortLabel: "Breathless Joy",
    category: "joy",
    summary: "Fast-paced, high-pitched ecstatic squeals, talking continuously without taking a breath",
    promptDescription: "Deliver this line fast-paced, high-pitched, and sounding like bursting with overwhelming ecstatic joy, talking continuously in one huge breathless rapid rush without taking a breath!",
    color: "indigo",
    badgeBg: "bg-indigo-100",
    badgeText: "text-indigo-800",
  },
  {
    id: "frustrated-tantrum",
    num: 5,
    label: "5. Frustrated Tantrum (Classic)",
    shortLabel: "Frustrated Tantrum",
    category: "tantrum",
    summary: "Strained cracking vocal cords, screaming rage, stomping feet and meltdown fury",
    promptDescription: "Deliver this line having a full explosive, frustrated temper tantrum! The voice should sound strained, sharp, and defiantly angry, full of vocal tension, cracking strain and furious shouting.",
    color: "red",
    badgeBg: "bg-red-100",
    badgeText: "text-red-800",
  },
];

export const VOICE_OPTIONS: VoiceOption[] = [
  {
    id: "Puck",
    name: "Puck (Energetic Boy Voice)",
    description: "Punchy, agile higher register natural for spirited young boys.",
    genderPreference: "boy",
    recommendedFor: "Young Boys, Tantrums & Mocking",
  },
  {
    id: "Kore",
    name: "Kore (Bright Girl Voice)",
    description: "Crisp treble, clear bright articulation and emotive elasticity.",
    genderPreference: "girl",
    recommendedFor: "Young Girls, Cute & Breathless Joy",
  },
  {
    id: "Zephyr",
    name: "Zephyr (Animated & Theatrical)",
    description: "Expressive forward placement with vivid dynamic range.",
    genderPreference: "neutral",
    recommendedFor: "Mocking Aggression & Breathless Energy",
  },
  {
    id: "Aoede",
    name: "Aoede (Sweet & Gentle)",
    description: "Soft, gentle and melodic child timbre.",
    genderPreference: "girl",
    recommendedFor: "Loving, Calm & Stuttering Takes",
  },
  {
    id: "Fenrir",
    name: "Fenrir (Slightly Deeper Timbre)",
    description: "Grounded timbre suitable for older kids (8-12).",
    genderPreference: "boy",
    recommendedFor: "Older Kids (8-12) & Gritty Defiance",
  },
];

export function buildActingPrompt(
  age: number,
  gender: "boy" | "girl" | "neutral",
  emotion: EmotionOption
): string {
  const genderNoun = gender === "boy" ? "little boy" : gender === "girl" ? "little girl" : "child";
  return `You are acting as a ${age}-year-old ${genderNoun}. Use the vocal characteristics of a real ${age}-year-old ${genderNoun}: authentic pitch, child diction, and breath mechanics. ${emotion.promptDescription}`;
}
