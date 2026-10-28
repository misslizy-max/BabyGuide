import { Heading, Link } from "../components/UI";

const actions = [
  ["sleep-log","Сон","Уснул / проснулся","sleep"],
  ["diary","Еда","Записать приём пищи или смесь","food"],
  ["temperature","Температура","Измерение и динамика","temp"],
  ["medicines","Лекарство","Доза, время и препарат","med"],
  ["growth","Вес и рост","Новое измерение","growth"],
  ["words","Новое слово","Текст или голос","word"],
] as const;

export function QuickAddV3() {
  return (
    <div className="quick-add-v3-page">
      <Heading title="Добавить запись" sub="Один выбор — и сразу нужная форма" back="home" />
      <section className="quick-add-hero"><div><p className="eyebrow">БЫСТРАЯ ЗАПИСЬ</p><h1>Что произошло?</h1><p>Не ищите нужный дневник по разделам. Выберите событие — BabyGuide откроет правильный экран.</p></div><div className="quick-add-art" aria-hidden="true"><span>+</span><i/><b/></div></section>
      <div className="quick-add-grid">{actions.map(([route,title,lead,kind])=><Link key={route} to={route} className={`quick-add-card ${kind}`}><div className="quick-add-icon" aria-hidden="true"><span/><i/></div><div><h2>{title}</h2><p>{lead}</p><strong>Добавить →</strong></div></Link>)}</div>
    </div>
  );
}
