import { useEffect, useRef, useState } from "react";
export type RecordingState =
  | "idle"
  | "permission"
  | "listening"
  | "ready"
  | "error";

type RecorderOptions = {
  maxDurationMs?: number;
  silenceAfterSpeechMs?: number;
  initialSilenceMs?: number;
  soundThreshold?: number;
};

const defaults: Required<RecorderOptions> = {
  maxDurationMs: 8000,
  silenceAfterSpeechMs: 1200,
  initialSilenceMs: 1000,
  soundThreshold: 0.025,
};

export function useRecorder(options: RecorderOptions = {}) {
  const config = { ...defaults, ...options };
  const [state, setState] = useState<RecordingState>("idle"),
    [error, setError] = useState(""),
    [blob, setBlob] = useState<Blob | null>(null);
  const recorder = useRef<MediaRecorder | null>(null),
    stream = useRef<MediaStream | null>(null),
    audioContext = useRef<AudioContext | null>(null),
    interval = useRef<ReturnType<typeof setInterval> | null>(null),
    timeout = useRef<ReturnType<typeof setTimeout> | null>(null),
    generation = useRef(0);
  const alive = useRef(true);

  function release() {
    stream.current?.getTracks().forEach((t) => t.stop());
    stream.current = null;
    if (interval.current) clearInterval(interval.current);
    if (timeout.current) clearTimeout(timeout.current);
    interval.current = null;
    timeout.current = null;
    void audioContext.current?.close().catch(() => {});
    audioContext.current = null;
  }

  function stop() {
    if (recorder.current && recorder.current.state !== "inactive") {
      recorder.current.stop();
      release();
    } else release();
  }

  function discard() {
    generation.current++;
    if (recorder.current && recorder.current.state !== "inactive")
      recorder.current.stop();
    release();
    recorder.current = null;
    setBlob(null);
    setState("idle");
    setError("");
  }

  async function start() {
    if (state === "permission" || state === "listening") return;
    setBlob(null);
    setError("");
    if (
      !navigator.mediaDevices?.getUserMedia ||
      typeof MediaRecorder === "undefined"
    ) {
      setError(
        "Микрофон или запись не поддерживаются в этом браузере. Откройте HTTPS в Safari/Chrome; слово можно записать текстом.",
      );
      setState("error");
      return;
    }
    const id = ++generation.current;
    setState("permission");
    try {
      const media = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true },
        video: false,
      });
      if (!alive.current || generation.current !== id) {
        media.getTracks().forEach((t) => t.stop());
        return;
      }
      stream.current = media;
      const type = [
        "audio/webm;codecs=opus",
        "audio/mp4",
        "audio/webm",
        "audio/ogg;codecs=opus",
      ].find((m) => MediaRecorder.isTypeSupported(m));
      const r = new MediaRecorder(media, type ? { mimeType: type } : undefined);
      recorder.current = r;
      const chunks: Blob[] = [];
      r.ondataavailable = (e) => {
        if (e.data.size) chunks.push(e.data);
      };
      r.onerror = () => {
        release();
        if (alive.current && generation.current === id) {
          setError("Не удалось записать звук. Проверьте микрофон и повторите.");
          setState("error");
        }
      };
      r.onstop = () => {
        release();
        if (!alive.current || id !== generation.current) return;
        const result = new Blob(chunks, { type: r.mimeType || "audio/mp4" });
        if (!result.size) {
          setError("Запись пустая. Проверьте доступ к микрофону.");
          setState("error");
          return;
        }
        setBlob(result);
        setState("ready");
      };
      r.start();
      setState("listening");
      timeout.current = setTimeout(stop, config.maxDurationMs);

      // Analysis only: the microphone is never connected to the speakers.
      try {
        const context = new AudioContext();
        audioContext.current = context;
        if (context.state === "suspended") await context.resume().catch(() => {});
        const source = context.createMediaStreamSource(media),
          analyser = context.createAnalyser();
        analyser.fftSize = 1024;
        source.connect(analyser);
        const samples = new Uint8Array(analyser.fftSize);
        let spoke = false,
          lastSound = Date.now(),
          started = Date.now();
        interval.current = setInterval(() => {
          analyser.getByteTimeDomainData(samples);
          const energy = Math.sqrt(
            samples.reduce((sum, x) => sum + ((x - 128) / 128) ** 2, 0) /
              samples.length,
          );
          if (energy > config.soundThreshold) {
            spoke = true;
            lastSound = Date.now();
          }
          const elapsed = Date.now() - started;
          if (
            spoke &&
            elapsed >= config.initialSilenceMs &&
            Date.now() - lastSound >= config.silenceAfterSpeechMs
          )
            stop();
        }, 100);
      } catch {
        /* Recording still has a maximum duration and a visible stop button. */
      }
    } catch (e) {
      release();
      if (alive.current && id === generation.current) {
        setError(
          (e as DOMException).name === "NotAllowedError"
            ? "Доступ к микрофону запрещён. Разрешите его в настройках браузера или сохраните слово текстом."
            : "Микрофон недоступен или занят. Проверьте устройство и повторите.",
        );
        setState("error");
      }
    }
  }

  useEffect(
    () => () => {
      alive.current = false;
      generation.current++;
      if (recorder.current && recorder.current.state !== "inactive")
        recorder.current.stop();
      release();
    },
    [],
  );

  return { state, error, blob, start, stop, discard };
}
