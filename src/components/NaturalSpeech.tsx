import { useEffect, useState } from "react";
import {
  NATURAL_VOICE_LABEL,
  neuralVoiceEnabled,
  setNeuralVoiceEnabled,
  speakNaturalRussian,
  stopNaturalVoice,
} from "../services/neuralVoice";

export function NaturalVoiceSetup({ compact = false }: { compact?: boolean }) {
  const [enabled, setEnabled] = useState(neuralVoiceEnabled);
  return (
    <section className={"natural-voice-card" + (compact ? " compact" : "")}>
      <div className="natural-voice-art" aria-hidden="true">
        <span className="voice-face"><i /><b /><em /></span>
        <span className="voice-wave wave-a" />
        <span className="voice-wave wave-b" />
        <span className="voice-wave wave-c" />
      </div>
      <div className="natural-voice-copy">
        <p className="eyebrow">МАМИН ГОЛОС</p>
        <h3>{NATURAL_VOICE_LABEL}</h3>
        <p>
          BabyGuide озвучивает тексты клоном голоса Лизы через защищённое соединение.
          API-ключ хранится на сервере Cloudflare и не передаётся в браузер.
        </p>
      </div>
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
          {enabled ? "✓ Мамин голос включён" : "Включить мамин голос"}
        </button>
      </div>
    </section>
  );
}

export function NaturalSpeechButton({ text, label = "Слушать" }: { text: string; label?: string }) {
  const [playing, setPlaying] = useState(false);
  const [preparing, setPreparing] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => () => stopNaturalVoice(), []);

  async function playNatural() {
    if (playing || preparing) {
      stopNaturalVoice();
      setPlaying(false);
      setPreparing(false);
      return;
    }
    if (!neuralVoiceEnabled()) {
      setError("Мамин голос выключен. Включите его в разделе «Голос BabyGuide».");
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

  return (
    <div className="natural-speech-control">
      <button
        className="secondary natural-speech-button"
        onClick={() => void playNatural()}
        disabled={preparing}
        aria-pressed={playing}
      >
        {preparing ? "Готовлю мамин голос…" : playing ? "■ Остановить" : `▷ ${label}`}
      </button>
      {error && <p role="alert" className="form-error">{error}</p>}
    </div>
  );
}
