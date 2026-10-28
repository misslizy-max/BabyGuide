import { useMemo, useState } from "react";
import { Heading, Link, Note } from "../components/UI";
import { useApp } from "../hooks/useApp";
import { months } from "../utils/dates";

type KitItem = {
  id: string;
  title: string;
  why: string;
  category: "Температура" | "Нос" | "Раны" | "ЖКТ" | "Первая помощь" | "Инструменты";
  min: number;
  max?: number;
  type: "supply" | "medicine";
  caution?: string;
};

const kit: KitItem[] = [
  { id:"thermometer", title:"Электронный термометр", why:"Измерить температуру и записать динамику.", category:"Температура", min:0, type:"supply" },
  { id:"syringe", title:"Мерный шприц", why:"Точнее ложки для жидких лекарств. Используйте шприц из упаковки препарата или совместимый по объёму.", category:"Температура", min:0, type:"supply" },
  { id:"paracetamol", title:"Детский парацетамол", why:"Для боли или высокой температуры, если ребёнок плохо себя чувствует.", category:"Температура", min:2, type:"medicine", caution:"Возраст, концентрацию и дозу всегда сверять с конкретной упаковкой. Для самых маленьких — только по медицинской рекомендации." },
  { id:"ibuprofen", title:"Детский ибупрофен", why:"Для боли/температуры, если подходит ребёнку.", category:"Температура", min:3, type:"medicine", caution:"Возраст и минимальный вес зависят от препарата. Не использовать при обезвоживании без медицинской оценки; противопоказания сверять по инструкции." },
  { id:"saline", title:"Физраствор / солевой раствор", why:"Для увлажнения и очищения носа.", category:"Нос", min:0, type:"supply" },
  { id:"aspirator", title:"Назальный аспиратор", why:"Помочь убрать слизь у ребёнка, который ещё не умеет высмаркиваться.", category:"Нос", min:0, max:24, type:"supply", caution:"Без глубокого введения и чрезмерного разрежения." },
  { id:"gauze", title:"Стерильные салфетки / марля", why:"Закрыть небольшую рану после промывания.", category:"Раны", min:0, type:"supply" },
  { id:"nonstick", title:"Неприлипающая стерильная повязка", why:"Для поверхностных повреждений кожи и после охлаждения небольшого ожога.", category:"Раны", min:0, type:"supply", caution:"Ожог сначала охлаждают прохладной проточной водой; тяжёлые/обширные ожоги требуют медицинской помощи." },
  { id:"bandage", title:"Бинт + детский пластырь", why:"Зафиксировать салфетку или защитить небольшое повреждение.", category:"Раны", min:0, type:"supply" },
  { id:"ors", title:"Раствор для пероральной регидратации (ОРС)", why:"Восполняет воду и соли при рвоте/диарее по возрастному плану.", category:"ЖКТ", min:0, type:"medicine", caution:"Для младенца, частой рвоты, признаков обезвоживания или ухудшения — медицинская оценка раньше." },
  { id:"gloves", title:"Одноразовые перчатки", why:"Для обработки крови, рвоты и ран.", category:"Первая помощь", min:0, type:"supply" },
  { id:"coldpack", title:"Холодовый пакет", why:"Коротко приложить через ткань при ушибе/отёке.", category:"Первая помощь", min:0, type:"supply", caution:"Не прикладывать лёд прямо к коже." },
  { id:"scissors", title:"Ножницы с тупыми концами", why:"Разрезать бинт/одежду при необходимости.", category:"Инструменты", min:0, type:"supply" },
  { id:"tweezers", title:"Пинцет", why:"Для видимой поверхностной занозы или инородного материала; не для носа/уха.", category:"Инструменты", min:0, type:"supply" },
  { id:"light", title:"Небольшой фонарик", why:"Осмотреть кожу, рот или зрачки без яркого общего света.", category:"Инструменты", min:0, type:"supply" },
];

const avoid = [
  ["Сиропы от кашля «на всякий случай»", "У маленьких детей многие безрецептурные средства от кашля/простуды не рекомендуются; сначала нужен возраст и конкретный симптом."],
  ["Антибиотик «из прошлой болезни»", "Не хранить остатки для самостоятельного повторного курса."],
  ["Сильные антисептики для каждой царапины", "Большинство небольших ран сначала промывают водой; агрессивные растворы могут раздражать ткань."],
  ["Несколько препаратов с одним действующим веществом", "Повышает риск случайно дать двойную дозу."],
];

const ageBands = [
  [0,2,"0–2 мес"],
  [2,6,"2–6 мес"],
  [6,12,"6–12 мес"],
  [12,24,"1–2 года"],
  [24,36,"2–3 года"],
] as const;

function readOwned() {
  try { return JSON.parse(localStorage.getItem("babyguide.kit.owned") || "[]") as string[]; } catch { return [] as string[]; }
}
function saveOwned(ids: string[]) { try { localStorage.setItem("babyguide.kit.owned", JSON.stringify(ids)); } catch {} }

export function FirstAidKit() {
  const { data } = useApp();
  const profileAge = Math.min(Math.max(months(data.profile.birth) ?? 0,0),36);
  const initialBand = ageBands.findIndex(([min,max]) => profileAge >= min && profileAge < max);
  const [band, setBand] = useState(initialBand >= 0 ? initialBand : 2);
  const [owned, setOwned] = useState(readOwned);
  const [filter, setFilter] = useState("Все");
  const [min,max,label] = ageBands[band];
  const categories = ["Все",...new Set(kit.map((item)=>item.category))];
  const visible = kit.filter((item) => item.min < max && (item.max === undefined || item.max > min) && (filter === "Все" || item.category===filter));
  const missing = useMemo(() => visible.filter((item)=>!owned.includes(item.id)), [visible,owned]);

  function toggle(id: string) {
    const next = owned.includes(id) ? owned.filter((item)=>item!==id) : [...owned,id];
    setOwned(next); saveOwned(next);
  }

  return (
    <div className="kit-v3-page">
      <Heading title="Аптечка ребёнка" sub="По возрасту: что держать дома, чего не покупать лишнего и что проверить перед применением" back="health" />

      <section className="kit-hero">
        <div className="kit-hero-copy"><p className="eyebrow">АПТЕЧКА · {label}</p><h1>Готово к нужному моменту</h1><p>Расходники можно подготовить заранее. Лекарства всегда проверяем по возрасту, весу, концентрации и инструкции конкретного препарата.</p></div>
        <div className="kit-case" aria-hidden="true"><span /><i>+</i><b /></div>
      </section>

      <div className="kit-age-tabs">{ageBands.map(([,,name],i)=><button key={name} className={i===band?"selected":""} onClick={()=>setBand(i)}>{name}</button>)}</div>
      <div className="kit-category-tabs">{categories.map((category)=><button key={category} className={category===filter?"selected":""} onClick={()=>setFilter(category)}>{category}</button>)}</div>

      <section className="kit-progress"><div><strong>{visible.length-owned.filter((id)=>visible.some((item)=>item.id===id)).length}</strong><span>нужно проверить / докупить</span></div><progress value={visible.length-missing.length} max={visible.length || 1}/><small>{visible.length-missing.length} из {visible.length} отмечено как «есть»</small></section>

      <div className="kit-grid">{visible.map((item)=><article key={item.id} className={`kit-card ${item.type}`}><div className="kit-card-visual" aria-hidden="true"><span>{item.category==="Температура"?"°":item.category==="Нос"?"≈":item.category==="Раны"?"+":item.category==="ЖКТ"?"○":item.category==="Первая помощь"?"!":"⌁"}</span><i/></div><div className="kit-card-copy"><small>{item.category} · {item.type==="medicine"?"ПРЕПАРАТ":"РАСХОДНИК"}</small><h2>{item.title}</h2><p>{item.why}</p>{item.caution&&<div className="kit-caution"><strong>Важно</strong><span>{item.caution}</span></div>}<label className="kit-have"><input type="checkbox" checked={owned.includes(item.id)} onChange={()=>toggle(item.id)}/><span>{owned.includes(item.id)?"Есть дома":"Отметить, если есть"}</span></label></div></article>)}</div>

      <section className="kit-avoid"><div className="kit-avoid-head"><span>×</span><div><p className="eyebrow">НЕ НУЖНО ПОКУПАТЬ АВТОМАТИЧЕСКИ</p><h2>«На всякий случай» — не стратегия</h2></div></div>{avoid.map(([title,text])=><div key={title}><strong>{title}</strong><p>{text}</p></div>)}</section>

      <section className="kit-links"><Link to="medicines" className="button">Расчёт лекарства по весу →</Link><Link to="article/first-aid" className="secondary">Первая помощь</Link><Link to="article/red-flags" className="secondary">Красные флаги</Link></section>

      <Note>Для младенцев первых месяцев жизни порог обращения за медицинской помощью ниже. Не используйте приложение как разрешение дать препарат: сверяйте инструкцию конкретного бренда и возраст/вес ребёнка. При затруднении дыхания, судорогах, нарушении сознания, посинении или быстром ухудшении — экстренная помощь.</Note>
      <div className="kit-sources"><p className="eyebrow">ИСТОЧНИКИ</p><a href="https://www.nhs.uk/baby/health/medicines-for-babies-and-children/" target="_blank" rel="noreferrer">NHS · Medicines for babies and children ↗</a><a href="https://www.healthiertogether.nhs.uk/child-under-5-years/what-to-keep-in-your-medicine-cabinet" target="_blank" rel="noreferrer">Healthier Together · Medicine cabinet ↗</a></div>
    </div>
  );
}
