import { Heading, Link } from "../components/UI";
import { useApp } from "../hooks/useApp";

const items = [
  ["manuals","Методические пособия","Полные визуальные гайды: сон, питание, речь, безопасность.","book"],
  ["health","Здоровье","Температура, симптомы, красные флаги и что делать сейчас.","health"],
  ["first-aid-kit","Аптечка ребёнка","По возрасту: что держать дома и чего не покупать лишнего.","kit"],
  ["voice-settings","Живой голос BabyGuide","Нейронная русская озвучка вместо системного роботизированного голоса.","voice"],
  ["weather","Погода и одежда","Как одеть ребёнка на прогулку по фактической погоде.","weather"],
  ["rhymes","Потешки","Ритм, движения и совместное внимание.","rhymes"],
  ["stories","Истории","Поддерживающие истории с озвучкой.","stories"],
  ["cards","Карточки","Слова, предметы и детский режим.","cards"],
  ["favorites","Избранное","Сохранённые гайды, игры и материалы.","favorite"],
  ["profile","Профиль ребёнка","Возраст, продукты, аллергии, город и настройки.","profile"],
] as const;

export function MoreV3() {
  const { data } = useApp();
  return (
    <div className="more-v3-page">
      <Heading title="Ещё" sub="Все важные разделы без пряток в абстрактной библиотеке" back="home" />
      <section className="more-v3-hero">
        <div><p className="eyebrow">BABYGUIDE · {data.profile.name || "РЕБЁНОК"}</p><h1>Найдите нужное за пару секунд</h1><p>Здесь только понятные действия: здоровье, пособия, аптечка, живой голос, погода, контент и настройки.</p></div>
        <div className="more-v3-art" aria-hidden="true"><span/><i/><b/><em/></div>
      </section>
      <div className="more-v3-grid">{items.map(([route,title,lead,kind])=><Link key={route} to={route} className={`more-v3-card ${kind}`}><div className="more-v3-icon" aria-hidden="true"><span/><i/></div><div><h2>{title}</h2><p>{lead}</p><strong>Открыть →</strong></div></Link>)}</div>
    </div>
  );
}
