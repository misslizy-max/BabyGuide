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

export function bestRussianVoice() {
  if (!("speechSynthesis" in window)) return null;
  const voices = window.speechSynthesis.getVoices();
  const russian = voices.filter((voice) =>
    voice.lang.toLowerCase().startsWith("ru"),
  );
  if (!russian.length) return null;
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
  const voice = bestRussianVoice();
  if (voice) utterance.voice = voice;
  utterance.onend = () => options.onEnd?.();
  utterance.onerror = () => options.onError?.();
  window.speechSynthesis.speak(utterance);
  return true;
}
