import {
  useEffect,
  useRef,
  useState,
  type ReactNode,
  type FormEvent,
} from "react";
import { useApp } from "../hooks/useApp";
import {
  russianVoices,
  savedRussianVoiceName,
  saveRussianVoiceName,
  speakRussian,
} from "../utils/speech";
export const Link = ({
  to,
  children,
  className = "",
}: {
  to: string;
  children: ReactNode;
  className?: string;
}) => (
  <a className={className} href={"#" + to}>
    {children}
  </a>
);
export const Note = ({
  children,
  danger = false,
}: {
  children: ReactNode;
  danger?: boolean;
}) => <div className={"note" + (danger ? " danger" : "")}>{children}</div>;
export function Heading({
  title,
  sub = "",
  back = "home",
}: {
  title: string;
  sub?: string;
  back?: string;
}) {
  return (
    <div className="page-heading">
      <Link to={back} className="back">
        <span aria-label="Назад">←</span>
      </Link>
      <div>
        <p className="eyebrow">BABYGUIDE · РЯДОМ С ВАМИ</p>
        <h1>{title}</h1>
        {sub && <p className="muted">{sub}</p>}
      </div>
    </div>
  );
}
export function Favorite({ id }: { id: string }) {
  const { data, favorite } = useApp();
  const yes = data.favorites.includes(id);
  return (
    <button
      className="secondary"
      aria-pressed={yes}
      onClick={() => favorite(id)}
    >
      {yes ? "♥ В избранном" : "♡ В избранное"}
    </button>
  );
}
export function Disclosure({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <details className="disclosure">
      <summary>{title}</summary>
      {children}
    </details>
  );
}
export function Confirm({
  open,
  title,
  onConfirm,
  onClose,
  action = "Удалить",
  children,
}: {
  open: boolean;
  title: string;
  onConfirm: () => void;
  onClose: () => void;
  action?: string;
  children?: ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    if (open) ref.current?.showModal();
    else ref.current?.close();
  }, [open]);
  return (
    <dialog ref={ref} aria-label={title} onCancel={onClose} onClose={onClose}>
      <h2>{title}</h2>
      <p>{children || "Это действие нельзя отменить."}</p>
      <div className="actions">
        <button className="secondary" onClick={onClose}>
          Отмена
        </button>
        <button
          className="danger-button"
          onClick={() => {
            onConfirm();
            onClose();
          }}
        >
          {action}
        </button>
      </div>
    </dialog>
  );
}
export function DeleteButton({
  id,
  label = "Удалить запись",
}: {
  id: string;
  label?: string;
}) {
  const [open, setOpen] = useState(false);
  const { remove } = useApp();
  return (
    <>
      <button
        className="icon-button"
        aria-label={label}
        onClick={() => setOpen(true)}
      >
        ×
      </button>
      <Confirm
        open={open}
        title="Удалить запись?"
        onClose={() => setOpen(false)}
        onConfirm={() => remove(id)}
      />
    </>
  );
}
export const values = (e: FormEvent<HTMLFormElement>) =>
  Object.fromEntries(new FormData(e.currentTarget)) as Record<string, string>;
export function SourceLinks({ ids }: { ids: string[] }) {
  return (
    <ul className="source-links">
      {ids.map((id) => (
        <li key={id}>
          <a href={id} target="_blank" rel="noopener noreferrer">
            {new URL(id).hostname} · открыть источник ↗
          </a>
        </li>
      ))}
    </ul>
  );
}
export function VoicePicker({ compact = false }: { compact?: boolean }) {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]),
    [selected, setSelected] = useState(savedRussianVoiceName);
  useEffect(() => {
    if (!("speechSynthesis" in window)) return;
    const refresh = () => setVoices(russianVoices());
    refresh();
    window.speechSynthesis.addEventListener("voiceschanged", refresh);
    return () =>
      window.speechSynthesis.removeEventListener("voiceschanged", refresh);
  }, []);
  if (!("speechSynthesis" in window)) return null;
  return (
    <label className={"voice-picker" + (compact ? " compact" : "")}>
      <span>{compact ? "Голос" : "Русский голос для карточек и историй"}</span>
      <select
        value={selected}
        onChange={(event) => {
          const value = event.target.value;
          setSelected(value);
          saveRussianVoiceName(value);
          speakRussian("Привет! Будем играть вместе.", { voiceName: value });
        }}
      >
        <option value="">Авто · мягкий доступный</option>
        {voices.map((voice) => (
          <option key={`${voice.name}-${voice.lang}`} value={voice.name}>
            {voice.name}
            {voice.localService ? " · на устройстве" : ""}
          </option>
        ))}
      </select>
      {!voices.length && (
        <small>Русские голоса появятся, если они установлены на устройстве.</small>
      )}
    </label>
  );
}
export function SpeechButton({
  text,
  label = "Слушать",
}: {
  text: string;
  label?: string;
}) {
  const [playing, setPlaying] = useState(false),
    [error, setError] = useState("");
  useEffect(
    () => () => {
      if ("speechSynthesis" in window) window.speechSynthesis.cancel();
    },
    [],
  );
  function speak() {
    if (!("speechSynthesis" in window)) {
      setError("Синтез речи недоступен. Текст можно прочитать вслух.");
      return;
    }
    if (playing) {
      window.speechSynthesis.cancel();
      setPlaying(false);
      return;
    }
    setError("");
    setPlaying(true);
    const started = speakRussian(text, {
      rate: 0.78,
      pitch: 1.04,
      onEnd: () => setPlaying(false),
      onError: () => {
        setPlaying(false);
        setError(
          "Не удалось озвучить. Для русского голоса может потребоваться загрузка голоса в настройках устройства.",
        );
      },
    });
    if (!started) {
      setPlaying(false);
      setError("Синтез речи недоступен. Текст можно прочитать вслух.");
    }
  }
  return (
    <>
      <button className="secondary" onClick={speak} aria-pressed={playing}>
        {playing ? "■ Остановить" : "▷ " + label}
      </button>
      {error && (
        <p role="alert" className="form-error">
          {error}
        </p>
      )}
    </>
  );
}
export function Steps({ items }: { items: string[] }) {
  return (
    <ol className="visual-steps">
      {items.map((t, i) => (
        <li key={i}>
          <span>{i + 1}</span>
          <p>{t}</p>
        </li>
      ))}
    </ol>
  );
}
export function LineChart({
  points,
  label,
  unit,
  reference,
}: {
  points: { x: number; y: number; label: string }[];
  label: string;
  unit: string;
  reference?: { x: number; y: number }[][];
}) {
  if (!points.length)
    return (
      <div className="empty-chart">
        <span>↗</span>
        <p>Добавьте измерение, чтобы увидеть динамику</p>
      </div>
    );
  const all = [...points, ...(reference || []).flat()],
    minX = Math.min(...all.map((p) => p.x)),
    maxX = Math.max(...all.map((p) => p.x));
  let low = Math.min(...all.map((p) => p.y)) * 0.95,
    high = Math.max(...all.map((p) => p.y)) * 1.05;
  if (high === low) high = low + 1;
  const pos = (p: { x: number; y: number }) => [
    48 + ((p.x - minX) / (maxX - minX || 1)) * 330,
    190 - ((p.y - low) / (high - low)) * 150,
  ];
  return (
    <svg
      className="growth-chart"
      viewBox="0 0 420 240"
      role="img"
      aria-label={label}
    >
      <title>
        {label} · {unit}
      </title>
      {[0, 1, 2, 3].map((i) => (
        <g key={i}>
          <path d={`M48 ${40 + i * 50}H390`} stroke="#e5dcd2" />
          <text x="2" y={44 + i * 50}>
            {(high - ((high - low) * i) / 3).toFixed(1)}
          </text>
        </g>
      ))}
      {reference?.map((line, i) => (
        <polyline
          key={i}
          points={line.map((p) => pos(p).join(",")).join(" ")}
          fill="none"
          stroke={i === 1 ? "#9eb7a7" : "#d4c5b6"}
          strokeDasharray="5 4"
          strokeWidth="1.5"
        />
      ))}
      <polyline
        points={points.map((p) => pos(p).join(",")).join(" ")}
        fill="none"
        stroke="#bd5745"
        strokeWidth="3"
      />
      {points.map((p, i) => (
        <circle key={i} cx={pos(p)[0]} cy={pos(p)[1]} r="5" fill="#bd5745">
          <title>
            {p.label}: {p.y} {unit}
          </title>
        </circle>
      ))}
      <text x="48" y="223">
        {points[0].label}
      </text>
      <text x="385" y="223" textAnchor="end">
        {points.at(-1)?.label}
      </text>
    </svg>
  );
}
