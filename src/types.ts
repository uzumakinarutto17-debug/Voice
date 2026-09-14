export interface VoiceoverTake {
  id: string;
  takeNumber: number;
  title: string;
  text: string;
  actingDirection: string;
  voice: string;
  audioUrl: string;
  duration: number;
  sampleRate: number;
  createdAt: string;
  emotionId: string;
  emotionLabel: string;
  age: number;
  gender: "boy" | "girl" | "neutral";
  provider?: "gemini-tts" | "studio-neural-voice" | "studio-spoken-tts" | "studio-synth";
  isFallback?: boolean;
}

export interface VoiceOption {
  id: string;
  name: string;
  description: string;
  genderPreference: "boy" | "girl" | "neutral";
  recommendedFor: string;
}

export interface EmotionOption {
  id: string;
  num: number;
  label: string;
  shortLabel: string;
  category: "mocking" | "loving" | "stuttering" | "joy" | "tantrum";
  summary: string;
  promptDescription: string;
  color: string;
  badgeBg: string;
  badgeText: string;
}

export interface QuotaStatus {
  tier: "Free Tier" | "Paid Tier";
  requestsRemaining: number;
  requestsLimit: number;
  requestsUsed: number;
  status: "available" | "exhausted" | "cooldown";
  model: string;
  retryDelaySeconds?: number;
  lastChecked: string;
  isFallbackActive: boolean;
}
