import { useEffect, useRef, useState } from "react";
import { learningCards, cardCategories } from "../data/cards";
import { rhymes } from "../data/rhymes";
import { stories, personalize } from "../data/stories";
import { useApp } from "../hooks/useApp";
import { Repeat } from "./Audio";
import { SpeechButton } from "../components/UI";
function chime(pitch = 660) {
  try {
    const ctx = new AudioContext();
    const osc = ctx.createOscillator(),
      gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = pitch;
    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
    osc.start();
    osc.stop(ctx.currentTime + 0.3);
    osc.onended = () => void ctx.close();
  } catch {
    /* The visible animation and response remain available without audio. */
  }
}
function say(text: string, onError: (m: string) => void) {
  if (!("speechSynthesis" in window)) {
    onError("Голос недоступен на устройстве");
    return;
  }
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = "ru-RU";
  u.rate = 0.8;
  u.onerror = () => onError("Не удалось озвучить. Можно назвать вместе.");
  window.speechSynthesis.speak(u);
}
function ChildCards({ quiz = false }: { quiz?: boolean }) {
  const [category, setCategory] = useState("Животные"),
    [index, setIndex] = useState(0),
    [round, setRound] = useState(0),
    [success, setSuccess] = useState(false),
    [feedback, setFeedback] = useState(""),
    [error, setError] = useState("");
  const touch = useRef(0),
    swiped = useRef(false),
    list = learningCards.filter((c) => c.category === category),
    card = list[index % list.length],
    target = list[round % list.length];
  const options = [
    target,
    ...list.filter((c) => c.id !== target.id).slice(round % 2, (round % 2) + 3),
  ].sort(
    (a, b) =>
      ((a.id.charCodeAt(a.id.length - 1) + round) % 7) -
      ((b.id.charCodeAt(b.id.length - 1) + round) % 7),
  );
  useEffect(
    () => () => {
      if ("speechSynthesis" in window) window.speechSynthesis.cancel();
    },
    [],
  );
  function move(n: number) {
    setIndex((index + n + list.length) % list.length);
    setError("");
  }
  return (
    <>
      <div className="child-category-picker">
        {cardCategories.map((c) => (
          <button
            key={c}
            aria-pressed={category === c}
            className={c === category ? "selected" : ""}
            onClick={() => {
              setCategory(c);
              setIndex(0);
              setRound(0);
              setSuccess(false);
              setFeedback("");
            }}
          >
            {c}
          </button>
        ))}
      </div>
      {quiz ? (
        <>
          <h1>Где {target.word.toLocaleLowerCase("ru")}?</h1>
          <button
            className="child-small"
            onClick={() => say("Где " + target.word + "?", setError)}
          >
            🔊 Послушать
          </button>
          <div className={"quiz-grid " + (success ? "celebrate" : "")}>
            {options.map((c) => (
              <button
                key={c.id}
                className="quiz-option"
                disabled={success}
                aria-label={c.word}
                onClick={() => {
                  if (c.id === target.id) {
                    setSuccess(true);
                    setFeedback("Получилось! ⭐");
                    chime();
                  } else setFeedback("Посмотрим ещё раз ♡");
                }}
              >
                <span>{c.icon}</span>
              </button>
            ))}
          </div>
          <p role="status" className="child-feedback">
            {feedback}
          </p>
          {success && (
            <button
              className="button jumbo"
              onClick={() => {
                setRound(round + 1);
                setSuccess(false);
                setFeedback("");
              }}
            >
              Ещё →
            </button>
          )}
        </>
      ) : (
        <>
          <button
            className="learning-card"
            onClick={() => {
              if (swiped.current) {
                swiped.current = false;
                return;
              }
              say(card.word, setError);
            }}
            onPointerDown={(e) => {
              touch.current = e.clientX;
              swiped.current = false;
            }}
            onPointerUp={(e) => {
              if (Math.abs(e.clientX - touch.current) > 50) {
                swiped.current = true;
                move(e.clientX < touch.current ? 1 : -1);
              }
            }}
            aria-label={"Озвучить: " + card.word}
          >
            <span>{card.icon}</span>
            <h1>{card.word}</h1>
            <small>Нажми · послушай</small>
          </button>
          <div className="child-controls">
            <button aria-label="Предыдущая карточка" onClick={() => move(-1)}>
              ←
            </button>
            <span>
              {(index % list.length) + 1} / {list.length}
            </span>
            <button aria-label="Следующая карточка" onClick={() => move(1)}>
              →
            </button>
          </div>
          {card.sound && (
            <button
              className="button jumbo"
              onClick={() => say(card.sound!, setError)}
            >
              🔊 {card.sound}
            </button>
          )}
          <p className="small muted">Звуки — голосовые звукоподражания.</p>
        </>
      )}
      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
    </>
  );
}
function ChildActions() {
  const [action, setAction] = useState("ball"),
    [bounce, setBounce] = useState(false),
    [bubbles, setBubbles] = useState<number[]>([]),
    [box, setBox] = useState(false);
  return (
    <>
      <h1>Нажми и посмотри!</h1>
      <div className="child-category-picker">
        {[
          ["ball", "⚽ Мяч"],
          ["bubbles", "🫧 Пузыри"],
          ["box", "📦 Коробочка"],
          ["music", "🎵 Музыка"],
        ].map(([id, label]) => (
          <button
            className={action === id ? "selected" : ""}
            key={id}
            onClick={() => setAction(id)}
            aria-pressed={action === id}
          >
            {label}
          </button>
        ))}
      </div>
      {action === "ball" && (
        <button
          className={"action-ball " + (bounce ? "bounce" : "")}
          aria-label="Подбросить мяч"
          onClick={() => {
            setBounce(false);
            requestAnimationFrame(() => setBounce(true));
            chime(440);
          }}
          onAnimationEnd={() => setBounce(false)}
        >
          ⚽
        </button>
      )}
      {action === "bubbles" && (
        <>
          <div className="bubble-grid">
            {Array.from({ length: 9 }, (_, i) => (
              <button
                key={i}
                className={bubbles.includes(i) ? "popped" : ""}
                aria-label={"Лопнуть пузырь " + (i + 1)}
                disabled={bubbles.includes(i)}
                onClick={() => {
                  setBubbles([...bubbles, i]);
                  chime(500 + i * 70);
                }}
              >
                🫧
              </button>
            ))}
          </div>
          <button className="button jumbo" onClick={() => setBubbles([])}>
            Новые пузыри
          </button>
        </>
      )}
      {action === "box" && (
        <>
          <button
            className="action-box"
            onClick={() => {
              setBox(!box);
              chime(box ? 330 : 660);
            }}
            aria-label={box ? "Закрыть коробочку" : "Открыть коробочку"}
          >
            {box ? "🧸" : "📦"}
          </button>
          <p className="child-feedback">
            {box ? "Мишка здесь!" : "Кто внутри?"}
          </p>
        </>
      )}
      {action === "music" && (
        <div className="music-keys">
          {[262, 294, 330, 349, 392, 440, 494].map((hz, i) => (
            <button
              key={hz}
              onClick={() => chime(hz)}
              aria-label={"Нота " + (i + 1)}
            >
              {["До", "Ре", "Ми", "Фа", "Соль", "Ля", "Си"][i]}
            </button>
          ))}
        </div>
      )}
    </>
  );
}
function ChildReading({ kind, id }: { kind: "rhyme" | "story"; id?: string }) {
  const { data } = useApp(),
    [index, setIndex] = useState(0),
    [page, setPage] = useState(0);
  const list = kind === "rhyme" ? rhymes : stories;
  const current = list.find((r) => r.id === id) || list[index % list.length];
  if (kind === "rhyme") {
    const r = rhymes.find((r) => r.id === current.id)!;
    return (
      <>
        <div className="child-book-visual">{r.icon}</div>
        <h1>{r.title}</h1>
        <p className="child-poem">{r.text}</p>
        <SpeechButton text={r.text} label="Слушать потешку" />
        <p className="child-reading-help">{r.movement.join(". ")}</p>
        <div className="child-controls">
          <button
            aria-label="Предыдущая потешка"
            onClick={() => {
              location.hash = "child/rhymes";
              setIndex((index - 1 + rhymes.length) % rhymes.length);
            }}
          >
            ←
          </button>
          <span>
            {index + 1} / {rhymes.length}
          </span>
          <button
            aria-label="Следующая потешка"
            onClick={() => {
              location.hash = "child/rhymes";
              setIndex((index + 1) % rhymes.length);
            }}
          >
            →
          </button>
        </div>
      </>
    );
  }
  const s = stories.find((s) => s.id === current.id)!,
    text = personalize(s.paragraphs[page], data.profile.name, data.profile.toy);
  return (
    <>
      <div className="child-book-visual">
        {s.icon}
        <span>{["🌤", "🤲", "🌱", "♡", "🏡"][page]}</span>
      </div>
      <h1>{s.title}</h1>
      <p className="child-story-text">{text}</p>
      <SpeechButton key={text} text={text} label="Слушать страницу" />
      <div className="child-controls">
        <button
          disabled={page === 0}
          aria-label="Предыдущая страница"
          onClick={() => setPage(page - 1)}
        >
          ←
        </button>
        <span>
          {page + 1} / {s.paragraphs.length}
        </span>
        <button
          disabled={page === s.paragraphs.length - 1}
          aria-label="Следующая страница"
          onClick={() => setPage(page + 1)}
        >
          →
        </button>
      </div>
      {page === s.paragraphs.length - 1 && (
        <button
          className="button jumbo"
          onClick={() => {
            location.hash = "child/stories";
            setIndex((index + 1) % stories.length);
            setPage(0);
          }}
        >
          Другая история →
        </button>
      )}
    </>
  );
}
export function Child({ path, onExit }: { path: string; onExit: () => void }) {
  const [gate, setGate] = useState(false),
    [answer, setAnswer] = useState(""),
    [gateError, setGateError] = useState(""),
    [numbers, setNumbers] = useState([12, 7]);
  const [screen, id] = path.replace(/^child\/?/, "").split("/");
  const ref = useRef<HTMLDialogElement>(null);
  function openGate() {
    setNumbers([
      11 + Math.floor(Math.random() * 9),
      5 + Math.floor(Math.random() * 8),
    ]);
    setAnswer("");
    setGateError("");
    setGate(true);
  }
  useEffect(() => {
    if (gate) ref.current?.showModal();
    else ref.current?.close();
  }, [gate]);
  const home = () => {
    location.hash = "child";
  };
  return (
    <div className="child-shell">
      <header className="child-topbar">
        <button
          className="child-home"
          aria-label="Главная детского режима"
          onClick={home}
        >
          🏠
        </button>
        <span>BabyGuide · играем вместе</span>
        <button className="child-parent" onClick={openGate}>
          Для взрослого 🔒
        </button>
      </header>
      <main key={path} className="child-main">
        {!screen ? (
          <>
            <h1>Во что поиграем?</h1>
            <p>Вместе со взрослым · коротко и с паузами</p>
            <div className="child-menu">
              {[
                ["cards", "🐱", "Карточки"],
                ["quiz", "🔎", "Где…?"],
                ["actions", "🫧", "Нажми!"],
                ["repeat", "🦜", "Повторюшка"],
                ["rhymes", "👏", "Потешки"],
                ["stories", "📖", "Истории"],
              ].map(([route, icon, title]) => (
                <button
                  key={route}
                  onClick={() => (location.hash = "child/" + route)}
                >
                  <span>{icon}</span>
                  <strong>{title}</strong>
                </button>
              ))}
            </div>
            <p className="small muted">
              Без рекламы, покупок и внешних переходов. Экран не заменяет живую
              игру; для детей младше 18 месяцев лучше занятия без экрана, кроме
              общения с близкими.
            </p>
          </>
        ) : screen === "cards" ? (
          <ChildCards />
        ) : screen === "quiz" ? (
          <ChildCards quiz />
        ) : screen === "actions" ? (
          <ChildActions />
        ) : screen === "repeat" ? (
          <Repeat child />
        ) : screen === "rhymes" || screen === "rhyme" ? (
          <ChildReading kind="rhyme" id={id} />
        ) : screen === "stories" || screen === "story" ? (
          <ChildReading kind="story" id={id} />
        ) : (
          <button className="button jumbo" onClick={home}>
            Вернуться к играм
          </button>
        )}
      </main>
      <dialog
        ref={ref}
        aria-label="Выход для взрослого"
        onCancel={() => setGate(false)}
        onClose={() => setGate(false)}
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (Number(answer) === numbers[0] + numbers[1]) {
              setGate(false);
              onExit();
            } else setGateError("Ответ не совпал. Попробуйте ещё раз.");
          }}
        >
          <h2>Для взрослого</h2>
          <p>Чтобы выйти к настройкам и здоровью, решите пример:</p>
          <label>
            {numbers[0]} + {numbers[1]} =
            <input
              type="number"
              inputMode="numeric"
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              required
              autoComplete="off"
              aria-label="Ответ на пример"
            />
          </label>
          <p className="form-error" role="alert">
            {gateError}
          </p>
          <div className="actions">
            <button
              type="button"
              className="secondary"
              onClick={() => setGate(false)}
            >
              Остаться играть
            </button>
            <button className="button">Выйти к маме</button>
          </div>
        </form>
      </dialog>
    </div>
  );
}
