const MODULE_URL = "https://cdn.jsdelivr.net/npm/@diffusionstudio/vits-web@1.0.3/+esm";
export const NATURAL_VOICE_ID = "ru_RU-irina-medium";
export const NATURAL_VOICE_LABEL = "Ирина · нейронный русский голос";
export const NATURAL_VOICE_SIZE_MB = 63;

const ENABLED_KEY = "babyguide.voice.neural.enabled";

type DownloadProgress = { url?: string; loaded?: number; total?: number };
type VitsModule = {
  download: (voiceId: string, callback?: (progress: DownloadProgress) => void) => Promise<void>;
  stored: () => Promise<string[]>;
  predict: (
    input: { text: string; voiceId: string },
    callback?: (progress: DownloadProgress) => void,
  ) => Promise<Blob>;
  remove?: (voiceId: string) => Promise<void>;
};

let modulePromise: Promise<VitsModule> | null = null;
let currentAudio: HTMLAudioElement | null = null;
let currentUrl = "";

function canUseBrowserTts() {
  return typeof window !== "undefined" && typeof WebAssembly !== "undefined";
}

async function loadModule(): Promise<VitsModule> {
  if (!canUseBrowserTts()) throw new Error("Нейронная озвучка не поддерживается этим браузером");
  if (!modulePromise) {
    modulePromise = import(/* @vite-ignore */ MODULE_URL) as Promise<VitsModule>;
  }
  return modulePromise;
}

export function neuralVoiceEnabled() {
  try {
    return localStorage.getItem(ENABLED_KEY) === "true";
  } catch {
    return false;
  }
}

export function setNeuralVoiceEnabled(value: boolean) {
  try {
    if (value) localStorage.setItem(ENABLED_KEY, "true");
    else localStorage.removeItem(ENABLED_KEY);
  } catch {
    /* Preference is optional; the voice pack itself remains in browser storage. */
  }
}

export async function isNaturalVoiceInstalled() {
  try {
    const tts = await loadModule();
    const stored = await tts.stored();
    return stored.includes(NATURAL_VOICE_ID);
  } catch {
    return false;
  }
}

export async function installNaturalVoice(onProgress?: (percent: number) => void) {
  const tts = await loadModule();
  await tts.download(NATURAL_VOICE_ID, (progress) => {
    const loaded = progress.loaded || 0;
    const total = progress.total || 0;
    if (total > 0) onProgress?.(Math.max(0, Math.min(100, Math.round((loaded / total) * 100))));
  });
  setNeuralVoiceEnabled(true);
  onProgress?.(100);
}

export async function removeNaturalVoice() {
  try {
    const tts = await loadModule();
    await tts.remove?.(NATURAL_VOICE_ID);
  } finally {
    setNeuralVoiceEnabled(false);
  }
}

export function stopNaturalVoice() {
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
  try {
    const installed = await isNaturalVoiceInstalled();
    if (!installed) throw new Error("Живой голос ещё не загружен");
    const tts = await loadModule();
    const wav = await tts.predict({ text, voiceId: NATURAL_VOICE_ID });
    currentUrl = URL.createObjectURL(wav);
    const audio = new Audio(currentUrl);
    currentAudio = audio;
    audio.preload = "auto";
    audio.onended = () => {
      stopNaturalVoice();
      options.onEnd?.();
    };
    audio.onerror = () => {
      stopNaturalVoice();
      options.onError?.("Не удалось воспроизвести нейронный голос");
    };
    await audio.play();
    return true;
  } catch (error) {
    stopNaturalVoice();
    options.onError?.(error instanceof Error ? error.message : "Нейронная озвучка недоступна");
    return false;
  }
}
