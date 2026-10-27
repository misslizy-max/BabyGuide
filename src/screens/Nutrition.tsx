import { useState } from "react";
import { useApp } from "../hooks/useApp";
import { Heading, Link, Note, Favorite, Steps } from "../components/UI";
import {
  recipes,
  foods,
  fortnight,
  slots,
  slotNames,
  regions,
} from "../data/nutrition";
import { candidates, foodMatches, eligible } from "../services/menu";
import { months } from "../utils/dates";
import { NotFound } from "./Knowledge";
import type { Recipe } from "../types";
export function Plate({ recipe }: { recipe: Recipe }) {
  return (
    <div
      className="plate-visual"
      role="img"
      aria-label={"Иллюстрация блюда: " + recipe.name}
    >
      <svg viewBox="0 0 300 190" aria-hidden="true">
        <ellipse cx="150" cy="105" rx="125" ry="75" fill="#e4d9cb" />
        <ellipse cx="150" cy="95" rx="125" ry="75" fill="#fffaf1" />
        <ellipse cx="150" cy="95" rx="99" ry="56" fill="#f1e8d9" />
        {recipe.ingredients
          .filter((i) => !["oil", "water"].includes(i.id))
          .map((i, n) => (
            <g
              key={i.id}
              transform={`translate(${92 + (n % 3) * 52},${74 + Math.floor(n / 3) * 25})`}
            >
              <ellipse
                rx="27"
                ry="18"
                fill={
                  ["carrot", "pumpkin"].includes(i.id)
                    ? "#e8aa76"
                    : ["broccoli", "zucchini", "peas", "avocado"].includes(i.id)
                      ? "#a9bd8c"
                      : [
                            "fish",
                            "chicken",
                            "turkey",
                            "beef",
                            "salmon",
                          ].includes(i.id)
                        ? "#d29d87"
                        : "#dec8a2"
                }
              />
              <path
                d="M-13-4h22m-19 8h17"
                stroke="#ffffff70"
                strokeWidth="3"
                strokeLinecap="round"
              />
            </g>
          ))}
        <text x="150" y="180" textAnchor="middle" fill="#7c6a56" fontSize="11">
          Состав и текстура — в рецепте ниже
        </text>
      </svg>
      <span>{recipe.icon}</span>
    </div>
  );
}
export function RecipeDetail({ id }: { id: string }) {
  const { data } = useApp();
  const r = recipes.find((r) => r.id === id);
  if (!r) return <NotFound />;
  const age = months(data.profile.birth),
    allowed = age === null || eligible(r, data.profile, age);
  return (
    <>
      <Heading
        title={r.name}
        sub={`От ${r.minAge} мес. · ${r.minutes} минут · небольшая ориентировочная порция`}
        back="recipes"
      />
      <Plate recipe={r} />
      <article className="reading">
        <Favorite id={r.id} />
        {!allowed && (
          <Note danger>
            Блюдо не соответствует возрасту или ограничениям профиля. Оно
            показано для ручного просмотра, но не будет автоматически включено в
            меню. Проверьте состав и выберите безопасную альтернативу.
          </Note>
        )}
        <h2>Продукты и количество</h2>
        <ul>
          {r.ingredients.map((i) => (
            <li key={i.id}>
              {i.name} — {i.grams} {i.id === "water" ? "мл" : "г"}
            </li>
          ))}
        </ul>
        <p className="small muted">
          Граммовки указаны до приготовления, если шаг явно не говорит «уже
          сваренный». Это не обязательный объём съеденного. До года молоко
          остаётся основой питания, число блюд подбирают по готовности.
        </p>
        <h2>Рецепт</h2>
        <Steps items={r.steps} />
        <h2>Текстура</h2>
        <p>{r.texture}. Все составляющие легко раздавливаются пальцами.</p>
        <h2>Подача и размер</h2>
        <p>{r.serving}</p>
        <p>
          На раннем этапе допустима ложка с размятой пищей или очень мягкая
          полоска длиной примерно с палец взрослого, выступающая из кулачка.
          Небольшие мягкие кусочки — при освоенном захвате и навыках, не просто
          по дате. Круглую твёрдую еду, целые орехи и плотные комки не
          предлагайте.
        </p>
        <Link to="safe-food" className="secondary">
          Визуальные примеры по возрастам →
        </Link>
        <h2>Аллергены</h2>
        <p>
          {r.allergens.length
            ? r.allergens.join(", ")
            : "В составе нет указанных основных аллергенов; индивидуальная реакция возможна на любой продукт."}{" "}
          Проверяйте этикетки и перекрёстные контакты. Не вводите сразу
          несколько новых аллергенов в одном блюде.
        </p>
        <h2>Замены</h2>
        <p>{r.substitutions}</p>
        <h2>Возрастные ограничения</h2>
        <p>
          Минимум {r.minAge} месяцев и готовность к указанной текстуре. До года
          — без мёда; непастеризованные продукты и недоготовленные мясо, рыба и
          яйцо исключены. Соль и сахар не нужны. При аллергии или заболеваниях
          нужен индивидуальный план.
        </p>
      </article>
    </>
  );
}
export function Recipes() {
  const { data } = useApp();
  const [slot, setSlot] = useState(""),
    [safe, setSafe] = useState(false);
  const age = months(data.profile.birth);
  const list = recipes.filter(
    (r) =>
      (!slot || r.slot === slot) &&
      (!safe || (age !== null && eligible(r, data.profile, age))),
  );
  return (
    <>
      <Heading
        title="Рецепты для маленьких"
        sub={`${recipes.length} полных рецепта · состав, текстура и безопасная подача`}
        back="nutrition"
      />
      <div className="filter-panel">
        <label>
          Приём пищи
          <select value={slot} onChange={(e) => setSlot(e.target.value)}>
            <option value="">Все блюда</option>
            {slots.map((s, i) => (
              <option value={s} key={s}>
                {slotNames[i]}
              </option>
            ))}
          </select>
        </label>
        <label className="check-row">
          <input
            type="checkbox"
            checked={safe}
            onChange={(e) => setSafe(e.target.checked)}
          />
          <span>Только подходящие профилю</span>
        </label>
      </div>
      {safe && age === null && (
        <Note>Для проверки возраста добавьте дату рождения в профиле.</Note>
      )}
      <div className="article-grid">
        {list.map((r) => (
          <Link key={r.id} to={"recipe/" + r.id} className="article-card">
            <span className="circle-icon peach">{r.icon}</span>
            <h3>{r.name}</h3>
            <p>
              От {r.minAge} мес. · {r.minutes} мин.
              <br />
              {r.allergens.join(", ") || "Без основных аллергенов в составе"}
            </p>
            <span className="text-link">Рецепт и подача →</span>
          </Link>
        ))}
      </div>
      {!list.length && (
        <Note>
          Подходящих блюд с такими фильтрами нет. Проверьте профиль и выбранный
          приём пищи.
        </Note>
      )}
    </>
  );
}
export function Fortnight() {
  const { data, update } = useApp(),
    [day, setDay] = useState(0);
  return (
    <>
      <Heading
        title="Меню на 14 дней"
        sub="Ориентировочный семейный рацион 12–36 месяцев"
        back="nutrition"
      />
      <Note>
        Готовое меню — библиотека идей, оно не адаптировано автоматически к
        аллергии. Конструктор учитывает ваш профиль. Порции определяются
        аппетитом, еда всегда в безопасной форме.
      </Note>
      <Link to="menu-builder" className="button">
        Собрать меню под ребёнка →
      </Link>
      <div className="days">
        {fortnight.map((_, i) => (
          <button
            key={i}
            className={"day " + (i === day ? "selected" : "")}
            aria-pressed={day === i}
            onClick={() => setDay(i)}
          >
            <small>ДЕНЬ</small>
            {i + 1}
            {data.menuDone.includes(i) && <span>✓</span>}
          </button>
        ))}
      </div>
      <section className="menu-card">
        <div className="section-title">
          <h2>День {day + 1}</h2>
          <button
            className="secondary"
            aria-pressed={data.menuDone.includes(day)}
            onClick={() =>
              update((d) => ({
                ...d,
                menuDone: d.menuDone.includes(day)
                  ? d.menuDone.filter((x) => x !== day)
                  : [...d.menuDone, day],
              }))
            }
          >
            {data.menuDone.includes(day) ? "✓ Приготовили" : "Отметить день"}
          </button>
        </div>
        {fortnight[day].map((id, i) => {
          const r = recipes.find((r) => r.id === id)!;
          return (
            <Link key={id} to={"recipe/" + id} className="meal recipe-meal">
              <span>{r.icon}</span>
              <div>
                <p className="eyebrow">{slotNames[i]}</p>
                <h3>{r.name}</h3>
                <p className="small muted">
                  {r.minutes} мин. · рецепт, продукты и граммовки
                </p>
              </div>
              <span className="meal-arrow">→</span>
            </Link>
          );
        })}
      </section>
      <Link to="recipes" className="secondary">
        Все рецепты →
      </Link>
    </>
  );
}
export function MenuBuilder() {
  const { data, update, notify } = useApp();
  const p = data.profile,
    age = months(p.birth);
  const [pantryOnly, setPantryOnly] = useState(false),
    [introduced, setIntroduced] = useState(age !== null && age < 12),
    [missing, setMissing] = useState<string[]>([]),
    [selectSlot, setSelectSlot] = useState<number | null>(null),
    [unavailable, setUnavailable] = useState<string[]>([]);
  const plan = data.menuPlan,
    region = data.travelCity?.region || p.region;
  const options = { pantryOnly, onlyIntroduced: introduced, region };
  const listFor = (i: number) =>
    candidates(p, age ?? 0, slots[i], options).filter(
      (r) => !r.ingredients.some((x) => unavailable.includes(x.id)),
    );
  function setOne(i: number, id: string) {
    update((d) => ({
      ...d,
      menuPlan: slots.map((_, j) => (j === i ? id : d.menuPlan[j] || "")),
    }));
  }
  function swap(i: number) {
    const list = listFor(i).filter((r) => r.id !== plan[i]);
    if (!list.length) {
      notify(
        "Нет другой подходящей замены. Измените запасы или условия, не снимая медицинские ограничения.",
      );
      return;
    }
    setOne(i, list[0].id);
    notify("Изменено только одно блюдо");
  }
  function build() {
    if (age === null) {
      notify("Добавьте дату рождения в профиле");
      return;
    }
    if (age < 6) {
      notify(
        "До готовности к прикорму рацион обсуждают с врачом. Конструктор не заменяет молочное питание.",
      );
      return;
    }
    const next = slots.map((_, i) => listFor(i)[0]?.id || "");
    if (update((d) => ({ ...d, menuPlan: next })))
      notify("Меню собрано по ограничениям профиля");
  }
  return (
    <>
      <Heading
        title="Собрать меню"
        sub="Возраст, ограничения, регион и продукты дома"
        back="nutrition"
      />
      <Note>
        Для аллергии используйте понятные группы: молоко, яйцо, рыба, глютен,
        соя, или точное название продукта. Неизвестная перекрёстная аллергия не
        определяется автоматически. Перед приготовлением проверяйте рецепт и
        упаковки.
      </Note>
      {age !== null && age < 12 && (
        <Note>
          До года эти четыре карточки — варианты блюд, а не обязательный план
          четырёх кормлений. Молоко остаётся основой питания, число приёмов и
          объём прикорма подбираются по готовности. При известных аллергиях
          сначала согласуйте рацион.
        </Note>
      )}
      <section className="form-card">
        <div className="section-title">
          <h2>Условия на сегодня</h2>
          <Link to="profile" className="text-link">
            Изменить профиль →
          </Link>
        </div>
        <p>
          {age === null ? "Возраст не указан" : age + " мес."} · {p.feeding} ·{" "}
          {regions.find(([v]) => v === region)?.[1] || region}
        </p>
        <p className="small">
          Исключаем:{" "}
          {[...p.allergies, ...p.excluded].join(", ") ||
            "ограничения в профиле не указаны"}
        </p>
        <label>
          Регион меню
          <select
            value={region}
            onChange={(e) =>
              update((d) => ({
                ...d,
                profile: { ...d.profile, region: e.target.value },
                travelCity: d.travelCity
                  ? { ...d.travelCity, region: e.target.value }
                  : null,
              }))
            }
          >
            {regions.map(([v, n]) => (
              <option value={v} key={v}>
                {n}
              </option>
            ))}
          </select>
        </label>
        <details open>
          <summary>Что есть дома · {p.pantry.length} продуктов</summary>
          <div className="product-grid">
            {Object.entries(foods)
              .filter(([id]) => !["water", "oil"].includes(id))
              .map(([id, f]) => (
                <button
                  key={id}
                  className={
                    "product-chip " +
                    (foodMatches(id, p.pantry) ? "selected" : "")
                  }
                  aria-pressed={foodMatches(id, p.pantry)}
                  onClick={() =>
                    update((d) => ({
                      ...d,
                      profile: {
                        ...d.profile,
                        pantry: foodMatches(id, d.profile.pantry)
                          ? d.profile.pantry.filter(
                              (x) => !foodMatches(id, [x]),
                            )
                          : [...d.profile.pantry, id],
                      },
                    }))
                  }
                >
                  {foodMatches(id, p.pantry) ? "✓ " : ""}
                  {f.name}
                </button>
              ))}
          </div>
        </details>
        <label className="check-row">
          <input
            type="checkbox"
            checked={pantryOnly}
            onChange={(e) => setPantryOnly(e.target.checked)}
          />
          <span>Строго из продуктов дома (вода и масло предполагаются)</span>
        </label>
        <label className="check-row">
          <input
            type="checkbox"
            checked={introduced}
            onChange={(e) => setIntroduced(e.target.checked)}
          />
          <span>Только уже введённые продукты</span>
        </label>
        <p className="small muted">
          Если режим запасов выключен, продукты дома, сезон, регион и
          предпочтения влияют на приоритет. Возраст, аллергии и исключения всё
          равно соблюдаются. Вода и масло не считаются новыми ингредиентами для
          фильтра.
        </p>
        <button className="button" onClick={build}>
          Собрать меню
        </button>
      </section>
      {plan.length === 4 && (
        <div className="builder-plan">
          {slots.map((slot, i) => {
            const r = recipes.find((r) => r.id === plan[i]),
              stillSafe =
                r &&
                age !== null &&
                eligible(r, p, age, introduced) &&
                (!pantryOnly ||
                  r.ingredients.every(
                    (x) =>
                      ["water", "oil"].includes(x.id) ||
                      foodMatches(x.id, p.pantry),
                  ));
            return (
              <section key={slot} className="menu-card" data-slot={slot}>
                <p className="eyebrow">{slotNames[i]}</p>
                {r ? (
                  <>
                    <Link to={"recipe/" + r.id}>
                      <h2>
                        {r.icon} {r.name}
                      </h2>
                      <p className="text-link">Рецепт и безопасная подача →</p>
                    </Link>
                    {!stillSafe && (
                      <Note danger>
                        Условия изменились. Это блюдо больше не соответствует
                        текущим фильтрам — замените его перед приготовлением.
                      </Note>
                    )}
                    <p>{r.ingredients.map((x) => x.name).join(", ")}</p>
                    <div className="actions">
                      <button className="secondary" onClick={() => swap(i)}>
                        Другое блюдо
                      </button>
                      <button
                        className="secondary"
                        onClick={() =>
                          setSelectSlot(selectSlot === i ? null : i)
                        }
                      >
                        Заменить
                      </button>
                      <button
                        className="secondary"
                        onClick={() =>
                          setMissing(
                            missing.includes(slot)
                              ? missing.filter((x) => x !== slot)
                              : [...missing, slot],
                          )
                        }
                      >
                        Нет продукта
                      </button>
                      <button
                        className="text-button"
                        onClick={() => {
                          update((d) => ({
                            ...d,
                            profile: {
                              ...d.profile,
                              dislikes: [...d.profile.dislikes, r.name],
                            },
                          }));
                          const next = listFor(i).find((x) => x.id !== r.id);
                          if (next) setOne(i, next.id);
                          notify("Блюдо добавлено в «не любит»");
                        }}
                      >
                        Не нравится
                      </button>
                    </div>
                    {missing.includes(slot) && (
                      <div className="product-grid">
                        {r.ingredients
                          .filter((x) => !["water", "oil"].includes(x.id))
                          .map((x) => (
                            <button
                              className="product-chip"
                              key={x.id}
                              onClick={() => {
                                const absent = [...unavailable, x.id];
                                setUnavailable(absent);
                                const next = candidates(
                                  p,
                                  age ?? 0,
                                  slot,
                                  options,
                                ).find(
                                  (v) =>
                                    v.id !== r.id &&
                                    !v.ingredients.some((ing) =>
                                      absent.includes(ing.id),
                                    ),
                                );
                                update((d) => ({
                                  ...d,
                                  profile: {
                                    ...d.profile,
                                    pantry: d.profile.pantry.filter(
                                      (v) => !foodMatches(x.id, [v]),
                                    ),
                                  },
                                  menuPlan: d.menuPlan.map((id, j) =>
                                    j === i ? next?.id || "" : id,
                                  ),
                                }));
                                setMissing(missing.filter((v) => v !== slot));
                                notify(
                                  next
                                    ? "Блюдо заменено без отсутствующего продукта"
                                    : "Подходящая замена не найдена. Выберите продукт вручную или измените запасы.",
                                );
                              }}
                            >
                              {x.name} — нет
                            </button>
                          ))}
                      </div>
                    )}
                  </>
                ) : (
                  <Note>
                    Подходящего блюда для этого приёма нет. Добавьте продукты
                    или откройте ручной выбор; аллергии не будут
                    проигнорированы.
                  </Note>
                )}
                <button
                  className="text-button"
                  onClick={() => setSelectSlot(selectSlot === i ? null : i)}
                >
                  Выбрать вручную
                </button>
                {selectSlot === i && (
                  <div className="replacement-list">
                    {listFor(i).map((x) => (
                      <button
                        key={x.id}
                        className="city-result"
                        onClick={() => {
                          setOne(i, x.id);
                          setSelectSlot(null);
                        }}
                      >
                        {x.icon} {x.name}
                      </button>
                    ))}
                    {!listFor(i).length && (
                      <p className="muted">
                        Нет безопасных вариантов при текущих ограничениях. Можно
                        открыть всю библиотеку для обсуждения замен со
                        специалистом.
                      </p>
                    )}
                  </div>
                )}
              </section>
            );
          })}
        </div>
      )}
      <div className="actions">
        <Link to="recipes" className="secondary">
          Ручной просмотр всех рецептов
        </Link>
        <Link to="weather" className="secondary">
          Временный город поездки
        </Link>
      </div>
    </>
  );
}
export function SafeFood() {
  const [month, setMonth] = useState(6);
  return (
    <>
      <Heading
        title="Безопасная подача еды"
        sub="6–12+ месяцев · навыки важнее точной даты"
        back="nutrition"
      />
      <div className="days">
        {[6, 7, 8, 9, 10, 11, 12].map((m) => (
          <button
            key={m}
            className={"day " + (m === month ? "selected" : "")}
            aria-pressed={m === month}
            onClick={() => setMonth(m)}
          >
            {m === 12 ? "12+" : m}
            <small>МЕС.</small>
          </button>
        ))}
      </div>
      <Note>
        Возраст — ориентир знакомства с текстурой, а не разрешение давать любой
        кусок. Нужны готовность к прикорму, устойчивое положение сидя с
        поддержкой, контроль головы и взрослый на расстоянии руки.
      </Note>
      <section className="outfit-card">
        <h2>
          {month} мес. ·{" "}
          {month < 9
            ? "Мягко, крупно для захвата или с ложки"
            : "Постепенное разнообразие по навыкам"}
        </h2>
        <div
          className="food-shapes"
          role="img"
          aria-label="Мягкая полоска, размятая пища, небольшие мягкие кусочки"
        >
          <div>
            <span className="food-strip" />
            <strong>Мягкая полоска</strong>
            <small>Примерно с палец взрослого, выступает из кулачка</small>
          </div>
          <div>
            <span className="food-mash">🥣</span>
            <strong>Размятая пища</strong>
            <small>На ложке; без твёрдых и круглых включений</small>
          </div>
          {month >= 9 && (
            <div>
              <span className="food-pieces">
                <i />
                <i />
                <i />
              </span>
              <strong>Мягкие кусочки</strong>
              <small>
                При развитом захвате; около 1 см или меньше по продукту и
                навыкам
              </small>
            </div>
          )}
        </div>
        <p>
          Все варианты должны легко раздавливаться между пальцами. Порция на
          картинке условная: предлагайте небольшое количество и добавляйте по
          интересу. Не заполняйте рот ребёнка несколькими кусочками.
        </p>
        <h3>Примеры</h3>
        <ul>
          <li>
            Морковь: тщательно приготовленная до мягкости, полоской или
            размятой. Сырая твёрдая — опасна.
          </li>
          <li>
            Яблоко: тушёное/печёное мягкое или натёртое по навыкам. Жёсткие
            ломтики не подходят младенцу.
          </li>
          <li>Банан: спелый, размятый или мягкая удобная полоска.</li>
          <li>
            Виноград и черри: никогда целыми; для раннего этапа лучше размять,
            старшим — разрезать вдоль на четверти и при необходимости мельче.
          </li>
          <li>
            Орехи: не целыми; только подходящая по возрасту разведённая
            паста/порошок при введении аллергена. Не густой комок пасты.
          </li>
        </ul>
      </section>
      <section className="reading">
        <h2>Gagging и удушье — разные ситуации</h2>
        <div className="comparison">
          <div>
            <span>🔊</span>
            <h3>Рвотный рефлекс</h3>
            <p>
              Может быть шумным: ребёнок кашляет, делает рвотные движения,
              краснеет, но воздух проходит. Не лезьте в рот пальцами; наблюдайте
              рядом и дайте справиться, если дыхание эффективно.
            </p>
          </div>
          <div>
            <span>🆘</span>
            <h3>Опасное удушье</h3>
            <p>
              Не может эффективно кашлять, плакать или дышать, может быть тихим
              и синеть. Немедленно зовите помощь и действуйте по возрастному
              алгоритму. Если не уверены в дыхании — вызывайте экстренную
              помощь.
            </p>
          </div>
        </div>
        <Note danger>
          Не делайте слепые попытки достать пищу пальцами. При неэффективном
          кашле не ждите изменения цвета. Пройдите очный курс первой помощи.
        </Note>
        <Link to="article/first-aid" className="danger-button">
          Алгоритм первой помощи →
        </Link>
        <p className="source">
          <a
            href="https://www.cdc.gov/infant-toddler-nutrition/foods-and-drinks/choking-hazards.html"
            target="_blank"
            rel="noopener noreferrer"
          >
            CDC · продукты с риском удушья ↗
          </a>
        </p>
      </section>
    </>
  );
}
