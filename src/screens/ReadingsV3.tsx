import { useState } from "react";
import { Heading, Link, Note } from "../components/UI";
import { NaturalSpeechButton } from "../components/NaturalSpeech";
import { rhymes } from "../data/rhymes";
import { personalize, stories } from "../data/stories";
import { useApp } from "../hooks/useApp";
import { NotFound } from "./Knowledge";

function sceneIndex(id: string) {
  return [...id].reduce((sum, char) => sum + char.charCodeAt(0), 0) % 6;
}

function ReadingScene({ id, kind }: { id: string; kind: "rhyme" | "story" }) {
  const variant = sceneIndex(id);
  return (
    <svg className={`reading-scene-v3 scene-${variant}`} viewBox="0 0 420 250" role="img" aria-label={kind === "story" ? "Иллюстрация к истории" : "Иллюстрация к потешке"}>
      <defs>
        <linearGradient id={`sky-${id}`} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor={["#E9E1F2","#E6F0E1","#F5E4D7","#E4EEF4","#F1E5EC","#EEE8D8"][variant]}/><stop offset="1" stopColor="#FFF9F2"/></linearGradient>
      </defs>
      <rect width="420" height="250" rx="30" fill={`url(#sky-${id})`}/>
      <path d="M0 192c65-34 126-24 181 1 61 28 134 17 239-18v75H0Z" fill={["#C8D9B8","#D8C5E2","#E3C5AD","#BFD6C0","#D8C9B6","#C6D5DF"][variant]}/>
      {variant === 0 && <><circle cx="316" cy="62" r="35" fill="#F0D77D"/><path d="M72 177h118v-62H72Z" fill="#E1C6B4"/><path d="M62 116l69-52 70 52Z" fill="#A88478"/><rect x="116" y="140" width="30" height="37" rx="5" fill="#FFF3E4"/></>}
      {variant === 1 && <><circle cx="326" cy="65" r="30" fill="#FFF6CE"/><path d="M62 178c30-78 77-91 112-22 30-55 71-55 110 4" fill="#AFC99F"/><path d="M112 64c32 11 48 30 50 58" fill="none" stroke="#8EA7C5" strokeWidth="7" strokeLinecap="round"/><circle cx="109" cy="60" r="11" fill="#D9B6D3"/></>}
      {variant === 2 && <><rect x="72" y="128" width="142" height="56" rx="18" fill="#D9B9A7"/><circle cx="116" cy="122" r="36" fill="#F0D0BD"/><circle cx="103" cy="115" r="4" fill="#5E4D48"/><circle cx="129" cy="115" r="4" fill="#5E4D48"/><path d="M105 136c8 6 15 6 23 0" stroke="#A86562" strokeWidth="4" fill="none" strokeLinecap="round"/><path d="M256 173c0-45 27-84 58-84 24 0 43 28 43 65" fill="#B6C7A6"/><circle cx="312" cy="79" r="18" fill="#E2BE75"/></>}
      {variant === 3 && <><path d="M62 184h164l34-49H96Z" fill="#C9B6D4"/><circle cx="123" cy="181" r="22" fill="#6D6A71"/><circle cx="222" cy="181" r="22" fill="#6D6A71"/><path d="M94 135h82l29 34H70Z" fill="#E5C3A9"/><circle cx="310" cy="64" r="31" fill="#F2D57B"/></>}
      {variant === 4 && <><path d="M75 185c36-38 88-42 126-5" fill="none" stroke="#A8C0D5" strokeWidth="20" strokeLinecap="round"/><path d="M235 184c19-57 65-73 107-30" fill="none" stroke="#C8B4D2" strokeWidth="20" strokeLinecap="round"/><circle cx="98" cy="87" r="28" fill="#F2D17A"/><path d="M98 45v-18M66 57L53 44M130 57l13-13" stroke="#D29D55" strokeWidth="5" strokeLinecap="round"/></>}
      {variant === 5 && <><rect x="76" y="118" width="102" height="68" rx="14" fill="#C5D4B5"/><rect x="224" y="97" width="112" height="89" rx="14" fill="#D8C2DF"/><circle cx="125" cy="92" r="28" fill="#F0D0BD"/><circle cx="278" cy="70" r="25" fill="#EAC7B4"/><path d="M114 92h22M267 70h22" stroke="#6C5951" strokeWidth="4" strokeLinecap="round"/></>}
      {kind === "rhyme" && <><circle cx="356" cy="202" r="19" fill="#FFFFFFA8"/><path d="M345 202h22M356 191v22" stroke="#9E8877" strokeWidth="4" strokeLinecap="round"/></>}
    </svg>
  );
}

export function RhymesV3() {
  return (
    <div className="readings-v3-page">
      <Heading title="Потешки с движениями" sub="Ритм, жест и пауза · каждая потешка с иллюстрацией и озвучкой" back="more" />
      <section className="reading-library-hero"><ReadingScene id="rhyme-library" kind="rhyme"/><div><p className="eyebrow">СМОТРИМ · ДВИГАЕМСЯ · СЛУШАЕМ</p><h2>Коротко и вместе</h2><p>Взрослый показывает движение, произносит текст один раз и оставляет ребёнку время ответить взглядом, жестом или звуком.</p></div></section>
      <div className="reading-grid-v3">{rhymes.map((item)=><Link key={item.id} to={`rhyme/${item.id}`} className="reading-card-v3"><ReadingScene id={item.id} kind="rhyme"/><div><small>{item.goal}</small><h3>{item.title}</h3><p>{item.when}</p><strong>Открыть →</strong></div></Link>)}</div>
    </div>
  );
}

export function RhymeDetailV3({ id }: { id: string }) {
  const item = rhymes.find((value)=>value.id===id);
  if (!item) return <NotFound/>;
  return (
    <div className="reading-detail-v3">
      <Heading title={item.title} sub={`${item.goal} · ${item.when}`} back="rhymes" />
      <ReadingScene id={item.id} kind="rhyme"/>
      <section className="reading-text-card"><p className="kid-poem">{item.text}</p><NaturalSpeechButton text={item.text} label="Слушать живым голосом"/></section>
      <section className="movement-v3"><p className="eyebrow">ДВИЖЕНИЯ</p><h2>Покажите, не требуя повторить</h2><div>{item.movement.map((step,index)=><article key={step}><span>{index+1}</span><div className={`movement-art movement-${index%3}`} aria-hidden="true"><i/><b/><em/></div><p>{step}</p></article>)}</div></section>
      <Note>Если ребёнок не повторяет движение, это не ошибка. Задача — совместное внимание, ритм и удовольствие от короткого контакта.</Note>
    </div>
  );
}

export function StoriesV3() {
  return (
    <div className="readings-v3-page">
      <Heading title="Поддерживающие истории" sub="Небольшие сюжеты о сне, разлуке, врачах, поездках и других знакомых ситуациях" back="more" />
      <section className="reading-library-hero story"><ReadingScene id="story-library" kind="story"/><div><p className="eyebrow">ИСТОРИЯ · ИЛЛЮСТРАЦИЯ · ВОПРОС</p><h2>Без морали и давления</h2><p>Истории помогают заранее назвать ситуацию и возможный следующий шаг. Они не требуют «правильной» реакции ребёнка.</p></div></section>
      <div className="reading-grid-v3">{stories.map((story)=><Link key={story.id} to={`story/${story.id}`} className="reading-card-v3"><ReadingScene id={story.id} kind="story"/><div><small>{story.topic}</small><h3>{story.title}</h3><p>{story.paragraphs[0].slice(0,110)}…</p><strong>Читать →</strong></div></Link>)}</div>
    </div>
  );
}

export function StoryDetailV3({ id }: { id: string }) {
  const { data } = useApp();
  const story = stories.find((item)=>item.id===id);
  const [page,setPage] = useState(0);
  if (!story) return <NotFound/>;
  const text = personalize(story.paragraphs[page], data.profile.name, data.profile.toy);
  return (
    <div className="reading-detail-v3 story-detail-v3">
      <Heading title={story.title} sub={story.topic} back="stories" />
      <ReadingScene id={`${story.id}-${page}`} kind="story"/>
      <section className="story-page-v3"><div className="story-progress-v3">{story.paragraphs.map((_,index)=><span key={index} className={index<=page?"active":""}/>)}</div><p>{text}</p><NaturalSpeechButton key={`${story.id}-${page}`} text={text} label="Слушать страницу"/><div className="story-nav-v3"><button className="secondary" disabled={page===0} onClick={()=>setPage(page-1)}>← Назад</button><span>{page+1} / {story.paragraphs.length}</span><button className="button" disabled={page===story.paragraphs.length-1} onClick={()=>setPage(page+1)}>Дальше →</button></div></section>
      {page===story.paragraphs.length-1&&<section className="story-question-v3"><div className="question-art" aria-hidden="true"><span>?</span><i/><b/></div><div><p className="eyebrow">ПОГОВОРИТЬ ПОСЛЕ</p><h2>{story.question}</h2><p>Ответ может быть словом, жестом, взглядом или вообще не появиться. Вопрос нужен для контакта, а не проверки понимания.</p></div></section>}
    </div>
  );
}
