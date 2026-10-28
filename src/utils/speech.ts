const preferredVoiceHints = [
  "milena",
  "katya",
  "alena",
  "svetlana",
  "dariya",
  "google русский",
  "russian",
  "русский",
];

const voiceStorageKey = "babyguide.voice.ru";

export function russianVoices() {
  if (!("speechSynthesis" in window)) return [] as SpeechSynthesisVoice[];
  return window.speechSynthesis
    .getVoices()
    .filter((voice) => voice.lang.toLowerCase().startsWith("ru"))
    .sort((a, b) => Number(b.localService) - Number(a.localService));
}

export function savedRussianVoiceName() {
  try {
    return localStorage.getItem(voiceStorageKey) || "";
  } catch {
    return "";
  }
}

export function saveRussianVoiceName(name: string) {
  try {
    if (name) localStorage.setItem(voiceStorageKey, name);
    else localStorage.removeItem(voiceStorageKey);
  } catch {
    /* Voice selection is a convenience; speech still works without storage. */
  }
}

export function bestRussianVoice(preferredName = savedRussianVoiceName()) {
  const russian = russianVoices();
  if (!russian.length) return null;
  if (preferredName) {
    const chosen = russian.find((voice) => voice.name === preferredName);
    if (chosen) return chosen;
  }
  return (
    preferredVoiceHints
      .map((hint) =>
        russian.find((voice) => voice.name.toLowerCase().includes(hint)),
      )
      .find(Boolean) ||
    russian.find((voice) => voice.localService) ||
    russian[0]
  );
}

export function speakRussian(
  text: string,
  options: {
    rate?: number;
    pitch?: number;
    voiceName?: string;
    onEnd?: () => void;
    onError?: () => void;
  } = {},
) {
  if (!("speechSynthesis" in window)) return false;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "ru-RU";
  utterance.rate = options.rate ?? 0.78;
  utterance.pitch = options.pitch ?? 1.04;
  utterance.volume = 1;
  const voice = bestRussianVoice(options.voiceName);
  if (voice) utterance.voice = voice;
  utterance.onend = () => options.onEnd?.();
  utterance.onerror = () => options.onError?.();
  window.speechSynthesis.speak(utterance);
  return true;
}
