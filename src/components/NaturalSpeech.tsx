import { useEffect, useState } from "react";
import {
  NATURAL_VOICE_LABEL,
  NATURAL_VOICE_SIZE_MB,
  installNaturalVoice,
  isNaturalVoiceInstalled,
  neuralVoiceEnabled,
  removeNaturalVoice,
  setNeuralVoiceEnabled,
  speakNaturalRussian,
  stopNaturalVoice,
} from "../services/neuralVoice";
import { speakRussian } from "../utils/speech";

export function NaturalVoiceSetup({ compact = false }: { compact?: boolean }) {
  const [installed, setInstalled] = useState(false);
  const [enabled, setEnabled] = useState(neuralVoiceEnabled);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");

  useEffect(() => {
    let alive = true;
    void isNaturalVoiceInstalled().then((value) => {
      if (!alive) return;
      setInstalled(value);
      setLoading(false);
      if (value && !neuralVoiceEnabled()) {
        setNeuralVoiceEnabled(true);
        setEnabled(true);
      }
    });
    return () => {
      alive = false;
    };
  }, []);

  async function install() {
    setError("");
    setDownloading(true);
    setProgress(0);
    try {
      await installNaturalVoice(setProgress);
      setInstalled(true);
      setEnabled(true);
    } catch {
      setError("Не удалось загрузить голос. Проверьте интернет и повторите.");
    } finally {
      setDownloading(false);
    }
  }

  async function remove() {
    stopNaturalVoice();
    await removeNaturalVoice();
    setInstalled(false);
    setEnabled(false);
    setProgress(0);
  }

  if (loading && compact) return null;

  return (
    <section className={"natural-voice-card" + (compact ? " compact" : "")}>
      <div className="natural-voice-art" aria-hidden="true">
        <span className="voice-face"><i /><b /><em /></span>
        <span className="voice-wave wave-a" />
        <span className="voice-wave wave-b" />
        <span className="voice-wave wave-c" />
      </div>
      <div className="natural-voice-copy">
        <p className="eyebrow">ЖИВОЙ ГОЛОС</p>
        <h3>{NATURAL_VOICE_LABEL}</h3>
        <p>
          Нейронная озвучка работает прямо на устройстве. Голос загружается один
          раз ({NATURAL_VOICE_SIZE_MB} МБ), затем модель хранится в браузере и
          может работать без системного SpeechSynthesis.
        </p>
      </div>
      {downloading ? (
        <div className="voice-download" role="status">
          <div><span style={{ width: `${progress}%` }} /></div>
          <strong>{progress || "…"}%</strong>
          <small>Не закрывайте вкладку до окончания загрузки.</small>
        </div>
      ) : installed ? (
        <div className="voice-installed-actions">
          <button
            className={enabled ? "button" : "secondary"}
            onClick={() => {
              const next = !enabled;
              setEnabled(next);
              setNeuralVoiceEnabled(next);
              if (!next) stopNaturalVoice();
            }}
          >
            {enabled ? "✓ Живой голос включён" : "Включить живой голос"}
          </button>
          {!compact && (
            <button className="text-button destructive" onClick={() => void remove()}>
              Удалить голос с устройства
            </button>
          )}
        </div>
      ) : (
        <button className="button" onClick={() => void install()}>
          Скачать живой голос · {NATURAL_VOICE_SIZE_MB} МБ
        </button>
      )}
      {error && <p className="form-error" role="alert">{error}</p>}
    </section>
  );
}

export function NaturalSpeechButton({
  text,
  label = "Слушать",
}: {
  text: string;
  label?: string;
}) {
  const [installed, setInstalled] = useState(false);
  const [checking, setChecking] = useState(true);
  const [playing, setPlaying] = useState(false);
  const [preparing, setPreparing] = useState(false);
  const [showSetup, setShowSetup] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let alive = true;
    void isNaturalVoiceInstalled().then((value) => {
      if (alive) {
        setInstalled(value);
        setChecking(false);
      }
    });
    return () => {
      alive = false;
      stopNaturalVoice();
      if ("speechSynthesis" in window) window.speechSynthesis.cancel();
    };
  }, []);

  async function playNatural() {
    if (playing) {
      stopNaturalVoice();
      if ("speechSynthesis" in window) window.speechSynthesis.cancel();
      setPlaying(false);
      setPreparing(false);
      return;
    }
    if (!installed || !neuralVoiceEnabled()) {
      setShowSetup(true);
      return;
    }
    setError("");
    setPreparing(true);
    const ok = await speakNaturalRussian(text, {
      onEnd: () => setPlaying(false),
      onError: (message) => {
        setPlaying(false);
        setPreparing(false);
        setError(message);
      },
    });
    setPreparing(false);
    setPlaying(ok);
  }

  function playSystemFallback() {
    setError("");
    setShowSetup(false);
    setPlaying(true);
    const ok = speakRussian(text, {
      rate: 0.78,
      pitch: 1.02,
      onEnd: () => setPlaying(false),
      onError: () => {
        setPlaying(false);
        setError("Системный голос недоступен.");
      },
    });
    if (!ok) {
      setPlaying(false);
      setError("Озвучка недоступна в этом браузере.");
    }
  }

  return (
    <div className="natural-speech-control">
      <button
        className="secondary natural-speech-button"
        onClick={() => void playNatural()}
        disabled={checking || preparing}
        aria-pressed={playing}
      >
        {preparing ? "Готовлю живой голос…" : playing ? "■ Остановить" : `▷ ${label}`}
      </button>
      {showSetup && (
        <div className="voice-inline-setup">
          <strong>Для естественной озвучки нужен голосовой пакет</strong>
          <p>Загрузите его один раз. Системный робот больше не будет основным голосом.</p>
          <NaturalVoiceSetup compact />
          <button className="text-button" onClick={playSystemFallback}>
            Сейчас использовать системный голос
          </button>
          <button
            className="text-button"
            onClick={() => {
              setShowSetup(false);
              void isNaturalVoiceInstalled().then(setInstalled);
            }}
          >
            Закрыть
          </button>
        </div>
      )}
      {error && <p role="alert" className="form-error">{error}</p>}
    </div>
  );
}
