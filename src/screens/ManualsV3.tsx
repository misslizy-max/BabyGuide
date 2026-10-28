import { Heading, Link, Note } from "../components/UI";
import { guides } from "../data/guides";

const groups = [
  { id:"sleep", title:"Сон", lead:"Режим, пробуждения, короткие сны, ранние подъёмы и мягкие изменения без гонки.", color:"violet", mark:"☾" },
  { id:"nutrition", title:"Прикорм и питание", lead:"Готовность, текстуры, безопасная подача, меню и переход к семейной еде.", color:"sage", mark:"○" },
  { id:"speech", title:"Речь и коммуникация", lead:"Жесты, совместное внимание, первые слова, звукоподражания и игры без давления.", color:"lilac", mark:"◌" },
  { id:"potty", title:"Самообслуживание", lead:"Горшок, рутины, участие в одевании, еде и бытовых действиях.", color:"sand", mark:"◇" },
  { id:"safety", title:"Безопасность и первая помощь", lead:"Красные флаги, домашняя безопасность, аптечка и алгоритмы действий.", color:"rose", mark:"+" },
  { id:"development", title:"Развитие 0–36 месяцев", lead:"Навыки по областям, игры, что поддерживать сейчас и когда обсуждать развитие со специалистом.", color:"green", mark:"✦" },
] as const;

export function ManualsV3() {
  return (
    <div className="manuals-v3-page">
      <Heading title="Методические пособия" sub="Не короткие статьи: понять ситуацию, увидеть схему, попробовать шаги и знать, когда остановиться" back="more" />
      <section className="manuals-hero">
        <div><p className="eyebrow">BABYGUIDE · ПОСОБИЯ</p><h1>Сначала визуал. Потом объяснение.</h1><p>Каждое пособие строится одинаково: карта темы → визуальная схема → пошаговый алгоритм → практикум → ошибки → красные флаги → источники.</p></div>
        <div className="manual-book" aria-hidden="true"><span/><i/><b/><em/></div>
      </section>

      <div className="manual-groups">{groups.map((group) => {
        const list = guides.filter((guide)=>guide.category===group.id);
        const first = list[0];
        const route = group.id === "development" ? "age-guide" : group.id === "safety" ? "first-aid-kit" : first ? `guide/${first.id}` : group.id;
        return <Link key={group.id} to={route} className={`manual-group-card ${group.color}`}>
          <div className="manual-group-art" aria-hidden="true"><span>{group.mark}</span><i/><b/></div>
          <div><small>{list.length ? `${list.length} ПОЛНЫХ ГАЙДОВ` : "БОЛЬШОЕ ПОСОБИЕ"}</small><h2>{group.title}</h2><p>{group.lead}</p><strong>Открыть пособие →</strong></div>
        </Link>;
      })}</div>

      <section className="manuals-standard">
        <p className="eyebrow">СТАНДАРТ BABYGUIDE V3</p><h2>Материал не считается готовым без визуала</h2>
        <div>{[
          ["01","Обложка и карта","Сразу понятно, о чём материал и куда идти."],
          ["02","Инфографика","Схема объясняет смысл без длинного чтения."],
          ["03","Алгоритм","Что делать по шагам, а не общие советы."],
          ["04","Практикум","Можно отметить реальные действия семьи."],
          ["05","Красные флаги","Когда домашний план заканчивается и нужна помощь."],
          ["06","Источники","Понятно, на чём основан материал."],
        ].map(([n,title,text])=><article key={n}><span>{n}</span><strong>{title}</strong><p>{text}</p></article>)}</div>
      </section>
      <Note>Визуал здесь — не украшение. Схема, иллюстрация или инфографика должна помогать принять решение или выполнить действие. Emoji и декоративная иконка сами по себе визуалом не считаются.</Note>
    </div>
  );
}
