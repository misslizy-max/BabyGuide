import { useState } from "react";
import { useApp } from "../hooks/useApp";
import {
  Heading,
  Link,
  Note,
  Favorite,
  SpeechButton,
  Steps,
  SourceLinks,
} from "../components/UI";
import {
  categories,
  articles as oldArticles,
  sources as oldSources,
} from "../content.js";
import { healthArticles } from "../data/health";
import { development, domainNames, controlMonths } from "../data/development";
import { games, gameCategories } from "../data/games";
import { guides } from "../data/guides";
import { recipes } from "../data/nutrition";
import { rhymes } from "../data/rhymes";
import { stories, personalize } from "../data/stories";
import { sourceLibrary } from "../data/sources";
import { months } from "../utils/dates";
import { learningCards, cardCategories } from "../data/cards";
import type { Reading } from "../types";
const readings = [...(oldArticles as Reading[]), ...healthArticles];
export const allCategories = [
  ...categories,
  {
    id: "stories",
    icon: "📚",
    title: "Поддерживающие истории",
    sub: "17 знакомых ситуаций",
    color: "lilac",
  },
  {
    id: "cards",
    icon: "🐱",
    title: "Карточки",
    sub: "Слова, образы и звуки",
    color: "yellow",
  },
  {
    id: "words",
    icon: "🎙",
    title: "Первые слова",
    sub: "Личный аудиодневник",
    color: "peach",
  },
  {
    id: "sources",
    icon: "🔎",
    title: "Источники",
    sub: "На чём основаны материалы",
    color: "green",
  },
];
export const entries = [
  ...readings
    .filter((a) => !["games", "rhymes", "guides"].includes(a.category))
    .map((a) => ({
      id: a.id,
      path: "article/" + a.id,
      title: a.title,
      lead: a.lead,
      icon: "📖",
      kind: a.category,
      search: a.blocks.flat().join(" "),
    })),
  ...guides.map((g) => ({
    id: g.id,
    path: "guide/" + g.id,
    title: g.title,
    lead: g.lead,
    icon: "📘",
    kind: "guide",
    search: g.what + " " + g.assess,
  })),
  ...games.map((g) => ({
    id: g.id,
    path: "game/" + g.id,
    title: g.title,
    lead: g.goal,
    icon: g.icon,
    kind: "game",
    search: g.category + " " + g.steps.join(" "),
  })),
  ...recipes.map((r) => ({
    id: r.id,
    path: "recipe/" + r.id,
    title: r.name,
    lead: r.ingredients.map((i) => i.name).join(", "),
    icon: r.icon,
    kind: "recipe",
    search: r.allergens.join(" "),
  })),
  ...rhymes.map((r) => ({
    id: r.id,
    path: "rhyme/" + r.id,
    title: r.title,
    lead: r.goal,
    icon: r.icon,
    kind: "rhyme",
    search: r.text,
  })),
  ...stories.map((s) => ({
    id: s.id,
    path: "story/" + s.id,
    title: s.title,
    lead: s.topic,
    icon: s.icon,
    kind: "story",
    search: s.paragraphs.join(" "),
  })),
  ...development.map((d) => ({
    id: "month-" + d.month,
    path: "development/" + d.month,
    title: d.month + " мес. · " + d.title,
    lead: d.skills,
    icon: "🌱",
    kind: "development",
    search: d.domains.join(" "),
  })),
];
export function EntryCard({ entry }: { entry: (typeof entries)[number] }) {
  return (
    <Link to={entry.path} className="article-card">
      <span className="circle-icon peach">{entry.icon}</span>
      <h3>{entry.title}</h3>
      <p>{entry.lead}</p>
      <span className="text-link">Открыть →</span>
    </Link>
  );
}
export function Library() {
  const { data } = useApp();
  const [query, setQuery] = useState(""),
    [submitted, setSubmitted] = useState("");
  const q = submitted.toLocaleLowerCase("ru").replace(/ё/g, "е");
  const found = entries.filter((e) =>
    (e.title + " " + e.lead + " " + e.search)
      .toLocaleLowerCase("ru")
      .replace(/ё/g, "е")
      .includes(q),
  );
  return (
    <>
      <Heading
        title="Библиотека заботы"
        sub="Полная библиотека и глобальный поиск"
      />
      <form
        id="library-search"
        className="search"
        onSubmit={(e) => {
          e.preventDefault();
          setSubmitted(query.trim());
        }}
      >
        <label className="sr-only" htmlFor="library-q">
          Поиск по библиотеке
        </label>
        <input
          id="library-q"
          name="query"
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Симптом, игра, рецепт или месяц"
        />
        <button className="button">Найти</button>
      </form>
      {submitted ? (
        <>
          <div className="section-title">
            <h2>Найдено: {found.length}</h2>
            <button
              className="text-button"
              onClick={() => {
                setQuery("");
                setSubmitted("");
              }}
            >
              Сбросить
            </button>
          </div>
          <div className="article-grid">
            {found.map((e) => (
              <EntryCard key={e.path} entry={e} />
            ))}
          </div>
          {!found.length && (
            <Note>
              Попробуйте другой запрос: «рвота», «гречка», «мяч» или «6 мес».
            </Note>
          )}
        </>
      ) : (
        <>
          <div className="category-grid">
            {allCategories.map((c) => (
              <Link to={c.id} key={c.id} className="category-card">
                <span className={"circle-icon " + c.color}>{c.icon}</span>
                <h3>{c.title}</h3>
                <p>{c.sub}</p>
                <span className="arrow">→</span>
              </Link>
            ))}
          </div>
          <section className="section">
            <div className="section-title">
              <h2>Избранное</h2>
              <Link to="favorites" className="text-link">
                Все сохранённые →
              </Link>
            </div>
            <div className="article-grid">
              {entries
                .filter((e) => data.favorites.includes(e.id))
                .slice(0, 4)
                .map((e) => (
                  <EntryCard key={e.path} entry={e} />
                ))}
            </div>
            {!data.favorites.length && (
              <Note>
                Сохраняйте игры, рецепты, гайды, истории и потешки кнопкой «В
                избранное».
              </Note>
            )}
          </section>
        </>
      )}
    </>
  );
}
export function Favorites() {
  const { data } = useApp();
  const list = entries.filter((e) => data.favorites.includes(e.id));
  return (
    <>
      <Heading title="Избранное" back="more" sub="Ваши сохранённые материалы" />
      <div className="article-grid">
        {list.map((e) => (
          <EntryCard key={e.path} entry={e} />
        ))}
      </div>
      {!list.length && (
        <Note>
          Пока ничего не сохранено. Откройте материал в библиотеке и нажмите
          сердечко.
        </Note>
      )}
    </>
  );
}
export function Recommendations() {
  const { data } = useApp(),
    age = Math.min(months(data.profile.birth) || 0, 36);
  const game = games.filter((g) => age >= g.min && age <= g.max).slice(0, 3),
    g = guides.find(
      (x) => x.id === (age >= 18 ? "potty-plan" : "bedtime-ritual"),
    )!;
  const selected = entries.filter(
    (e) =>
      game.some((g) => g.id === e.id) ||
      e.id === g.id ||
      e.id === (age < 12 ? "feeding" : "menu-guide") ||
      e.id === "speech-seven",
  );
  return (
    <>
      <Heading
        title="Рекомендации"
        sub={
          data.profile.birth
            ? `Сейчас малышу ${age} мес. · выбирайте удобное`
            : "Заполните профиль для рекомендаций по возрасту"
        }
      />
      <Link to="development" className="feature-banner">
        <span>🌱</span>
        <div>
          <h2>{development[age].title}</h2>
          <p>{development[age].activity}</p>
        </div>
        <span>→</span>
      </Link>
      <div className="article-grid">
        {selected.map((e) => (
          <EntryCard key={e.path} entry={e} />
        ))}
      </div>
      <Link to="menu-builder" className="button">
        Собрать меню по профилю →
      </Link>
    </>
  );
}
export function Article({ id }: { id: string }) {
  const a = readings.find((a) => a.id === id);
  if (!a) return <NotFound />;
  const source =
    healthArticles.some((h) => h.id === a.id) ||
    (a.category === "health" && a.source === undefined)
      ? ["NHS · Baby health", "https://www.nhs.uk/conditions/baby/health/"]
      : oldSources[a.source ?? (a.category === "health" ? 3 : 1)];
  return (
    <>
      <Heading title={a.title} sub={a.age} back={a.category} />
      <article className="reading">
        <p className="lead">{a.lead}</p>
        <div className="actions">
          <Favorite id={a.id} />
          <SpeechButton
            text={[a.title, a.lead, ...a.blocks.flat()].join(". ")}
          />
        </div>
        {a.category === "health" && (
          <Note danger>
            Не ставит диагноз и не заменяет осмотр. При нарушении дыхания,
            сознания или быстром ухудшении — 112.
          </Note>
        )}
        {a.blocks.map(([h, p], i) => (
          <section key={i}>
            <h2>{h}</h2>
            <p className="preserve-lines">{p}</p>
          </section>
        ))}
        {a.category === "health" && (
          <div className="actions">
            <Link to="temperature" className="secondary">
              Записать температуру
            </Link>
            <Link to="medicines" className="secondary">
              Расчёт по весу и концентрации
            </Link>
          </div>
        )}
        <div className="source">
          <strong>Основание и дополнительное чтение</strong>
          <p>
            <a href={source[1]} target="_blank" rel="noopener noreferrer">
              {source[0]} ↗
            </a>
          </p>
          <Link to="sources">Методика и полная библиотека источников →</Link>
        </div>
      </article>
    </>
  );
}
export function Category({ id }: { id: string }) {
  const c = allCategories.find((c) => c.id === id);
  if (!c) return <NotFound />;
  const list = readings.filter(
    (a) => a.category === id && !["guides", "games", "rhymes"].includes(id),
  );
  const gs = guides.filter((g) => g.category === id || id === "guides");
  return (
    <>
      <Heading title={c.title} sub={c.sub} back="more" />
      {id === "health" && (
        <>
          <Note danger>
            <strong>
              Тяжёлое дыхание, посинение, отсутствие реакции — экстренная
              помощь.
            </strong>
            <div className="actions">
              <Link to="article/red-flags" className="secondary">
                Красные флаги →
              </Link>
              <a className="danger-button" href="tel:112">
                Позвонить 112
              </a>
            </div>
          </Note>
          <div className="quick-grid">
            <Link to="temperature" className="secondary">
              Температура и график
            </Link>
            <Link to="medicines" className="secondary">
              Парацетамол / ибупрофен
            </Link>
            <Link to="article/first-aid" className="secondary">
              Первая помощь
            </Link>
          </div>
        </>
      )}
      {id === "nutrition" && (
        <div className="quick-grid">
          <Link to="menu" className="secondary">
            Меню на 14 дней
          </Link>
          <Link to="menu-builder" className="secondary">
            Собрать меню
          </Link>
          <Link to="safe-food" className="secondary">
            Безопасная подача
          </Link>
        </div>
      )}
      {id === "sleep" && (
        <Link to="sleep-log" className="feature-banner">
          <span>☾</span>
          <div>
            <h2>Дневник и временная шкала сна</h2>
            <p>Дневные и ночные сны, история и сумма за сутки</p>
          </div>
          <span>→</span>
        </Link>
      )}
      {id === "speech" && (
        <Link to="words" className="feature-banner">
          <span>🎙</span>
          <div>
            <h2>Мои первые слова</h2>
            <p>Сохранить слово, возраст и голос</p>
          </div>
          <span>→</span>
        </Link>
      )}
      <div className="article-grid">
        {gs.map((g) => (
          <EntryCard key={g.id} entry={entries.find((e) => e.id === g.id)!} />
        ))}
        {list.map((a) => (
          <EntryCard key={a.id} entry={entries.find((e) => e.id === a.id)!} />
        ))}
      </div>
      {id === "speech" && (
        <>
          <h2>Игры в общение</h2>
          <div className="article-grid">
            {games
              .filter((g) => g.category === "Речь")
              .map((g) => (
                <EntryCard
                  key={g.id}
                  entry={entries.find((e) => e.id === g.id)!}
                />
              ))}
          </div>
        </>
      )}
    </>
  );
}
export function Development({ selected }: { selected?: string }) {
  const { data } = useApp();
  const [month, setMonth] = useState(() =>
    selected && /^\d+$/.test(selected)
      ? Math.min(36, Number(selected))
      : Math.min(months(data.profile.birth) || 0, 36),
  );
  const d = development[month];
  return (
    <>
      <Heading
        title="Растём месяц за месяцем"
        sub="Каждый месяц 0–36 · без гонки за навыками"
        back="more"
      />
      <div className="month-picker">
        <label htmlFor="month">Возраст малыша</label>
        <select
          id="month"
          value={month}
          onChange={(e) => setMonth(Number(e.target.value))}
        >
          {development.map((x) => (
            <option key={x.month} value={x.month}>
              {x.month} мес.
            </option>
          ))}
        </select>
        <div className="actions">
          <button
            className="secondary"
            aria-label="Предыдущий месяц"
            disabled={month === 0}
            onClick={() => setMonth(month - 1)}
          >
            ←
          </button>
          <button
            className="secondary"
            aria-label="Следующий месяц"
            disabled={month === 36}
            onClick={() => setMonth(month + 1)}
          >
            →
          </button>
        </div>
      </div>
      <Note>
        {d.control
          ? "Контрольный возраст CDC. Ориентиры помогают заметить повод для обсуждения, но не заменяют оценку специалиста."
          : "Ориентир / идеи для развития. Промежуточный месяц не является отдельной диагностической нормой CDC."}{" "}
        При недоношенности обсудите скорректированный возраст.
      </Note>
      <section className="development-card">
        <span className="pill">{month} МЕСЯЦЕВ · ВАШ ЭТАП</span>
        <h2>{d.title}</h2>
        <p>{d.skills}</p>
        <h3>Что тренировать в игре</h3>
        <p>{d.activity}</p>
      </section>
      <div className="domain-grid">
        {d.domains.map((text, i) => (
          <section className="domain-card" key={i}>
            <span className="domain-number">0{i + 1}</span>
            <h3>{domainNames[i]}</h3>
            <p>{text}</p>
          </section>
        ))}
      </div>
      <section className="reading">
        <h2>Красные флаги и оценка специалиста</h2>
        <p>{d.flags}</p>
        <Note danger>
          Потеря освоенного навыка, отсутствие реакции на звук или контакт,
          выраженная асимметрия — повод обратиться в любом возрасте, не
          дожидаясь следующего месяца.
        </Note>
        <h2>Контрольные возраста CDC</h2>
        <div className="chips">
          {controlMonths.map((m) => (
            <button key={m} className="secondary" onClick={() => setMonth(m)}>
              {m} мес.
            </button>
          ))}
        </div>
        <SourceLinks ids={[sourceLibrary[0].url]} />
      </section>
      <section className="section">
        <h2>Подходящие игры</h2>
        <div className="article-grid">
          {games
            .filter((g) => month >= g.min && month <= g.max)
            .slice(0, 3)
            .map((g) => (
              <EntryCard
                key={g.id}
                entry={entries.find((e) => e.id === g.id)!}
              />
            ))}
        </div>
      </section>
      <Link to="diary" className="button">
        Записать свой навык →
      </Link>
    </>
  );
}
export function Games() {
  const { data } = useApp();
  const [age, setAge] = useState(
      String(Math.min(months(data.profile.birth) || 0, 36)),
    ),
    [cat, setCat] = useState(""),
    [time, setTime] = useState(""),
    [material, setMaterial] = useState("");
  const list = games.filter(
    (g) =>
      (age === "" || (Number(age) >= g.min && Number(age) <= g.max)) &&
      (!cat || g.category === cat) &&
      (!time || g.minutes <= Number(time)) &&
      (!material || g.material === material),
  );
  return (
    <>
      <Heading
        title="Библиотека игр"
        sub="70 разных игр · не ускорять, а исследовать вместе"
        back="more"
      />
      <div className="filter-panel">
        <label>
          Возраст
          <select value={age} onChange={(e) => setAge(e.target.value)}>
            <option value="">Все возрасты</option>
            {development.map((d) => (
              <option key={d.month} value={d.month}>
                {d.month} мес.
              </option>
            ))}
          </select>
        </label>
        <label>
          Навык
          <select value={cat} onChange={(e) => setCat(e.target.value)}>
            <option value="">Все навыки</option>
            {gameCategories.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </label>
        <label>
          Время
          <select value={time} onChange={(e) => setTime(e.target.value)}>
            <option value="">Любое</option>
            <option value="3">До 3 минут</option>
            <option value="5">До 5 минут</option>
            <option value="10">До 10 минут</option>
          </select>
        </label>
        <label>
          Материалы дома
          <select
            value={material}
            onChange={(e) => setMaterial(e.target.value)}
          >
            <option value="">Любые</option>
            {[...new Set(games.map((g) => g.material))].map((m) => (
              <option key={m}>{m}</option>
            ))}
          </select>
        </label>
      </div>
      <p className="muted">Найдено игр: {list.length}</p>
      <div className="article-grid">
        {list.map((g) => (
          <EntryCard key={g.id} entry={entries.find((e) => e.id === g.id)!} />
        ))}
      </div>
      {!list.length && (
        <Note>
          Такого сочетания нет. Измените возраст, время или материалы.
        </Note>
      )}
    </>
  );
}
export function GameDetail({ id }: { id: string }) {
  const g = games.find((g) => g.id === id);
  if (!g) return <NotFound />;
  return (
    <>
      <Heading
        title={g.title}
        sub={`${g.min}–${g.max} мес. · ${g.minutes} мин. · ${g.level}`}
        back="games"
      />
      <div className="activity-visual" role="img" aria-label={g.title}>
        <span>{g.icon}</span>
        <small>{g.category}</small>
      </div>
      <article className="reading">
        <Favorite id={g.id} />
        <h2>Цель и навык</h2>
        <p>
          {g.goal}. Следуйте интересу ребёнка, а не требованию выполнить
          правильно.
        </p>
        <h2>Материалы</h2>
        <p>{g.material}</p>
        <h2>Подготовка</h2>
        <p>{g.prep}</p>
        <h2>Игра по шагам</h2>
        <Steps items={g.steps} />
        <Note danger>
          <strong>Безопасность: </strong>
          {g.safety} При усталости, отворачивании или плаче остановитесь.
        </Note>
        <Link to="diary" className="button">
          Записать наблюдение
        </Link>
      </article>
    </>
  );
}
export function GuideDetail({ id }: { id: string }) {
  const g = guides.find((g) => g.id === id);
  const { data, update } = useApp();
  if (!g) return <NotFound />;
  const done = data.practice[g.id] || [];
  return (
    <>
      <Heading
        title={g.title}
        sub={`Полный гайд · практикум ${g.practice.length} дней`}
        back={g.category === "safety" ? "guides" : g.category}
      />
      <article className="reading guide-reading">
        <p className="lead">{g.lead}</p>
        <Favorite id={g.id} />
        {[
          ["1. Что происходит", g.what],
          ["2. Почему", g.why],
          ["3. Возрастные особенности", g.ages],
          ["4. Как понять ситуацию", g.assess],
        ].map(([h, p]) => (
          <section key={h}>
            <h2>{h}</h2>
            <p>{p}</p>
          </section>
        ))}
        <section>
          <h2>5. Пошаговый алгоритм</h2>
          <ol>
            {g.steps.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ol>
        </section>
        <section>
          <h2>6. Визуальная схема</h2>
          <Steps items={g.steps} />
        </section>
        <section>
          <h2>7. Что сделать сегодня</h2>
          <p>{g.today}</p>
        </section>
        <section>
          <h2>8. Что сделать завтра</h2>
          <p>{g.tomorrow}</p>
        </section>
        <section>
          <h2>9. Практикум на {g.practice.length} дней</h2>
          <p>
            Отмечайте выполненное в удобном темпе. Не нужно завершать день, если
            ребёнку некомфортно. Прогресс хранится на устройстве.
          </p>
          <progress value={done.length} max={g.practice.length} />
          <p className="muted">
            Выполнено {done.length} из {g.practice.length}
          </p>
          {g.practice.map((step, i) => (
            <label key={i} className="check-row">
              <input
                type="checkbox"
                checked={done.includes(i)}
                onChange={() =>
                  update((d) => ({
                    ...d,
                    practice: {
                      ...d.practice,
                      [g.id]: done.includes(i)
                        ? done.filter((x) => x !== i)
                        : [...done, i],
                    },
                  }))
                }
              />
              <span>
                <strong>День {i + 1}</strong>
                <small>{step}</small>
              </span>
            </label>
          ))}
        </section>
        {[
          ["10. Частые ошибки", g.errors],
          ["11. Если не работает", g.fallback],
          ["12. Когда обратиться к специалисту", g.doctor],
        ].map(([h, p]) => (
          <section key={h}>
            <h2>{h}</h2>
            <p>{p}</p>
          </section>
        ))}
        <section>
          <h2>13. Источники</h2>
          <SourceLinks ids={g.sources} />
          <p className="small muted">
            Практикум — редакционный способ организации действий, а не
            официальная диагностическая шкала или обещание результата.
          </p>
        </section>
      </article>
    </>
  );
}
export function Rhymes() {
  return (
    <>
      <Heading
        title="Потешки с движениями"
        sub="20 полных авторских текстов · ритм и контакт"
        back="more"
      />
      <Note>
        Повторение по желанию. Не двигайте руками и ногами ребёнка силой. Для
        аудио используется системный русский голос устройства.
      </Note>
      <div className="article-grid">
        {rhymes.map((r) => (
          <EntryCard key={r.id} entry={entries.find((e) => e.id === r.id)!} />
        ))}
      </div>
    </>
  );
}
export function RhymeDetail({ id }: { id: string }) {
  const r = rhymes.find((r) => r.id === id);
  if (!r) return <NotFound />;
  return (
    <>
      <Heading title={r.title} sub={r.when} back="rhymes" />
      <div className="activity-visual">
        <span>{r.icon}</span>
      </div>
      <article className="reading">
        <div className="actions">
          <Favorite id={r.id} />
          <SpeechButton text={r.text} />
          <Link to={"child/rhyme/" + r.id} className="secondary">
            Крупный детский режим
          </Link>
        </div>
        <p className="poem">{r.text}</p>
        <h2>Движения</h2>
        <Steps items={r.movement} />
        <h2>Для чего</h2>
        <p>
          {r.goal}. Делайте паузы перед последним словом и принимайте жест или
          взгляд как ответ. Ладони и движения — по согласию ребёнка.
        </p>
      </article>
    </>
  );
}
export function Stories() {
  return (
    <>
      <Heading
        title="Поддерживающие истории"
        sub="17 ситуаций · читать, слушать, рассматривать"
        back="more"
      />
      <Note>
        Истории помогают говорить о переживаниях. Они не лечат психологические
        расстройства и не заменяют профессиональную помощь. Имя и любимая
        игрушка берутся из профиля.
      </Note>
      <div className="article-grid">
        {stories.map((s) => (
          <EntryCard key={s.id} entry={entries.find((e) => e.id === s.id)!} />
        ))}
      </div>
    </>
  );
}
export function StoryDetail({ id }: { id: string }) {
  const { data } = useApp(),
    s = stories.find((s) => s.id === id);
  if (!s) return <NotFound />;
  const text = s.paragraphs.map((p) =>
    personalize(p, data.profile.name, data.profile.toy),
  );
  return (
    <>
      <Heading title={s.title} sub={s.topic} back="stories" />
      <div className="activity-visual">
        <span>{s.icon}</span>
      </div>
      <article className="reading">
        <div className="actions">
          <Favorite id={s.id} />
          <SpeechButton text={text.join(" ")} />
          <Link to={"child/story/" + id} className="secondary">
            Показать ребёнку
          </Link>
        </div>
        {text.map((p, i) => (
          <p className="story-paragraph" key={i}>
            {p}
          </p>
        ))}
        <Note>
          <strong>Обсудите после чтения: </strong>
          {s.question}
        </Note>
        <Link to="profile" className="text-link">
          Изменить имя и любимую игрушку →
        </Link>
      </article>
    </>
  );
}
export function Sources() {
  const [filter, setFilter] = useState("");
  return (
    <>
      <Heading
        title="Библиотека источников"
        sub="Что именно лежит в основе материалов"
        back="more"
      />
      <label>
        Раздел
        <select value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="">Все источники</option>
          {[...new Set(sourceLibrary.map((s) => s.category))].map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
      </label>
      <Note>
        Официальные нормы, редакционные идеи и бытовые ориентиры разделены. Из
        игр и сказок не следуют диагностические выводы. Медицинская информация
        не заменяет местные инструкции препаратов и осмотр.
      </Note>
      {sourceLibrary
        .filter((s) => !filter || s.category === filter)
        .map((s) => (
          <article className="source-card" key={s.id}>
            <span className="tag">{s.category}</span>
            <h2>{s.title}</h2>
            <p>{s.use}</p>
            <a
              className="text-link"
              href={s.url}
              target="_blank"
              rel="noopener noreferrer"
            >
              Открыть источник ↗
            </a>
          </article>
        ))}
    </>
  );
}
export function NotFound() {
  return (
    <>
      <Heading
        title="Такой страницы нет"
        sub="Проверьте ссылку или вернитесь к своим разделам"
      />
      <Link to="home" className="button">
        На главную
      </Link>
    </>
  );
}

export function Cards() {
  const [category, setCategory] = useState("");
  const list = learningCards.filter(
    (c) => !category || c.category === category,
  );
  return (
    <>
      <Heading
        title="Развивающие карточки"
        sub="54 изображения · 9 категорий · озвучка и выбор"
        back="more"
      />
      <Link to="child/cards" className="button">
        Открыть крупный детский режим →
      </Link>
      <label className="section">
        Категория
        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="">Все категории</option>
          {cardCategories.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
      </label>
      <div className="card-preview-grid">
        {list.map((c) => (
          <section className="card-preview" key={c.id}>
            <span>{c.icon}</span>
            <h2>{c.word}</h2>
            <SpeechButton text={c.word} />
            {c.sound && <SpeechButton text={c.sound} label={c.sound} />}
          </section>
        ))}
      </div>
      <Note>
        Используется системный голос, звуки животных — голосовые
        звукоподражания. Для русского голоса офлайн может потребоваться загрузка
        в настройках устройства.
      </Note>
    </>
  );
}
