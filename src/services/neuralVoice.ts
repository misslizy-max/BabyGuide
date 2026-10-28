export const NATURAL_VOICE_ID = "liza-fish-audio-clone";
export const NATURAL_VOICE_LABEL = "Мамин голос · Лиза";
export const NATURAL_VOICE_SIZE_MB = 0;

const ENABLED_KEY = "babyguide.voice.neural.enabled";
let currentAudio: HTMLAudioElement | null = null;
let currentUrl = "";
let activeController: AbortController | null = null;

export function neuralVoiceEnabled() {
  try {
    return localStorage.getItem(ENABLED_KEY) !== "false";
  } catch {
    return true;
  }
}

export function setNeuralVoiceEnabled(value: boolean) {
  try {
    localStorage.setItem(ENABLED_KEY, value ? "true" : "false");
  } catch {
    /* Voice preference is optional. */
  }
}

export async function isNaturalVoiceInstalled() {
  return true;
}

export async function installNaturalVoice(onProgress?: (percent: number) => void) {
  setNeuralVoiceEnabled(true);
  onProgress?.(100);
}

export async function removeNaturalVoice() {
  setNeuralVoiceEnabled(false);
  stopNaturalVoice();
}

export function stopNaturalVoice() {
  activeController?.abort();
  activeController = null;
  currentAudio?.pause();
  currentAudio = null;
  if (currentUrl) URL.revokeObjectURL(currentUrl);
  currentUrl = "";
}

export async function speakNaturalRussian(
  text: string,
  options: { onEnd?: () => void; onError?: (message: string) => void } = {},
) {
  stopNaturalVoice();
  if (!neuralVoiceEnabled()) {
    options.onError?.("Мамин голос выключен в настройках");
    return false;
  }
  const cleanText = text.trim();
  if (!cleanText) return false;

  try {
    const controller = new AbortController();
    activeController = controller;
    const response = await fetch("/api/voice", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: cleanText }),
      signal: controller.signal,
    });
    if (!response.ok) {
      let message = "Не удалось создать мамин голос";
      try {
        const payload = (await response.json()) as { error?: string };
        if (payload.error) message = payload.error;
      } catch {
        /* Keep friendly error. */
      }
      throw new Error(message);
    }
    const mp3 = await response.blob();
    if (!mp3.size) throw new Error("Сервис вернул пустую аудиозапись");
    currentUrl = URL.createObjectURL(mp3);
    const audio = new Audio(currentUrl);
    currentAudio = audio;
    audio.preload = "auto";
    audio.onended = () => {
      stopNaturalVoice();
      options.onEnd?.();
    };
    audio.onerror = () => {
      stopNaturalVoice();
      options.onError?.("Не удалось воспроизвести мамин голос");
    };
    await audio.play();
    return true;
  } catch (error) {
    const aborted = error instanceof DOMException && error.name === "AbortError";
    stopNaturalVoice();
    if (!aborted) options.onError?.(error instanceof Error ? error.message : "Мамин голос временно недоступен");
    return false;
  }
}
