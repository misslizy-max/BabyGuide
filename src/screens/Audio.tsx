import { useEffect, useRef, useState } from "react";
import { useRecorder } from "../hooks/useRecorder";
import { useApp } from "../hooks/useApp";
import { Heading, Link, Note, Confirm, values } from "../components/UI";
import { newEvent } from "../services/persistence";
import { putAudio, getAudio, deleteAudio } from "../services/audio";
import { today, months, formatDate } from "../utils/dates";
export function Repeat({ child = false }: { child?: boolean }) {
  const rec = useRecorder();
  const [mode, setMode] = useState("normal"),
    [playing, setPlaying] = useState(false),
    [playError, setPlayError] = useState("");
  const audio = useRef<HTMLAudioElement | null>(null),
    url = useRef("");
  function clearPlayback() {
    audio.current?.pause();
    if (url.current) URL.revokeObjectURL(url.current);
    audio.current = null;
    url.current = "";
  }
  function play() {
    if (!rec.blob) return;
    clearPlayback();
    url.current = URL.createObjectURL(rec.blob);
    const a = new Audio(url.current);
    audio.current = a;
    if (mode === "funny" && "preservesPitch" in a) {
      a.preservesPitch = false;
      a.playbackRate = 1.3;
    }
    a.onended = () => {
      setPlaying(false);
      clearPlayback();
      rec.discard();
    };
    a.onerror = () => {
      setPlaying(false);
      setPlayError("Не удалось воспроизвести эту запись. Попробуйте ещё раз.");
      clearPlayback();
      rec.discard();
    };
    void a
      .play()
      .then(() => {
        setPlaying(true);
        setPlayError("");
      })
      .catch(() => {
        setPlaying(false);
        setPlayError(
          "Нажмите «Воспроизвести»: браузер остановил автоматический звук.",
        );
      });
  }
  useEffect(() => {
    if (rec.blob) play();
    return clearPlayback;
  }, [rec.blob]);
  const text =
    rec.state === "permission"
      ? "Разрешите микрофон"
      : rec.state === "listening"
        ? "Говори, я слушаю"
        : playing
          ? "Повторяю!"
          : mode === "word"
            ? "Скажи: мама"
            : "Повторю за тобой";
  return (
    <>
      {child && <h1>Повторюшка</h1>}
      {!child && (
        <Heading
          title="Повторюшка"
          sub="Один голосовой цикл: запись → остановка → повтор"
          back="words"
        />
      )}
      <section className="repeat-screen">
        <div className={"repeat-character " + (playing ? "is-playing" : "")}>
          {playing ? "🦜" : rec.state === "listening" ? "👂" : "🐻"}
        </div>
        <h2 role="status">{text}</h2>
        <p>
          Микрофон включается только по нажатию. Максимум 8 секунд или до паузы
          после голоса. Во время повтора микрофон выключен.
        </p>
        <div className="segmented">
          {[
            ["normal", "Повтори меня"],
            ["funny", "Смешной голос"],
            ["word", "Скажи слово"],
          ].map(([v, n]) => (
            <button
              key={v}
              disabled={
                playing || ["listening", "permission"].includes(rec.state)
              }
              className={mode === v ? "selected" : ""}
              aria-pressed={mode === v}
              onClick={() => setMode(v)}
            >
              {n}
            </button>
          ))}
        </div>
        {rec.state === "listening" ? (
          <button className="button jumbo" onClick={rec.stop}>
            ■ Закончить
          </button>
        ) : (
          <button
            className="button jumbo"
            disabled={playing || rec.state === "permission"}
            onClick={() => void rec.start()}
          >
            🎙{" "}
            {rec.state === "permission"
              ? "Ждём разрешение"
              : "Разрешить микрофон и сказать"}
          </button>
        )}
        {rec.blob && !playing && (
          <button className="secondary" onClick={play}>
            ▷ Воспроизвести
          </button>
        )}
        {(rec.blob || playing) && (
          <button
            className="secondary"
            onClick={() => {
              clearPlayback();
              setPlaying(false);
              rec.discard();
            }}
          >
            Остановить и удалить
          </button>
        )}
        {(rec.error || playError) && (
          <p role="alert" className="form-error">
            {rec.error || playError}
          </p>
        )}
        <p className="small muted">
          Запись остаётся только в памяти этой вкладки и удаляется после
          воспроизведения или выхода. Она не отправляется на сервер. «Смешной
          голос» меняет скорость и тон там, где браузер поддерживает отключение
          сохранения тона.
        </p>
      </section>
    </>
  );
}
export function AudioPlayer({ id }: { id: string }) {
  const [url, setUrl] = useState(""),
    [error, setError] = useState("");
  const current = useRef("");
  useEffect(
    () => () => {
      if (current.current) URL.revokeObjectURL(current.current);
    },
    [id],
  );
  async function load() {
    try {
      const blob = await getAudio(id);
      if (!blob) throw Error("Запись не найдена на этом устройстве");
      current.current = URL.createObjectURL(blob);
      setUrl(current.current);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Аудио недоступно");
    }
  }
  return (
    <>
      {url ? (
        <audio
          controls
          src={url}
          preload="metadata"
          aria-label="Запись первого слова"
        />
      ) : (
        <button className="secondary" onClick={() => void load()}>
          ▷ Открыть аудио
        </button>
      )}
      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
    </>
  );
}
export function Words() {
  const { data, add, remove, notify } = useApp();
  const rec = useRecorder();
  const [error, setError] = useState(""),
    [deleting, setDeleting] = useState<string | null>(null),
    [saving, setSaving] = useState(false),
    [clipUrl, setClipUrl] = useState("");
  useEffect(() => {
    if (!rec.blob) {
      setClipUrl("");
      return;
    }
    const u = URL.createObjectURL(rec.blob);
    setClipUrl(u);
    return () => URL.revokeObjectURL(u);
  }, [rec.blob]);
  const rows = data.events
    .filter((e) => e.kind === "Первое слово")
    .sort((a, b) => b.time.localeCompare(a.time));
  return (
    <>
      <Heading
        title="Мои первые слова"
        sub="Личный аудиодневник · сохранение только по вашему действию"
        back="speech"
      />
      <Note>
        Микрофон не включается при открытии. Сначала запишите, прослушайте и
        отдельно нажмите «Сохранить слово». До сохранения аудио живёт только в
        памяти и исчезнет при выходе.
      </Note>
      <form
        className="form-card"
        onSubmit={async (e) => {
          e.preventDefault();
          const form = e.currentTarget,
            f = values(e);
          setSaving(true);
          let audioId: string | undefined;
          try {
            if (rec.blob) {
              audioId = crypto.randomUUID();
              await putAudio(audioId, rec.blob);
            }
            if (
              add(
                newEvent("Первое слово", f.comment, {
                  time: f.date + "T12:00",
                  word: f.word,
                  audioId,
                }),
              )
            ) {
              notify("Первое слово сохранено");
              rec.discard();
              form.reset();
              setError("");
            } else if (audioId) await deleteAudio(audioId);
          } catch {
            setError(
              "Не удалось сохранить аудио в локальном хранилище. Освободите место или сохраните слово без записи.",
            );
          } finally {
            setSaving(false);
          }
        }}
      >
        <h2>Новое слово</h2>
        <label>
          Слово
          <input name="word" maxLength={100} required />
        </label>
        <label>
          Дата
          <input
            name="date"
            type="date"
            defaultValue={today()}
            max={today()}
            required
          />
        </label>
        <label>
          Комментарий
          <textarea name="comment" maxLength={1000} />
        </label>
        <div className="recorder-box">
          <p role="status">
            {rec.state === "listening"
              ? "Слушаю · скажите слово"
              : rec.state === "permission"
                ? "Ожидаем разрешение микрофона"
                : rec.blob
                  ? "Запись готова к прослушиванию"
                  : "Аудио необязательно"}
          </p>
          {rec.state === "listening" ? (
            <button type="button" className="secondary" onClick={rec.stop}>
              ■ Остановить запись
            </button>
          ) : (
            <button
              type="button"
              className="secondary"
              disabled={saving || rec.state === "permission"}
              onClick={() => void rec.start()}
            >
              🎙 Записать голос
            </button>
          )}
          {clipUrl && (
            <>
              <audio
                src={clipUrl}
                controls
                aria-label="Прослушать перед сохранением"
              />
              <button
                type="button"
                className="text-button destructive"
                onClick={rec.discard}
              >
                Удалить несохранённую запись
              </button>
            </>
          )}
          {rec.error && (
            <p className="form-error" role="alert">
              {rec.error}
            </p>
          )}
        </div>
        <button
          className="button"
          disabled={saving || ["listening", "permission"].includes(rec.state)}
        >
          {saving ? "Сохраняем…" : "Сохранить слово"}
        </button>
        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}
      </form>
      <Link to="repeat" className="secondary">
        Открыть «Повторюшку» без сохранения →
      </Link>
      <section className="section">
        <h2>История первых слов</h2>
        {rows.map((e) => (
          <article className="entry" key={e.id}>
            <div className="section-title">
              <h3>{e.word || e.text}</h3>
              <button
                className="icon-button"
                aria-label="Удалить первое слово"
                onClick={() => setDeleting(e.id)}
              >
                ×
              </button>
            </div>
            <p className="tag">
              {formatDate(e.time)} ·{" "}
              {data.profile.birth
                ? (months(data.profile.birth, new Date(e.time)) ?? "—") +
                  " мес."
                : "возраст не указан"}
            </p>
            <p>{e.text}</p>
            {e.audioId && <AudioPlayer id={e.audioId} />}
          </article>
        ))}
        {!rows.length && (
          <Note>
            Здесь появятся слово, дата, возраст, комментарий и сохранённый
            голос.
          </Note>
        )}
      </section>
      <Confirm
        open={!!deleting}
        title="Удалить слово и его аудио?"
        onClose={() => setDeleting(null)}
        onConfirm={() => {
          const entry = rows.find((e) => e.id === deleting);
          if (!entry) return;
          void (async () => {
            try {
              remove(entry.id);
            } catch {
              notify("Не удалось удалить аудио. Запись оставлена в дневнике.");
            }
          })();
        }}
      />
    </>
  );
}
