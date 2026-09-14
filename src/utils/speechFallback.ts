/**
 * Browser-native Web Speech API speech synthesis utility.
 * Speaks real human speech aloud directly through the user's browser with child voice pitch/rate tuning.
 */

export function speakDialogueInBrowser(
  dialogueText: string,
  age: number,
  gender: "boy" | "girl" | "neutral",
  emotionId: string,
  onStart?: () => void,
  onEnd?: () => void
): boolean {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    return false;
  }

  try {
    window.speechSynthesis.cancel();

    const cleanText = dialogueText.replace(/\[.*?\]/g, "").trim();
    if (!cleanText) return false;

    const utterance = new SpeechSynthesisUtterance(cleanText);

    // Dynamic pitch based on child age:
    // Standard pitch is 1.0 (range 0 to 2).
    // Younger kids have higher fundamental frequency:
    // 3yo -> ~1.8, 5yo -> ~1.6, 8yo -> ~1.4, 12yo -> ~1.2
    let pitch = 1.6;
    if (age <= 4) pitch = 1.8;
    else if (age <= 6) pitch = 1.6;
    else if (age <= 8) pitch = 1.4;
    else if (age <= 10) pitch = 1.3;
    else pitch = 1.15;

    if (gender === "girl") pitch = Math.min(2.0, pitch * 1.12);
    if (gender === "boy") pitch = Math.max(0.8, pitch * 0.95);

    // Rate based on emotion style
    let rate = 1.05;
    if (emotionId === "sneering-mocking") {
      rate = 1.1;
      pitch = Math.min(2.0, pitch * 1.08);
    } else if (emotionId === "excited-loving-cute") {
      rate = 1.25;
      pitch = Math.min(2.0, pitch * 1.18);
    } else if (emotionId === "calm-slow-stuttering-cute") {
      rate = 0.8;
      pitch = Math.max(0.9, pitch * 0.92);
    } else if (emotionId === "bursting-joy-breathless") {
      rate = 1.35;
      pitch = Math.min(2.0, pitch * 1.22);
    } else if (emotionId === "frustrated-tantrum") {
      rate = 1.15;
      pitch = Math.min(2.0, pitch * 1.2);
    }

    utterance.pitch = pitch;
    utterance.rate = rate;
    utterance.volume = 1.0;

    // Pick best natural human voice if available (filter out robotic synth voices)
    const voices = window.speechSynthesis.getVoices();
    if (voices && voices.length > 0) {
      const englishVoices = voices.filter(
        (v) =>
          v.lang.startsWith("en") &&
          !v.name.toLowerCase().includes("david") && // David is robotic desktop voice
          !v.name.toLowerCase().includes("espeak")
      );

      // Prioritize modern natural/neural voices
      const naturalVoice = englishVoices.find(
        (v) =>
          v.name.toLowerCase().includes("natural") ||
          v.name.toLowerCase().includes("online") ||
          v.name.toLowerCase().includes("neural") ||
          v.name.toLowerCase().includes("google") ||
          v.name.toLowerCase().includes("maisie") ||
          v.name.toLowerCase().includes("ana") ||
          v.name.toLowerCase().includes("samantha")
      );

      if (naturalVoice) {
        utterance.voice = naturalVoice;
      } else if (englishVoices.length > 0) {
        const preferred = englishVoices.find((v) =>
          gender === "girl"
            ? v.name.toLowerCase().includes("female") ||
              v.name.toLowerCase().includes("samantha") ||
              v.name.toLowerCase().includes("karen") ||
              v.name.toLowerCase().includes("victoria")
            : v.name.toLowerCase().includes("male") ||
              v.name.toLowerCase().includes("daniel") ||
              v.name.toLowerCase().includes("christopher") ||
              v.name.toLowerCase().includes("oliver")
        );
        if (preferred) {
          utterance.voice = preferred;
        } else {
          utterance.voice = englishVoices[0];
        }
      }
    }

    if (onStart) utterance.onstart = onStart;
    if (onEnd) {
      utterance.onend = onEnd;
      utterance.onerror = () => onEnd();
    }

    window.speechSynthesis.speak(utterance);
    return true;
  } catch (e) {
    console.warn("Browser speech synthesis error:", e);
    return false;
  }
}

export function stopBrowserSpeech() {
  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    window.speechSynthesis.cancel();
  }
}
