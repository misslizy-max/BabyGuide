import { useEffect, useMemo, useRef, useState } from "react";
import { Confirm, SpeechButton } from "../components/UI";
import { learningCards, cardCategories } from "../data/cards";
import { rhymes } from "../data/rhymes";
import { stories, personalize } from "../data/stories";
import { useApp } from "../hooks/useApp";
import { playPianoNote, playPop, playReveal, playSuccess } from "../services/sound";
import { speakRussian } from "../utils/speech";
import { Repeat } from "./Audio";

const notes = [
  { name: "До", hz: 261.63, tone: "peach" },
  { name: "Ре", hz: 293.66, tone: "sage" },
  { name: "Ми", hz: 329.63, tone: "lavender" },
  { name: "Фа", hz: 349.23, tone: "sage" },
  { name: "Соль", hz: 392, tone: "peach" },
  { name: "Ля", hz: 440, tone: "lavender" },
  { name: "Си", hz: 493.88, tone: "peach" },
];

function KidIllustration({ kind }: { kind: "piano" | "bubbles" | "box" | "cards" }) {
  if (kind === "piano")
    return (
      <svg className="kid-hero-svg" viewBox="0 0 420 210" role="img" aria-label="Цветное пианино">
        <rect x="58" y="48" width="304" height="118" rx="28" fill="#F2E8DA" />
        {[0, 1, 2, 3, 4, 5, 6].map((i) => (
          <rect key={i} x={74 + i * 40} y="78" width="34" height="70" rx="12" fill={["#E8C59E", "#BBCBAF", "#D2BADB"][i % 3]} />
        ))}
        <path d="M105 55c20-22 40-22 60 0M260 47c15-18 30-18 45 0" fill="none" stroke="#9D7F6F" strokeWidth="5" strokeLinecap="round" />
        <circle cx="91" cy="48" r="8" fill="#C57E67" />
        <circle cx="320" cy="37" r="8" fill="#879D78" />
      </svg>
    );
  if (kind === "bubbles")
    return (
      <svg className="kid-hero-svg" viewBox="0 0 420 210" role="img" aria-label="Большие и маленькие пузыри">
        {[{x:90,y:105,r:45},{x:185,y:68,r:28},{x:280,y:118,r:54},{x:340,y:58,r:22}].map((b, i) => (
          <g key={i}>
            <circle cx={b.x} cy={b.y} r={b.r} fill={["#DCEAF2","#E8D9EE","#E1EBD9"][i%3]} stroke="#FFFFFF" strokeWidth="6" />
            <circle cx={b.x-b.r/3} cy={b.y-b.r/3} r={Math.max(5,b.r/7)} fill="#FFFFFFAA" />
          </g>
        ))}
      </svg>
    );
  if (kind === "box")
    return (
      <svg className="kid-hero-svg" viewBox="0 0 420 210" role="img" aria-label="Коробка с игрушками">
        <path d="M110 88h200v82H110z" fill="#D6B184" />
        <path d="M100 82l75-42h145l-55 42z" fill="#E8CFAF" />
        <circle cx="196" cy="85" r="34" fill="#D9B4A8" />
        <circle cx="226" cy="82" r="28" fill="#B8C9AD" />
        <circle cx="176" cy="65" r="10" fill="#8F765F" />
        <circle cx="246" cy="61" r="9" fill="#8F765F" />
      </svg>
    );
  return (
    <svg className="kid-hero-svg" viewBox="0 0 420 210" role="img" aria-label="Карточки с предметами">
      <rect x="70" y="40" width="120" height="140" rx="22" fill="#E5EEDC" />
      <rect x="230" y="40" width="120" height="140" rx="22" fill="#F2DFD7" />
      <circle cx="130" cy="103" r="34" fill="#A5BD91" />
      <path d="M107 100h46M130 77v46" stroke="#fff" strokeWidth="8" strokeLinecap="round" />
      <path d="M275 128c0-30 16-52 34-52s34 22 34 52" fill="#C58A72" />
      <circle cx="292" cy="96" r="5" fill="#4E443D" />
      <circle cx="326" cy="96" r="5" fill="#4E443D" />
    </svg>
  );
}

function PianoGame() {
  const [mode, setMode] = useState<"free" | "echo">("free");
  const [target, setTarget] = useState<number[]>([0, 2]);
  const [progress, setProgress] = useState(0);
  const [active, setActive] = useState<number | null>(null);

  async function tap(i: number) {
    setActive(i);
    await playPianoNote(notes[i].hz);
    setTimeout(() => setActive(null), 180);
    if (mode === "echo") {
      if (target[progress] === i) {
        const next = progress + 1;
        if (next === target.length) {
          await playSuccess();
          setProgress(0);
          setTarget((old) => [(old[0] + 1) % 7, (old[1] + 2) % 7]);
        } else setProgress(next);
      } else setProgress(0);
    }
  }

  async function demo() {
    for (let i = 0; i < target.length; i += 1) {
      await playPianoNote(notes[target[i]].hz, 0.35);
      await new Promise((resolve) => setTimeout(resolve, 430));
    }
  }

  return (
    <section className="kid-game-stage">
      <KidIllustration kind="piano" />
      <div className="kid-game-copy">
        <p className="kid-kicker">СЛУХ · ПРИЧИНА И СЛЕДСТВИЕ</p>
        <h1>Музыкальные клавиши</h1>
        <p>{mode === "free" ? "Нажми клавишу — она загорится и прозвучит." : "Послушай две ноты и попробуй нажать их по порядку."}</p>
      </div>
      <div className="kid-mode-tabs">
        <button className={mode === "free" ? "selected" : ""} onClick={() => setMode("free")}>Играть</button>
        <button className={mode === "echo" ? "selected" : ""} onClick={() => { setMode("echo"); setProgress(0); }}>Повтори 2 ноты</button>
      </div>
      {mode === "echo" && (
        <button className="kid-demo-button" onClick={() => void demo()}>▶ Послушать пример</button>
      )}
      <div className="kid-piano" aria-label="Пианино">
        {notes.map((note, i) => (
          <button
            key={note.name}
            className={`${note.tone} ${active === i ? "active" : ""}`}
            onPointerDown={() => void tap(i)}
            aria-label={`Нота ${note.name}`}
          >
            <span>{note.name}</span>
            {mode === "echo" && target[progress] === i && <i aria-hidden="true">•</i>}
          </button>
        ))}
      </div>
    </section>
  );
}

function BubbleGame() {
  const initial = useMemo(() => [
    { id: 1, size: 84, label: "большой" },
    { id: 2, size: 50, label: "маленький" },
    { id: 3, size: 68, label: "средний" },
    { id: 4, size: 42, label: "маленький" },
    { id: 5, size: 92, label: "большой" },
    { id: 6, size: 58, label: "средний" },
  ], []);
  const [bubbles, setBubbles] = useState(initial);
  const [task, setTask] = useState<"free" | "big">("free");
  const [message, setMessage] = useState("Лопай пузырьки");

  async function pop(id: number, size: number, label: string) {
    await playPop(size / 70);
    setBubbles((old) => old.filter((bubble) => bubble.id !== id));
    if (task === "big") {
      if (label === "большой") {
        setMessage("Да! Это большой пузырь");
        void playSuccess();
      } else setMessage("Попробуй найти большой");
    }
  }

  return (
    <section className="kid-game-stage">
      <KidIllustration kind="bubbles" />
      <div className="kid-game-copy">
        <p className="kid-kicker">РАЗМЕР · ТОЧНОСТЬ КАСАНИЯ</p>
        <h1>Пузырьки</h1>
        <p>{message}</p>
      </div>
      <div className="kid-mode-tabs">
        <button className={task === "free" ? "selected" : ""} onClick={() => { setTask("free"); setMessage("Лопай пузырьки"); }}>Свободно</button>
        <button className={task === "big" ? "selected" : ""} onClick={() => { setTask("big"); setMessage("Найди большой пузырь"); }}>Найди большой</button>
      </div>
      <div className="kid-bubble-field">
        {bubbles.map((bubble, i) => (
          <button
            key={bubble.id}
            className={`kid-bubble bubble-${i % 3}`}
            style={{ width: bubble.size, height: bubble.size }}
            onClick={() => void pop(bubble.id, bubble.size, bubble.label)}
            aria-label={`${bubble.label} пузырь`}
          >
            <span />
          </button>
        ))}
      </div>
      <button className="kid-demo-button" onClick={() => { setBubbles(initial); setMessage(task === "big" ? "Найди большой пузырь" : "Лопай пузырьки"); }}>Новые пузырьки</button>
    </section>
  );
}

function BoxGame() {
  const objects = [
    { name: "Мяч", color: "#D9A17F", shape: "●" },
    { name: "Кубик", color: "#AABF9B", shape: "■" },
    { name: "Звезда", color: "#CBB6DA", shape: "★" },
  ];
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);
  const current = objects[index % objects.length];

  async function toggle() {
    const next = !open;
    setOpen(next);
    await playReveal(next);
    if (!next) setIndex((value) => (value + 1) % objects.length);
  }

  return (
    <section className="kid-game-stage">
      <KidIllustration kind="box" />
      <div className="kid-game-copy">
        <p className="kid-kicker">ПОСТОЯНСТВО ОБЪЕКТА · СЛОВАРЬ</p>
        <h1>Что в коробке?</h1>
        <p>{open ? `${current.name}! Закрой коробку — появится новый предмет.` : "Нажми на коробку и посмотри, что спряталось."}</p>
      </div>
      <button className={`kid-box ${open ? "open" : ""}`} onClick={() => void toggle()} aria-label={open ? "Закрыть коробку" : "Открыть коробку"}>
        <span className="kid-box-lid" />
        <span className="kid-box-body" />
        {open && <strong style={{ color: current.color }}>{current.shape}</strong>}
      </button>
    </section>
  );
}

function CardGame() {
  const [category, setCategory] = useState(cardCategories[0]);
  const cards = learningCards.filter((card) => card.category === category);
  const [index, setIndex] = useState(0);
  const card = cards[index % Math.max(cards.length, 1)];
  const [listeningError, setListeningError] = useState("");

  function sayCard() {
    if (!card) return;
    const ok = speakRussian(`${card.word}. ${card.sound || ""}`, { rate: 0.72, pitch: 1.02, onError: () => setListeningError("Голос устройства недоступен") });
    if (!ok) setListeningError("Голос устройства недоступен");
  }

  if (!card) return null;
  return (
    <section className="kid-game-stage">
      <KidIllustration kind="cards" />
      <div className="kid-game-copy">
        <p className="kid-kicker">СЛОВАРЬ · СОВМЕСТНОЕ ВНИМАНИЕ</p>
        <h1>Большие карточки</h1>
        <p>Рассматривайте вместе. Назовите предмет один раз и дайте время посмотреть.</p>
      </div>
      <div className="kid-category-scroll">
        {cardCategories.map((item) => <button key={item} className={item === category ? "selected" : ""} onClick={() => { setCategory(item); setIndex(0); }}>{item}</button>)}
      </div>
      <button className="kid-picture-card" onClick={sayCard} aria-label={`Озвучить ${card.word}`}>
        <div className={`kid-picture kid-picture-${index % 4}`} aria-hidden="true">
          <span className="kid-picture-main">{card.icon}</span>
        </div>
        <strong>{card.word}</strong>
        <small>Нажми, чтобы услышать</small>
      </button>
      <div className="kid-card-nav">
        <button onClick={() => setIndex((index - 1 + cards.length) % cards.length)}>←</button>
        <span>{index + 1} / {cards.length}</span>
        <button onClick={() => setIndex((index + 1) % cards.length)}>→</button>
      </div>
      {listeningError && <p className="form-error">{listeningError}</p>}
    </section>
  );
}

function Reading({ type, id }: { type: "rhyme" | "story"; id?: string }) {
  const { data } = useApp();
  const [page, setPage] = useState(0);
  if (type === "rhyme") {
    const item = rhymes.find((r) => r.id === id) || rhymes[0];
    return (
      <section className="kid-reading-v3">
        <div className="kid-reading-art"><span>{item.icon}</span><i /></div>
        <h1>{item.title}</h1>
        <p className="kid-poem">{item.text}</p>
        <SpeechButton text={item.text} label="Слушать" />
        <div className="kid-reading-steps">{item.movement.slice(0, 3).map((step, i) => <div key={step}><b>{i + 1}</b><span>{step}</span></div>)}</div>
      </section>
    );
  }
  const story = stories.find((s) => s.id === id) || stories[0];
  const text = personalize(story.paragraphs[page], data.profile.name, data.profile.toy);
  return (
    <section className="kid-reading-v3">
      <div className="kid-reading-art story"><span>{story.icon}</span><i /></div>
      <h1>{story.title}</h1>
      <p>{text}</p>
      <SpeechButton text={text} label="Слушать страницу" />
      <div className="kid-card-nav">
        <button disabled={page === 0} onClick={() => setPage(page - 1)}>←</button>
        <span>{page + 1} / {story.paragraphs.length}</span>
        <button disabled={page === story.paragraphs.length - 1} onClick={() => setPage(page + 1)}>→</button>
      </div>
    </section>
  );
}

export function ChildV3({ path, onExit }: { path: string; onExit: () => void }) {
  const { data } = useApp();
  const [confirmExit, setConfirmExit] = useState(false);
  const [holding, setHolding] = useState(false);
  const hold = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [screen, id] = path.replace(/^child\/?/, "").split("/");

  function clearHold() {
    if (hold.current) clearTimeout(hold.current);
    hold.current = null;
    setHolding(false);
  }
  function startHold() {
    clearHold();
    setHolding(true);
    hold.current = setTimeout(() => { setHolding(false); setConfirmExit(true); }, 1800);
  }
  useEffect(() => () => clearHold(), []);

  return (
    <div className="child-v3-shell">
      <header className="child-v3-topbar">
        <button className="child-v3-home" onClick={() => (location.hash = "child")} aria-label="На главную детского режима">
          <span aria-hidden="true" className="mini-house"><i /><b /></span>
        </button>
        <div><strong>BabyGuide</strong><span>· {data.profile.name || "малыш"}</span></div>
        <button
          className={`child-v3-parent ${holding ? "holding" : ""}`}
          onPointerDown={startHold}
          onPointerUp={clearHold}
          onPointerCancel={clearHold}
          onPointerLeave={clearHold}
          aria-label="Удерживайте, чтобы вернуться к маме"
        >
          <strong>Мама</strong><small>{holding ? "ещё чуть-чуть…" : "удерживать"}</small>
        </button>
      </header>

      <main className="child-v3-main">
        {!screen ? (
          <>
            <section className="kid-home-hero">
              <div className="kid-sun" /><div className="kid-hill hill-one" /><div className="kid-hill hill-two" />
              <div className="kid-home-copy"><p>ИГРАЕМ ВМЕСТЕ</p><h1>Что выберем?</h1><span>Короткие игры без рекламы и лишних кнопок</span></div>
            </section>
            <div className="kid-home-grid">
              {[
                ["actions/piano", "Музыка", "слух и ритм", "music"],
                ["actions/bubbles", "Пузырьки", "размер и касание", "bubble"],
                ["actions/box", "Коробочка", "что спряталось", "box"],
                ["cards", "Карточки", "слова и предметы", "cards"],
                ["repeat", "Повторюшка", "слушаем речь", "repeat"],
                ["rhymes", "Потешки", "ритм и движения", "rhymes"],
              ].map(([route, title, sub, visual]) => (
                <button key={route} onClick={() => (location.hash = `child/${route}`)} className={`kid-home-tile tile-${visual}`}>
                  <span className="kid-tile-art" aria-hidden="true"><i /><b /><em /></span>
                  <strong>{title}</strong><small>{sub}</small>
                </button>
              ))}
            </div>
            <p className="kid-screen-note">Для малышей экран — только короткое совместное занятие со взрослым. Чередуйте его с живой игрой, движением и общением.</p>
          </>
        ) : screen === "actions" && id === "piano" ? <PianoGame />
          : screen === "actions" && id === "bubbles" ? <BubbleGame />
          : screen === "actions" && id === "box" ? <BoxGame />
          : screen === "cards" ? <CardGame />
          : screen === "repeat" ? <Repeat child />
          : screen === "rhymes" || screen === "rhyme" ? <Reading type="rhyme" id={id} />
          : screen === "stories" || screen === "story" ? <Reading type="story" id={id} />
          : <button className="button jumbo" onClick={() => (location.hash = "child")}>Вернуться к играм</button>}
      </main>

      <Confirm open={confirmExit} title="Вернуться к маме?" action="Да, к маме" onClose={() => setConfirmExit(false)} onConfirm={onExit}>
        Детский режим закроется, а дневник, питание и гайды снова станут доступны.
      </Confirm>
    </div>
  );
}
