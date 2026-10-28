import { Favorite, Link, Note, SourceLinks } from "../components/UI";
import { guides } from "../data/guides";
import { useApp } from "../hooks/useApp";
import { NotFound } from "./Knowledge";

function theme(category: string) {
  if (category === "sleep") return { icon:"☾", a:"#DCD8E8", b:"#A8B4C7", label:"СОН" };
  if (category === "speech") return { icon:"◌", a:"#E8D7E8", b:"#C8AECF", label:"РЕЧЬ" };
  if (category === "nutrition") return { icon:"○", a:"#E5E8D5", b:"#A9BD8D", label:"ПИТАНИЕ" };
  if (category === "potty") return { icon:"◇", a:"#E8DFCF", b:"#CEAA7B", label:"САМОСТОЯТЕЛЬНОСТЬ" };
  if (category === "safety") return { icon:"+", a:"#F0DCD6", b:"#C88978", label:"БЕЗОПАСНОСТЬ" };
  return { icon:"✦", a:"#E4EAD9", b:"#9EB48A", label:"РАЗВИТИЕ" };
}

function GuideHeroVisual({ category }: { category: string }) {
  const t = theme(category);
  return (
    <svg viewBox="0 0 520 260" className="guide-v3-hero-svg" role="img" aria-label={`Инфографика: ${t.label}`}>
      <defs><linearGradient id={`g-${category}`} x1="0" x2="1"><stop offset="0" stopColor={t.a}/><stop offset="1" stopColor="#FBF7F1"/></linearGradient></defs>
      <rect x="0" y="0" width="520" height="260" rx="34" fill={`url(#g-${category})`} />
      <circle cx="386" cy="102" r="73" fill="#FFFFFF88" />
      <circle cx="386" cy="102" r="48" fill={t.b} opacity=".82" />
      <text x="386" y="119" textAnchor="middle" fontSize="54" fill="#fff">{t.icon}</text>
      <path d="M56 188 C130 120 193 210 270 145" fill="none" stroke={t.b} strokeWidth="8" strokeLinecap="round" opacity=".72"/>
      <circle cx="58" cy="188" r="12" fill={t.b}/><circle cx="166" cy="170" r="12" fill={t.b}/><circle cx="270" cy="145" r="12" fill={t.b}/>
      <text x="54" y="66" fontSize="14" letterSpacing="3" fill="#756B63">МЕТОДИЧЕСКОЕ ПОСОБИЕ</text>
      <text x="54" y="98" fontSize="22" fill="#574D46">понять → попробовать → наблюдать</text>
    </svg>
  );
}

function DecisionVisual({ steps }: { steps: string[] }) {
  return (
    <div className="guide-decision-v3" aria-label="Пошаговый алгоритм">
      {steps.slice(0,4).map((step,index)=><div key={step}><span>{index+1}</span><p>{step}</p>{index<Math.min(steps.length,4)-1&&<i aria-hidden="true">↓</i>}</div>)}
    </div>
  );
}

export function GuideDetailV3({ id }: { id: string }) {
  const guide = guides.find((item)=>item.id===id);
  const { data, update } = useApp();
  if (!guide) return <NotFound />;
  const done = data.practice[guide.id] || [];
  const t = theme(guide.category);
  const progress = Math.round((done.length / Math.max(guide.practice.length,1))*100);

  return (
    <div className="guide-v3-page">
      <Link to={guide.category === "safety" ? "manuals" : guide.category} className="back guide-v3-back">←</Link>
      <section className="guide-v3-hero">
        <div className="guide-v3-title"><p className="eyebrow">{t.label} · ПОЛНОЕ ПОСОБИЕ</p><h1>{guide.title}</h1><p>{guide.lead}</p><div className="guide-v3-meta"><span>{guide.practice.length} дней практики</span><span>алгоритм</span><span>красные флаги</span></div></div>
        <GuideHeroVisual category={guide.category} />
      </section>

      <div className="guide-v3-actions"><Favorite id={guide.id}/><Link to="manuals" className="secondary">Все пособия</Link></div>

      <nav className="guide-v3-map" aria-label="Карта пособия">
        {["Что происходит","Почему","Как оценить","Что делать","Практика","Если не работает","Когда к специалисту"].map((item,i)=><a key={item} href={`#guide-section-${i+1}`}><b>{i+1}</b><span>{item}</span></a>)}
      </nav>

      <section id="guide-section-1" className="guide-chapter-v3">
        <div className="guide-chapter-head"><span>01</span><div><p className="eyebrow">СНАЧАЛА ПОНИМАЕМ</p><h2>Что происходит</h2></div></div>
        <div className="guide-chapter-grid"><p>{guide.what}</p><div className="guide-concept-visual"><span className="concept-one"/><span className="concept-two"/><span className="concept-three"/><b>сигнал</b><b>реакция</b><b>поддержка</b></div></div>
      </section>

      <section id="guide-section-2" className="guide-chapter-v3 alt">
        <div className="guide-chapter-head"><span>02</span><div><p className="eyebrow">КОНТЕКСТ</p><h2>Почему это может происходить</h2></div></div>
        <p>{guide.why}</p>
        <div className="guide-age-band-v3"><span>возраст</span><i/><p>{guide.ages}</p></div>
      </section>

      <section id="guide-section-3" className="guide-chapter-v3">
        <div className="guide-chapter-head"><span>03</span><div><p className="eyebrow">НАБЛЮДЕНИЕ</p><h2>Как понять именно вашу ситуацию</h2></div></div>
        <div className="guide-observe-v3"><div><b>1</b><strong>Смотрим</strong><small>когда и после чего возникает ситуация</small></div><div><b>2</b><strong>Записываем</strong><small>2–3 повторяющихся признака, а не всё подряд</small></div><div><b>3</b><strong>Сравниваем</strong><small>самочувствие ребёнка и нагрузку семьи</small></div></div>
        <p>{guide.assess}</p>
      </section>

      <section id="guide-section-4" className="guide-chapter-v3 alt">
        <div className="guide-chapter-head"><span>04</span><div><p className="eyebrow">АЛГОРИТМ</p><h2>Что делать по шагам</h2></div></div>
        <DecisionVisual steps={guide.steps}/>
        {guide.steps.length>4&&<ol className="guide-extra-steps">{guide.steps.slice(4).map((step)=><li key={step}>{step}</li>)}</ol>}
        <div className="guide-today-tomorrow"><article><small>СЕГОДНЯ</small><strong>Один маленький шаг</strong><p>{guide.today}</p></article><article><small>ЗАВТРА</small><strong>Проверяем эффект</strong><p>{guide.tomorrow}</p></article></div>
      </section>

      <section id="guide-section-5" className="guide-chapter-v3">
        <div className="guide-chapter-head"><span>05</span><div><p className="eyebrow">ПРАКТИКУМ</p><h2>{guide.practice.length} дней без гонки</h2></div></div>
        <div className="guide-progress-v3"><div className="guide-progress-ring" style={{"--progress":`${progress*3.6}deg`} as React.CSSProperties}><span>{progress}%</span></div><div><strong>{done.length} из {guide.practice.length}</strong><p>Отметки хранятся на этом устройстве. Пауза — тоже нормальный выбор.</p></div></div>
        <div className="guide-practice-v3">{guide.practice.map((step,i)=><label key={step} className={done.includes(i)?"done":""}><input type="checkbox" checked={done.includes(i)} onChange={()=>update((d)=>({...d,practice:{...d.practice,[guide.id]:done.includes(i)?done.filter((x)=>x!==i):[...done,i]}}))}/><span>{i+1}</span><div><strong>День {i+1}</strong><p>{step}</p></div></label>)}</div>
      </section>

      <section id="guide-section-6" className="guide-chapter-v3 warning-soft">
        <div className="guide-chapter-head"><span>06</span><div><p className="eyebrow">НЕ СРАБОТАЛО?</p><h2>Не усиливаем давление</h2></div></div>
        <div className="guide-two-col"><article><strong>Частые ошибки</strong><p>{guide.errors}</p></article><article><strong>План B</strong><p>{guide.fallback}</p></article></div>
      </section>

      <section id="guide-section-7" className="guide-chapter-v3 danger-soft">
        <div className="guide-chapter-head"><span>07</span><div><p className="eyebrow">КРАСНЫЕ ФЛАГИ</p><h2>Когда нужна профессиональная оценка</h2></div></div>
        <div className="guide-red-visual" aria-hidden="true"><span>!</span><i/><b/></div><p>{guide.doctor}</p>
      </section>

      <section className="guide-sources-v3"><p className="eyebrow">ИСТОЧНИКИ И ПРОВЕРКА</p><h2>На чём основано пособие</h2><SourceLinks ids={guide.sources}/><Note>Пособие помогает организовать наблюдение и действия, но не является диагностической шкалой и не обещает результат за фиксированное число дней.</Note></section>
    </div>
  );
}
