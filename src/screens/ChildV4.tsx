import { useEffect, useMemo, useRef, useState } from "react";
import { AnimalPhotoCard } from "../components/AnimalPhotoCard";
import { CardArtV3 } from "../components/CardArtV3";
import { Confirm } from "../components/UI";
import { learningCards, cardCategories } from "../data/cards";
import { rhymes } from "../data/rhymes";
import { stories, personalize } from "../data/stories";
import { useApp } from "../hooks/useApp";
import { playAnimalSound } from "../services/animalSounds";
import { neuralVoiceEnabled, speakNaturalRussian, stopNaturalVoice } from "../services/neuralVoice";
import { playPianoNote, playPop, playReveal, playSuccess } from "../services/sound";
import { Repeat } from "./Audio";

const whiteKeys = [
  ["До", 261.63], ["Ре", 293.66], ["Ми", 329.63], ["Фа", 349.23], ["Соль", 392], ["Ля", 440], ["Си", 493.88],
  ["До", 523.25], ["Ре", 587.33], ["Ми", 659.25], ["Фа", 698.46], ["Соль", 783.99], ["Ля", 880], ["Си", 987.77],
] as const;
const blackKeys = [
  [0.72, 277.18], [1.72, 311.13], [3.72, 369.99], [4.72, 415.3], [5.72, 466.16],
  [7.72, 554.37], [8.72, 622.25], [10.72, 739.99], [11.72, 830.61], [12.72, 932.33],
] as const;

function NaturalTalk({ text, label = "Слушать" }: { text: string; label?: string }) {
  const [error, setError] = useState("");
  const [playing, setPlaying] = useState(false);
  useEffect(() => () => stopNaturalVoice(), []);
  async function speak() {
    if (!neuralVoiceEnabled()) {
      setError("Сначала установите живой голос в разделе «Ещё → Живой голос».");
      return;
    }
    setError("");
    setPlaying(true);
    await speakNaturalRussian(text, {
      onEnd: () => setPlaying(false),
      onError: (message) => { setPlaying(false); setError(message); },
    });
  }
  return <div className="kid-natural-talk">
    <button className="kid-demo-button" onClick={() => void speak()}>{playing ? "Говорю…" : `▶ ${label}`}</button>
    {error && <small>{error}</small>}
  </div>;
}

function PianoGame() {
  const [mode, setMode] = useState<"free" | "echo">("free");
  const [target, setTarget] = useState([0, 4, 7]);
  const [progress, setProgress] = useState(0);
  const [active, setActive] = useState<string | null>(null);

  async function hit(id: string, hz: number, whiteIndex?: number) {
    setActive(id);
    await playPianoNote(hz, 1.35);
    setTimeout(() => setActive(null), 180);
    if (mode !== "echo" || whiteIndex === undefined) return;
    if (target[progress] !== whiteIndex) {
      setProgress(0);
      return;
    }
    const next = progress + 1;
    if (next >= target.length) {
      await playSuccess();
      setProgress(0);
      setTarget((old) => old.map((value, index) => (value + 2 + index) % whiteKeys.length));
    } else setProgress(next);
  }

  async function demo() {
    for (const index of target) {
      await playPianoNote(whiteKeys[index][1], 0.7);
      await new Promise((resolve) => setTimeout(resolve, 760));
    }
  }

  return <section className="kid-game-stage piano-v4-stage">
    <div className="kid-game-copy">
      <p className="kid-kicker">МУЗЫКА · 2 ОКТАВЫ</p>
      <h1>Моё пианино</h1>
      <p>{mode === "free" ? "Играй пальчиками: белые и чёрные клавиши звучат по-разному." : "Послушай три ноты и попробуй повторить их по порядку."}</p>
    </div>
    <div className="kid-mode-tabs">
      <button className={mode === "free" ? "selected" : ""} onClick={() => setMode("free")}>Свободно</button>
      <button className={mode === "echo" ? "selected" : ""} onClick={() => { setMode("echo"); setProgress(0); }}>Повтори мелодию</button>
    </div>
    {mode === "echo" && <button className="kid-demo-button" onClick={() => void demo()}>▶ Послушать</button>}
    <div className="real-piano" aria-label="Пианино из двух октав">
      <div className="piano-white-row">
        {whiteKeys.map(([name, hz], index) => <button
          key={`${name}-${index}`}
          className={`piano-white-key ${active === `w${index}` ? "active" : ""} ${mode === "echo" && target[progress] === index ? "target" : ""}`}
          onPointerDown={() => void hit(`w${index}`, hz, index)}
          aria-label={`${name}, клавиша ${index + 1}`}
        ><span>{name}</span></button>)}
      </div>
      <div className="piano-black-row" aria-hidden="false">
        {blackKeys.map(([position, hz], index) => <button
          key={index}
          className={`piano-black-key ${active === `b${index}` ? "active" : ""}`}
          style={{ left: `calc(${position} * (100% / 14) - 13px)` }}
          onPointerDown={() => void hit(`b${index}`, hz)}
          aria-label="Чёрная клавиша"
        />)}
      </div>
    </div>
    <p className="kid-screen-note">Можно нажимать несколько клавиш подряд и вести пальцем по клавиатуре. Звук затухает как у настоящей клавиши, а не обрывается сразу.</p>
  </section>;
}

const bubbleSeed = [
  [7,8,54],[24,4,80],[48,10,46],[67,3,68],[84,9,48],[13,28,72],[36,27,45],[58,30,92],[82,27,64],
  [4,51,44],[20,49,96],[44,53,58],[70,50,42],[88,49,78],[9,74,84],[34,72,52],[60,76,70],[83,73,48],
] as const;
function makeBubbles() { return bubbleSeed.map(([x,y,size], i) => ({ id: Date.now()+i, x, y, size, label: size >= 78 ? "большой" : size <= 50 ? "маленький" : "средний" })); }

function BubbleGame() {
  const [bubbles, setBubbles] = useState(makeBubbles);
  const [task, setTask] = useState<"free" | "big" | "small">("free");
  const [message, setMessage] = useState("Лопай пузырьки — их много!");
  async function pop(id: number, size: number, label: string) {
    await playPop(size / 70);
    setBubbles((old) => old.filter((bubble) => bubble.id !== id));
    if (task === "big") setMessage(label === "большой" ? "Да! Большой пузырь!" : "Ищи ещё больше");
    if (task === "small") setMessage(label === "маленький" ? "Да! Маленький пузырь!" : "Ищи поменьше");
    if ((task === "big" && label === "большой") || (task === "small" && label === "маленький")) void playSuccess();
  }
  return <section className="kid-game-stage bubbles-v4-stage">
    <div className="kid-game-copy"><p className="kid-kicker">РАЗМЕР · КАСАНИЕ · ВНИМАНИЕ</p><h1>Пузырьки</h1><p>{message}</p></div>
    <div className="kid-mode-tabs">
      <button className={task === "free" ? "selected" : ""} onClick={() => { setTask("free"); setMessage("Лопай пузырьки — их много!"); }}>Лопай</button>
      <button className={task === "big" ? "selected" : ""} onClick={() => { setTask("big"); setMessage("Найди большой пузырь"); }}>Большой</button>
      <button className={task === "small" ? "selected" : ""} onClick={() => { setTask("small"); setMessage("Найди маленький пузырь"); }}>Маленький</button>
    </div>
    <div className="bubble-field-v4">
      {bubbles.map((bubble, index) => <button key={bubble.id} className={`bubble-v4 bubble-tone-${index%5}`} style={{ left: `${bubble.x}%`, top: `${bubble.y}%`, width: bubble.size, height: bubble.size }} onClick={() => void pop(bubble.id, bubble.size, bubble.label)} aria-label={`${bubble.label} пузырь`}><i /></button>)}
      {!bubbles.length && <button className="bubble-again" onClick={() => setBubbles(makeBubbles())}>Ещё пузырьки!</button>}
    </div>
    <button className="kid-demo-button" onClick={() => setBubbles(makeBubbles())}>↻ Наполнить экран</button>
  </section>;
}

const boxItems = [
  ["Мяч", "Предметы"], ["Чашка", "Предметы"], ["Книга", "Предметы"], ["Яблоко", "Еда"], ["Банан", "Еда"], ["Морковь", "Еда"],
] as const;
function BoxGame() {
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);
  const [message, setMessage] = useState("Открой коробку — внутри всегда что-то есть");
  const [word, category] = boxItems[index % boxItems.length];
  async function toggle() {
    const next = !open;
    setOpen(next);
    await playReveal(next);
    if (next) {
      setMessage(`Это ${word.toLowerCase()}!`);
      if (neuralVoiceEnabled()) void speakNaturalRussian(word);
    } else {
      setIndex((value) => (value + 1) % boxItems.length);
      setMessage("Кто спрячется теперь?");
    }
  }
  return <section className="kid-game-stage box-v4-stage">
    <div className="kid-game-copy"><p className="kid-kicker">ПОСТОЯНСТВО ОБЪЕКТА · СЛОВАРЬ</p><h1>Коробочка</h1><p>{message}</p></div>
    <button className={`box-scene-v4 ${open ? "open" : ""}`} onClick={() => void toggle()} aria-label={open ? "Закрыть коробку" : "Открыть коробку"}>
      <span className="box-back" />
      {open && <span className="box-object-v4"><CardArtV3 word={word} category={category} /></span>}
      <span className="box-body-v4"><i /><b /></span>
      <span className="box-lid-v4" />
    </button>
    <p className="kid-screen-note">Закрой коробку — следующий предмет будет другим.</p>
  </section>;
}

function CardGame() {
  const [category, setCategory] = useState(cardCategories[0]);
  const cards = useMemo(() => learningCards.filter((card) => card.category === category), [category]);
  const [index, setIndex] = useState(0);
  const [message, setMessage] = useState("");
  const card = cards[index % Math.max(cards.length, 1)];
  if (!card) return null;

  async function sayCard() {
    setMessage("");
    if (card.category === "Животные") {
      if (neuralVoiceEnabled()) {
        await speakNaturalRussian(card.word);
        setTimeout(() => void playAnimalSound(card.word), 450);
      } else {
        await playAnimalSound(card.word);
        setMessage("Слышишь настоящий голос животного. Для названия установите «Живой голос» в разделе «Ещё».");
      }
      return;
    }
    if (!neuralVoiceEnabled()) {
      setMessage("Механический голос отключён. Установите «Живой голос» в разделе «Ещё».");
      return;
    }
    await speakNaturalRussian(`${card.word}${card.sound ? `. ${card.sound}` : ""}`);
  }

  return <section className="kid-game-stage cards-v4-stage">
    <div className="kid-game-copy"><p className="kid-kicker">СЛОВАРЬ · РЕАЛЬНЫЕ ОБЪЕКТЫ</p><h1>Карточки</h1><p>{category === "Животные" ? "Настоящее животное + настоящий звук. Нажми на картинку." : "Большая картинка, одно слово и пауза для ребёнка."}</p></div>
    <div className="kid-category-scroll">{cardCategories.map((item) => <button key={item} className={item === category ? "selected" : ""} onClick={() => { setCategory(item); setIndex(0); setMessage(""); }}>{item}</button>)}</div>
    <button className="kid-picture-card-v4" onClick={() => void sayCard()} aria-label={`Озвучить ${card.word}`}>
      {category === "Животные" ? <AnimalPhotoCard word={card.word} /> : <div className="kid-picture-v4"><CardArtV3 word={card.word} category={card.category} /></div>}
      <strong>{card.word}</strong>
      {card.sound && <span className="card-sound-label">{card.sound}</span>}
      <small>{category === "Животные" ? "Нажми: услышишь животное" : "Нажми: услышишь слово"}</small>
    </button>
    <div className="kid-card-nav"><button onClick={() => setIndex((index - 1 + cards.length) % cards.length)}>←</button><span>{index + 1} / {cards.length}</span><button onClick={() => setIndex((index + 1) % cards.length)}>→</button></div>
    {message && <p className="kid-audio-message">{message}</p>}
  </section>;
}

function Reading({ type, id }: { type: "rhyme" | "story"; id?: string }) {
  const { data } = useApp();
  const [page, setPage] = useState(0);
  if (type === "rhyme") {
    const item = rhymes.find((r) => r.id === id) || rhymes[0];
    return <section className="kid-reading-v3"><div className="kid-reading-art"><span>{item.icon}</span><i /></div><h1>{item.title}</h1><p className="kid-poem">{item.text}</p><NaturalTalk text={item.text} label="Слушать потешку"/><div className="kid-reading-steps">{item.movement.slice(0,3).map((step,index)=><div key={step}><b>{index+1}</b><span>{step}</span></div>)}</div></section>;
  }
  const story = stories.find((item) => item.id === id) || stories[0];
  const text = personalize(story.paragraphs[page], data.profile.name, data.profile.toy);
  return <section className="kid-reading-v3"><div className="kid-reading-art story"><span>{story.icon}</span><i /></div><h1>{story.title}</h1><p>{text}</p><NaturalTalk text={text} label="Слушать страницу"/><div className="kid-card-nav"><button disabled={page===0} onClick={()=>setPage(page-1)}>←</button><span>{page+1} / {story.paragraphs.length}</span><button disabled={page===story.paragraphs.length-1} onClick={()=>setPage(page+1)}>→</button></div></section>;
}

export function ChildV4({ path, onExit }: { path: string; onExit: () => void }) {
  const { data } = useApp();
  const [confirmExit, setConfirmExit] = useState(false);
  const [holding, setHolding] = useState(false);
  const hold = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [screen, id] = path.replace(/^child\/?/, "").split("/");
  function clearHold(){ if(hold.current) clearTimeout(hold.current); hold.current=null; setHolding(false); }
  function startHold(){ clearHold(); setHolding(true); hold.current=setTimeout(()=>{setHolding(false);setConfirmExit(true);},1800); }
  useEffect(()=>()=>clearHold(),[]);
  return <div className="child-v3-shell child-v4-shell">
    <header className="child-v3-topbar"><button className="child-v3-home" onClick={()=>location.hash="child"} aria-label="На главную детского режима"><span aria-hidden="true" className="mini-house"><i/><b/></span></button><div><strong>BabyGuide</strong><span>· {data.profile.name||"малыш"}</span></div><button className={`child-v3-parent ${holding?"holding":""}`} onPointerDown={startHold} onPointerUp={clearHold} onPointerCancel={clearHold} onPointerLeave={clearHold}><strong>Мама</strong><small>{holding?"ещё чуть-чуть…":"удерживать"}</small></button></header>
    <main className="child-v3-main">
      {!screen ? <><section className="kid-home-hero"><div className="kid-sun"/><div className="kid-hill hill-one"/><div className="kid-hill hill-two"/><div className="kid-home-copy"><p>ИГРАЕМ ВМЕСТЕ</p><h1>Что выберем?</h1><span>Звук, движение, настоящие картинки и короткие задания</span></div></section><div className="kid-home-grid">{[
        ["actions/piano","Пианино","2 октавы и мелодии","music"],["actions/bubbles","Пузырьки","18 пузырьков","bubble"],["actions/box","Коробочка","6 предметов","box"],["cards","Карточки","животные и слова","cards"],["repeat","Повторюшка","слушаем речь","repeat"],["rhymes","Потешки",`${rhymes.length} потешек`,"rhymes"],["stories","Истории","слушаем и листаем","stories"],
      ].map(([route,title,sub,visual])=><button key={route} onClick={()=>location.hash=`child/${route}`} className={`kid-home-tile tile-${visual}`}><span className="kid-tile-art" aria-hidden="true"><i/><b/><em/></span><strong>{title}</strong><small>{sub}</small></button>)}</div><p className="kid-screen-note">Короткие занятия вместе со взрослым. После игры переключайтесь на движение, предметы и живое общение.</p></>
      : screen==="actions"&&id==="piano"?<PianoGame/> : screen==="actions"&&id==="bubbles"?<BubbleGame/> : screen==="actions"&&id==="box"?<BoxGame/> : screen==="cards"?<CardGame/> : screen==="repeat"?<Repeat child/> : screen==="rhymes"||screen==="rhyme"?<Reading type="rhyme" id={id}/> : screen==="stories"||screen==="story"?<Reading type="story" id={id}/> : <button className="button jumbo" onClick={()=>location.hash="child"}>Вернуться к играм</button>}
    </main>
    <Confirm open={confirmExit} title="Вернуться к маме?" action="Да, к маме" onClose={()=>setConfirmExit(false)} onConfirm={onExit}>Детский режим закроется.</Confirm>
  </div>;
}
