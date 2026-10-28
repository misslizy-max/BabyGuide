import { useState } from "react";
import { Heading, Link, Note } from "../components/UI";
import { IngredientGlyph } from "../components/RecipeVisuals";

const examples = [
  { id: "carrot", title: "Морковь", good: "Очень мягкая после приготовления: крупная полоска или размятая.", bad: "Сырая твёрдая палочка или кружок." },
  { id: "apple", title: "Яблоко", good: "Запечённое/тушёное мягкое или натёртое по навыкам.", bad: "Жёсткий ломтик или крупный сырой кусок." },
  { id: "banana", title: "Банан", good: "Спелый, мягкая полоска или размятый.", bad: "Плотный комок, который ребёнок не может раздавить." },
  { id: "broccoli", title: "Брокколи", good: "Мягкое соцветие с удобной ручкой-стеблем.", bad: "Недоготовленный жёсткий стебель." },
] as const;

function TextureDiagram({ month }: { month: number }) {
  return (
    <div className="safe-texture-diagram" aria-label="Визуальная схема формы и текстуры еды">
      <article className={month < 9 ? "active" : "passed"}>
        <div className="safe-strip"><i/><b/></div>
        <strong>Мягкая полоска</strong>
        <p>Примерно с палец взрослого, выступает из кулачка и легко раздавливается.</p>
      </article>
      <article className="active">
        <div className="safe-mash"><i/><b/><em/></div>
        <strong>Размятая пища</strong>
        <p>Неровная мягкая текстура на ложке, без твёрдых круглых включений.</p>
      </article>
      <article className={month >= 9 ? "active" : "future"}>
        <div className="safe-pieces"><i/><i/><i/><i/></div>
        <strong>Мягкие кусочки</strong>
        <p>Когда ребёнок уверенно захватывает и управляет пищей; размер зависит от продукта.</p>
      </article>
    </div>
  );
}

function GaggingVisual() {
  return (
    <svg viewBox="0 0 180 130" role="img" aria-label="Ребёнок кашляет и издаёт звук — воздух проходит">
      <circle cx="75" cy="56" r="35" fill="#F0D1BE"/><path d="M54 48c7-8 14-8 21 0M84 48c7-8 14-8 21 0" stroke="#5C4D47" strokeWidth="4" fill="none" strokeLinecap="round"/><path d="M68 70c7 7 15 7 22 0" stroke="#A9605E" strokeWidth="4" fill="none" strokeLinecap="round"/><path d="M118 48c16-9 30-4 38 6M118 64c18-3 29 4 36 12M112 80c14 4 23 12 27 22" stroke="#8FB6C4" strokeWidth="5" fill="none" strokeLinecap="round"/><circle cx="127" cy="30" r="5" fill="#A6CBD5"/><circle cx="148" cy="96" r="4" fill="#A6CBD5"/>
    </svg>
  );
}
function ChokingVisual() {
  return (
    <svg viewBox="0 0 180 130" role="img" aria-label="Тихое удушье — нет эффективного кашля или плача">
      <circle cx="83" cy="55" r="35" fill="#E4C7BE"/><circle cx="70" cy="48" r="4" fill="#574A47"/><circle cx="96" cy="48" r="4" fill="#574A47"/><path d="M72 73h22" stroke="#7A6662" strokeWidth="4" strokeLinecap="round"/><path d="M122 35l30 30M152 35l-30 30" stroke="#C46F65" strokeWidth="8" strokeLinecap="round"/><path d="M79 90c7 10 5 20-2 28M91 90c-3 10 1 20 8 27" stroke="#927D78" strokeWidth="5" fill="none" strokeLinecap="round"/>
    </svg>
  );
}

export function SafeFoodV3() {
  const [month, setMonth] = useState(6);
  return (
    <div className="safe-food-v3-page">
      <Heading title="Безопасная подача еды" sub="6–12+ месяцев · навыки и мягкость важнее даты в календаре" back="nutrition" />
      <section className="safe-food-hero">
        <div><p className="eyebrow">ВИЗУАЛЬНЫЙ ГИД</p><h1>Форма, мягкость и навык</h1><p>Не запоминайте сантиметры отдельно от ребёнка: сначала смотрим на готовность, затем на то, можно ли легко раздавить продукт и безопасно удержать его.</p></div>
        <div className="safe-food-hero-art" aria-hidden="true"><span className="hand"><i/><b/><em/></span><span className="soft-food"/></div>
      </section>
      <div className="days safe-months">{[6,7,8,9,10,11,12].map((value)=><button key={value} className={month===value?"day selected":"day"} onClick={()=>setMonth(value)} aria-pressed={month===value}>{value===12?"12+":value}<small>МЕС.</small></button>)}</div>
      <Note>Возраст задаёт контекст, но не гарантирует готовность к конкретной форме. Ребёнок должен устойчиво контролировать голову, есть в безопасной позе, а взрослый — находиться рядом и наблюдать.</Note>

      <section className="safe-food-section">
        <p className="eyebrow">01 · ФОРМА</p><h2>{month < 9 ? "Начинаем с удобного захвата и мягкости" : "Добавляем маленькие мягкие кусочки по навыкам"}</h2>
        <TextureDiagram month={month}/>
        <div className="finger-scale" aria-label="Сравнение мягкой полоски с пальцем взрослого"><span className="finger"><i/></span><span className="food-sample"><i/></span><div><strong>Ориентир, а не линейка</strong><p>Крупная мягкая полоска должна выступать из кулачка. Позже форма уменьшается вместе с развитием захвата.</p></div></div>
      </section>

      <section className="safe-food-section alt">
        <p className="eyebrow">02 · ПРИМЕРЫ</p><h2>Как один продукт меняется от опасной формы к безопасной</h2>
        <div className="safe-example-grid">{examples.map((item)=><article key={item.id}><div className="safe-example-art"><IngredientGlyph id={item.id}/></div><h3>{item.title}</h3><div className="safe-good"><b>✓</b><p>{item.good}</p></div><div className="safe-bad"><b>×</b><p>{item.bad}</p></div></article>)}</div>
      </section>

      <section className="safe-food-section">
        <p className="eyebrow">03 · ПРОВЕРКА ПЕРЕД ПОДАЧЕЙ</p><h2>Три быстрых вопроса</h2>
        <div className="safe-check-flow"><article><span>1</span><strong>Раздавливается?</strong><p>Мягкость соответствует форме и навыку.</p></article><i>→</i><article><span>2</span><strong>Не круглая и твёрдая?</strong><p>Опасные формы изменены до подачи.</p></article><i>→</i><article><span>3</span><strong>Ребёнок сидит безопасно?</strong><p>Еда только под наблюдением, без хождения и игры с пищей во рту.</p></article></div>
      </section>

      <section className="safe-food-section danger-zone">
        <p className="eyebrow">04 · НЕ ПУТАЕМ</p><h2>Рвотный рефлекс и удушье выглядят по-разному</h2>
        <div className="gagging-comparison"><article className="gag"><GaggingVisual/><strong>Рвотный рефлекс / gagging</strong><p>Часто шумный: ребёнок кашляет, делает рвотные движения, может краснеть, но воздух проходит. Не лезьте пальцами в рот вслепую; оставайтесь рядом и наблюдайте.</p></article><article className="choke"><ChokingVisual/><strong>Опасное удушье</strong><p>Может быть тихим: нет эффективного кашля, плача или дыхания, цвет меняется. Немедленно зовите помощь и действуйте по возрастному алгоритму первой помощи.</p></article></div>
        <Note danger>Если дыхание неэффективно или вы сомневаетесь, не ждите изменения цвета. Экстренная помощь важнее продолжения наблюдения.</Note>
        <Link to="article/first-aid" className="danger-button">Алгоритм первой помощи →</Link>
      </section>
      <p className="source"><a href="https://www.cdc.gov/infant-toddler-nutrition/foods-and-drinks/choking-hazards.html" target="_blank" rel="noopener noreferrer">CDC · choking hazards ↗</a></p>
    </div>
  );
}
