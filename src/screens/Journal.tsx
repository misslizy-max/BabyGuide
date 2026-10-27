import { useState, type FormEvent } from "react";
import { useApp } from "../hooks/useApp";
import {
  Heading,
  Link,
  Note,
  DeleteButton,
  LineChart,
  values,
  SourceLinks,
} from "../components/UI";
import { newEvent } from "../services/persistence";
import {
  today,
  localNow,
  formatDate,
  months,
  duration,
  hours,
  sleepInPeriod,
} from "../utils/dates";
import {
  ageDays,
  references,
  zScore,
  approximatePercentile,
  type Metric,
} from "../services/growth";
import { dose } from "../services/medicines";
import type { JournalEvent, EventKind } from "../types";
const kinds: EventKind[] = [
  "Момент",
  "Навык",
  "Первое слово",
  "Еда",
  "Смесь",
  "Сон",
  "Температура",
  "Лекарство",
  "Рост",
];
function eventSummary(e: JournalEvent) {
  if (e.kind === "Сон")
    return `${e.time.slice(11)} → ${e.end?.slice(11)} · ${hours(duration(e.time, e.end!))}`;
  if (e.kind === "Рост")
    return [
      e.weight ? e.weight + " кг" : "",
      e.height ? e.height + " см" : "",
      e.head ? "Голова " + e.head + " см" : "",
    ]
      .filter(Boolean)
      .join(" · ");
  return `${e.temperature !== undefined ? e.temperature + " °C · " + (e.method || "") + " " : ""}${e.medicine ? "Принято: " + e.medicine + " " : ""}${e.kind === "Смесь" && e.amount ? e.amount + " мл " : ""}`;
}
export function EventEntry({
  event,
  label = "Удалить запись",
}: {
  event: JournalEvent;
  label?: string;
}) {
  return (
    <article className="entry">
      <div className="section-title">
        <span className="tag">
          {event.kind} · {formatDate(event.time)} · {event.time.slice(11)}
        </span>
        <DeleteButton id={event.id} label={label} />
      </div>
      <h3>{eventSummary(event)}</h3>
      <p className="entry-text">{event.text}</p>
      {event.audioId && (
        <Link to="words" className="text-link">
          Прослушать в аудиодневнике →
        </Link>
      )}
    </article>
  );
}
export function Diary() {
  const { data, add, notify } = useApp();
  const [filter, setFilter] = useState(""),
    [kind, setKind] = useState<EventKind>("Момент");
  function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = values(e);
    if (
      add(
        newEvent(kind, f.text, {
          time: f.date + "T" + (f.clock || "12:00"),
          ...(kind === "Смесь" ? { amount: Number(f.amount) } : {}),
        }),
      )
    ) {
      notify("Запись сохранена");
      e.currentTarget.reset();
    }
  }
  const list = data.events
    .filter((e) => !filter || e.kind === filter)
    .sort((a, b) => b.time.localeCompare(a.time));
  return (
    <>
      <Heading
        title="Дневник маленьких открытий"
        sub="Единая лента сна, питания, здоровья и первых умений"
      />
      <div className="quick-grid">
        <Link to="sleep-log" className="secondary">
          ☾ Сон
        </Link>
        <Link to="temperature" className="secondary">
          🌡 Температура
        </Link>
        <Link to="growth" className="secondary">
          ↗ Измерения
        </Link>
      </div>
      <form id="diary-form" className="form-card" onSubmit={submit}>
        <h2>Как прошёл день?</h2>
        <div className="form-row">
          <label>
            Дата
            <input
              type="date"
              name="date"
              defaultValue={today()}
              max={today()}
              required
            />
          </label>
          <label>
            Время
            <input
              type="time"
              name="clock"
              defaultValue={localNow().slice(11)}
              required
            />
          </label>
          <label>
            Тип записи
            <select
              name="kind"
              value={kind}
              onChange={(e) => setKind(e.target.value as EventKind)}
            >
              {["Момент", "Навык", "Еда", "Смесь", "Лекарство"].map((k) => (
                <option key={k}>{k}</option>
              ))}
            </select>
          </label>
        </div>
        {kind === "Смесь" && (
          <label>
            Объём, мл
            <input
              name="amount"
              type="number"
              min="1"
              max="1500"
              step="1"
              required
              inputMode="numeric"
            />
          </label>
        )}
        <label>
          Заметка
          <textarea
            name="text"
            rows={3}
            maxLength={2000}
            required
            placeholder={
              kind === "Лекарство"
                ? "Название, действующее вещество, фактически данное количество и концентрация"
                : "Что хочется запомнить?"
            }
          />
        </label>
        <button className="button">Сохранить запись</button>
      </form>
      <div className="section-title">
        <h2>Ваша история</h2>
        <Link to="words" className="text-link">
          Первые слова →
        </Link>
      </div>
      <label>
        Фильтр событий
        <select value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="">Все события</option>
          {kinds.map((k) => (
            <option key={k}>{k}</option>
          ))}
        </select>
      </label>
      {list.map((e) => (
        <EventEntry key={e.id} event={e} />
      ))}
      {!list.length && (
        <Note>
          Здесь пока нет записей выбранного типа. Сон, температура, слова и
          измерения попадут в эту же ленту.
        </Note>
      )}
    </>
  );
}
export function Sleep() {
  const { data, add, notify } = useApp();
  const [error, setError] = useState(""),
    [date, setDate] = useState(today());
  const rows = data.events
    .filter((e) => e.kind === "Сон" && e.end)
    .sort((a, b) => b.time.localeCompare(a.time));
  const start = new Date(date + "T00:00"),
    end = new Date(start);
  end.setDate(end.getDate() + 1);
  const daily = rows.filter(
    (e) => Date.parse(e.time) < +end && Date.parse(e.end!) > +start,
  );
  const total = sleepInPeriod(rows, start, end),
    age = months(data.profile.birth);
  function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = values(e),
      mins = duration(f.start, f.end);
    if (mins <= 0 || mins > 1440 || Date.parse(f.end) > Date.now()) {
      setError(
        "Проверьте даты: конец позже начала, не в будущем; длительность до 24 часов.",
      );
      return;
    }
    if (
      rows.some(
        (r) =>
          Date.parse(f.start) < Date.parse(r.end!) &&
          Date.parse(f.end) > Date.parse(r.time),
      )
    ) {
      setError(
        "Этот сон пересекается с уже записанным. Проверьте историю и время.",
      );
      return;
    }
    if (
      add(
        newEvent("Сон", f.note, {
          time: f.start,
          end: f.end,
          quality: f.quality,
        }),
      )
    ) {
      setError("");
      notify("Сон сохранён");
      e.currentTarget.reset();
    }
  }
  return (
    <>
      <Heading
        title="Дневник сна"
        sub="Дневные и ночные сны, временная шкала и история"
        back="diary"
      />
      <Note>
        {age === null
          ? "Добавьте дату рождения для возрастного ориентира."
          : age < 4
            ? "До 4 месяцев сон особенно изменчив: строгие окна бодрствования не нужны."
            : age < 12
              ? "В 4–12 месяцев ориентир суммарного сна — 12–16 часов в сутки."
              : age < 36
                ? "В 1–2 года ориентир — 11–14 часов в сутки."
                : "В 3 года ориентир — 10–13 часов в сутки."}{" "}
        Это диапазон AASM, не персональное назначение.
      </Note>
      <section className="chart-card">
        <div className="section-title">
          <h2>{hours(total)} за выбранные сутки</h2>
          <label>
            Дата
            <input
              type="date"
              value={date}
              max={today()}
              onChange={(e) => e.target.value && setDate(e.target.value)}
            />
          </label>
        </div>
        <div
          className="sleep-timeline"
          role="img"
          aria-label={"Сон " + date + ": " + hours(total)}
        >
          {daily.map((e) => {
            const left = Math.max(
                0,
                ((Date.parse(e.time) - +start) / (+end - +start)) * 100,
              ),
              right = Math.min(
                100,
                ((Date.parse(e.end!) - +start) / (+end - +start)) * 100,
              );
            return (
              <span
                key={e.id}
                className="sleep-segment"
                style={{ left: left + "%", width: right - left + "%" }}
                title={`${e.time} — ${e.end}`}
              />
            );
          })}
        </div>
        <div className="timeline-labels">
          <span>00:00</span>
          <span>06:00</span>
          <span>12:00</span>
          <span>18:00</span>
          <span>24:00</span>
        </div>
        <p className="small muted">
          Показан фактический сон, попавший в эти сутки: часть ночного сна через
          полночь разделена по датам. Совпадающие интервалы не удваивают сумму.
        </p>
      </section>
      <form id="sleep-form" className="form-card" onSubmit={submit}>
        <h2>Добавить сон</h2>
        <div className="form-row">
          <label>
            Начало
            <input
              name="start"
              type="datetime-local"
              max={localNow()}
              required
            />
          </label>
          <label>
            Пробуждение
            <input name="end" type="datetime-local" max={localNow()} required />
          </label>
        </div>
        <label>
          Как спалось
          <select name="quality">
            <option>Спокойно</option>
            <option>С пробуждениями</option>
            <option>Беспокойно</option>
          </select>
        </label>
        <label>
          Заметка
          <input name="note" maxLength={300} />
        </label>
        <button className="button">Сохранить сон</button>
        <p className="form-error" role="alert">
          {error}
        </p>
      </form>
      {rows.map((e) => (
        <EventEntry key={e.id} event={e} label="Удалить сон" />
      ))}
      {!rows.length && (
        <Note>
          Добавьте первый сон: начало и пробуждение могут приходиться на разные
          даты.
        </Note>
      )}
      <Link to="sleep" className="button">
        Все гайды по сну →
      </Link>
    </>
  );
}
export function Growth() {
  const { data, add, notify } = useApp();
  const [metric, setMetric] = useState<Metric>("weight"),
    [error, setError] = useState("");
  const p = data.profile,
    rows = data.events
      .filter((e) => e.kind === "Рост" && e[metric] !== undefined)
      .sort((a, b) => a.time.localeCompare(b.time));
  const all = data.events
      .filter((e) => e.kind === "Рост")
      .sort((a, b) => b.time.localeCompare(a.time)),
    units = metric === "weight" ? "кг" : "см";
  const withBirth =
    !!p.birth &&
    rows.every(
      (e) => ageDays(p.birth, e.time) >= 0 && ageDays(p.birth, e.time) <= 1096,
    );
  const points = rows.map((e) => ({
    x: withBirth ? ageDays(p.birth, e.time) : Date.parse(e.time),
    y: e[metric]!,
    label: formatDate(e.time),
  }));
  const ref =
    withBirth && rows.length
      ? references(
          metric,
          p.sex,
          Math.max(
            31,
            Math.min(1096, ageDays(p.birth, rows.at(-1)!.time) + 31),
          ),
        )
      : undefined;
  const last = rows.at(-1),
    z =
      last && withBirth
        ? zScore(metric, p.sex, ageDays(p.birth, last.time), last[metric]!)
        : null;
  function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = values(e),
      fields: Partial<JournalEvent> = { time: f.date + "T12:00" };
    for (const k of ["weight", "height", "head"] as const)
      if (f[k]) fields[k] = Number(f[k]);
    if (!["weight", "height", "head"].some((k) => f[k])) {
      setError("Введите хотя бы одно измерение.");
      return;
    }
    if (p.birth && f.date < p.birth) {
      setError("Измерение не может быть раньше даты рождения.");
      return;
    }
    if (add(newEvent("Рост", "", fields))) {
      setError("");
      notify("Измерение сохранено");
      e.currentTarget.reset();
    }
  }
  return (
    <>
      <Heading
        title="Рост маленького человека"
        sub="Вес, длина тела / рост и окружность головы"
        back="diary"
      />
      <div className="stats">
        {(["weight", "height", "head"] as const).map((m, i) => {
          const v = all.find((e) => e[m] !== undefined)?.[m];
          return (
            <div key={m}>
              <strong>
                {v === undefined ? "—" : v + (m === "weight" ? " кг" : " см")}
              </strong>
              <span>{["Вес", "Рост / длина", "Окружность головы"][i]}</span>
            </div>
          );
        })}
      </div>
      <section className="chart-card">
        <div className="section-title">
          <h2>Динамика</h2>
          <div className="segmented">
            {(["weight", "height", "head"] as const).map((m, i) => (
              <button
                key={m}
                aria-pressed={metric === m}
                className={metric === m ? "selected" : ""}
                onClick={() => setMetric(m)}
              >
                {["Вес", "Рост", "Голова"][i]}
              </button>
            ))}
          </div>
        </div>
        <LineChart
          points={points}
          reference={ref}
          label={
            "Личный график " +
            (metric === "weight"
              ? "веса в килограммах"
              : metric === "height"
                ? "роста в сантиметрах"
                : "окружности головы")
          }
          unit={units}
        />
        {rows.length >= 2 && (
          <p>
            Изменение за период:{" "}
            {(rows.at(-1)![metric]! - rows[0][metric]!).toFixed(
              metric === "weight" ? 2 : 1,
            )}{" "}
            {units} · {formatDate(rows[0].time)} —{" "}
            {formatDate(rows.at(-1)!.time)}
          </p>
        )}
        {ref && (
          <p className="small muted">
            Пунктир — WHO P3 / P50 / P97 для выбранного пола. Точки — реальные
            измерения, не диагноз.
          </p>
        )}
        {z !== null && (
          <p className="tag">
            {Math.abs(z) <= 3
              ? `Справочно: около P${approximatePercentile(z).toFixed(1)}`
              : "Точка вне отображаемого диапазона: проверьте измерение и обсудите с педиатром."}
          </p>
        )}
        <Note>
          Процентиль показывает положение среди детей того же пола и возраста в
          стандарте WHO: P50 — середина, а не «идеальный вес». Важнее
          последовательная динамика и самочувствие. Не меняйте питание по одной
          точке. Измерение длины до 2 лет — лёжа, после — роста стоя. При
          недоношенности и хронических заболеваниях оценка индивидуальна.
        </Note>
      </section>
      <form id="growth-form" className="form-card" onSubmit={submit}>
        <h2>Новое измерение</h2>
        <label>
          Дата
          <input
            name="date"
            type="date"
            defaultValue={today()}
            max={today()}
            min={p.birth || undefined}
            required
          />
        </label>
        <div className="form-row">
          <label>
            Вес, кг
            <input
              name="weight"
              type="number"
              min="0.3"
              max="50"
              step="0.01"
              inputMode="decimal"
            />
          </label>
          <label>
            Рост / длина, см
            <input
              name="height"
              type="number"
              min="20"
              max="150"
              step="0.1"
              inputMode="decimal"
            />
          </label>
          <label>
            Голова, см
            <input
              name="head"
              type="number"
              min="20"
              max="65"
              step="0.1"
              inputMode="decimal"
            />
          </label>
        </div>
        <button className="button">Сохранить измерение</button>
        <p className="form-error" role="alert">
          {error}
        </p>
      </form>
      <h2>История измерений</h2>
      {all.map((e) => (
        <EventEntry key={e.id} event={e} label="Удалить измерение" />
      ))}
      <section className="reading">
        <h2>Когда обсудить рост</h2>
        <p>
          Потеря веса, длительная остановка прибавки, заметное изменение
          траектории, сложности кормления, необычно быстрые изменения окружности
          головы или симптомы болезни требуют оценки педиатром. Сначала
          проверьте технику и точность измерений. График не устанавливает
          причину.
        </p>
        <SourceLinks
          ids={[
            "https://www.who.int/tools/child-growth-standards",
            "https://github.com/WorldHealthOrganization/anthro",
          ]}
        />
      </section>
    </>
  );
}
export function Temperature() {
  const { data, add, notify } = useApp();
  const [date, setDate] = useState(today());
  const rows = data.events
    .filter((e) => e.temperature !== undefined)
    .sort((a, b) => a.time.localeCompare(b.time));
  const daily = rows.filter((e) => e.time.slice(0, 10) === date);
  const age = months(data.profile.birth);
  function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = values(e),
      temperature = Number(f.temperature);
    if (
      add(
        newEvent(f.medicine ? "Лекарство" : "Температура", f.observation, {
          time: f.time,
          temperature,
          method: f.method,
          medicine: f.medicine,
        }),
      )
    ) {
      notify("Наблюдение сохранено");
      e.currentTarget.reset();
      if (
        temperature < 35 ||
        temperature >= 40 ||
        (age !== null && age < 3 && temperature >= 38)
      )
        notify(
          "Нужна срочная медицинская оценка. При тяжёлом состоянии звоните 112.",
        );
    }
  }
  return (
    <>
      <Heading
        title="Температура и приём лекарств"
        sub="Время, самочувствие, история и график за сутки"
        back="health"
      />
      <Note danger>
        <strong>
          Младше 3 месяцев и 38 °C или выше — немедленная медицинская оценка.
        </strong>{" "}
        В 3–6 месяцев от 39 °C — срочная консультация. Тяжёлое дыхание,
        отсутствие реакции, судороги или не бледнеющая сыпь — 112. Запись не
        должна задерживать обращение.
      </Note>
      <section className="chart-card">
        <h2>График за сутки</h2>
        <label>
          Дата графика
          <input
            type="date"
            value={date}
            max={today()}
            onChange={(e) => e.target.value && setDate(e.target.value)}
          />
        </label>
        <LineChart
          points={daily.map((e) => ({
            x: Date.parse(e.time),
            y: e.temperature!,
            label: e.time.slice(11),
          }))}
          label="Температура за сутки"
          unit="°C"
        />
        <p className="small muted">
          Сравнивайте измерения одним способом. Приложение не делает поправку
          «плюс градус».
        </p>
      </section>
      <form id="temperature-form" className="form-card" onSubmit={submit}>
        <h2>Записать наблюдение</h2>
        <label>
          Когда измерили
          <input
            name="time"
            type="datetime-local"
            defaultValue={localNow()}
            max={localNow()}
            required
          />
        </label>
        <div className="form-row">
          <label>
            Температура, °C
            <input
              name="temperature"
              type="number"
              min="30"
              max="43"
              step="0.1"
              inputMode="decimal"
              required
            />
          </label>
          <label>
            Способ измерения
            <select name="method">
              <option>Под мышкой</option>
              <option>В ухе</option>
              <option>На лбу</option>
              <option>Ректально</option>
            </select>
          </label>
        </div>
        <label>
          Самочувствие и заметка
          <textarea
            name="observation"
            maxLength={1000}
            placeholder="Пьёт ли, как дышит, бодрость, мочеиспускание"
          />
        </label>
        <label>
          Если уже дали лекарство
          <input
            name="medicine"
            maxLength={300}
            placeholder="Название, количество, концентрация и время приёма"
          />
        </label>
        <button className="button">Сохранить наблюдение</button>
      </form>
      {[...rows].reverse().map((e) => (
        <EventEntry key={e.id} event={e} label="Удалить наблюдение" />
      ))}
      <div className="actions">
        <Link to="article/fever" className="secondary">
          План действий при температуре
        </Link>
        <Link to="medicines" className="secondary">
          Проверить расчёт по весу
        </Link>
      </div>
    </>
  );
}
export function Medicines() {
  const { data } = useApp();
  const [drug, setDrug] = useState<"paracetamol" | "ibuprofen">("paracetamol"),
    [result, setResult] = useState<ReturnType<typeof dose> | null>(null),
    [error, setError] = useState("");
  const age = months(data.profile.birth);
  function calculate(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = values(e);
    try {
      setResult(
        dose(drug, Number(f.weight), Number(f.strength), Number(f.volume), age),
      );
      setError("");
    } catch (e) {
      setResult(null);
      setError(e instanceof Error ? e.message : "Проверьте исходные данные");
    }
  }
  return (
    <>
      <Heading
        title="Лекарства: проверить расчёт"
        sub="Только жидкие формы · от 6 до 36 месяцев"
        back="health"
      />
      <Note danger>
        Это проверка арифметики справочной схемы, не назначение и не выбор
        лекарства. При лихорадке младше 3 месяцев — срочный осмотр. До 6
        месяцев, при обезвоживании, болезни печени/почек, ветрянке, реакции на
        НПВС или других противопоказаниях — индивидуальный план врача. При
        превышении дозы обращайтесь немедленно, даже без симптомов.
      </Note>
      <form className="form-card" onSubmit={calculate}>
        <label>
          Действующее вещество
          <select
            value={drug}
            onChange={(e) => {
              setDrug(e.target.value as typeof drug);
              setResult(null);
            }}
          >
            <option value="paracetamol">Парацетамол</option>
            <option value="ibuprofen">Ибупрофен</option>
          </select>
        </label>
        <p>
          Возраст по профилю: {age === null ? "не указан" : age + " мес."}.{" "}
          <Link to="profile" className="text-link">
            Проверить профиль
          </Link>
        </p>
        <label>
          Актуальный вес, кг
          <input
            type="number"
            name="weight"
            min="2"
            max="30"
            step="0.01"
            inputMode="decimal"
            required
          />
        </label>
        <h3>Перепишите концентрацию с упаковки</h3>
        <div className="form-row">
          <label>
            Количество действующего вещества, мг
            <input
              name="strength"
              type="number"
              min="1"
              max="1000"
              step="0.1"
              required
              inputMode="decimal"
            />
          </label>
          <label>
            В каком объёме, мл
            <input
              name="volume"
              type="number"
              min="0.1"
              max="20"
              step="0.1"
              required
              inputMode="decimal"
            />
          </label>
        </div>
        <p className="small muted">
          Например, если на упаковке указано «120 мг / 5 мл», вводятся 120 и 5.
          Не копируйте пример вместо своей упаковки.
        </p>
        <label className="check-row">
          <input type="checkbox" required />
          <span>
            Проверены инструкция, возрастной допуск, отсутствие противопоказаний
            и того же вещества в других препаратах.
          </span>
        </label>
        <button className="button">Рассчитать объём</button>
        <p className="form-error" role="alert">
          {error}
        </p>
      </form>
      {result && (
        <section className="result-card" aria-live="polite">
          <p className="eyebrow">ПРОВЕРЬТЕ УПАКОВКУ И НАЗНАЧЕНИЕ</p>
          <h2>{result.ml.toFixed(2)} мл за приём</h2>
          <p>
            Формула: {result.weight} кг × {result.mgPerKg} мг/кг ={" "}
            {result.mg.toFixed(1)} мг.
          </p>
          <p>
            Концентрация: {result.strength} мг ÷ {result.volume} мл ={" "}
            {result.concentration.toFixed(2)} мг/мл.
          </p>
          <p>
            Объём: {result.mg.toFixed(1)} мг ÷ {result.concentration.toFixed(2)}{" "}
            мг/мл = {result.ml.toFixed(2)} мл.
          </p>
          <Note>
            Не чаще чем через {result.interval} часов, максимум{" "}
            {result.maxDoses} приёма за 24 часа ({result.dailyMax} мг/кг/сут).
            Если упаковка или врач задают меньший предел — действует он. Не
            чередуйте препараты без понятной схемы врача. Используйте мерный
            шприц; не округляйте на кухонную ложку. При расхождении с упаковкой
            не давайте по расчёту: уточните у фармацевта/врача.
          </Note>
          <Link to={"article/" + drug} className="secondary">
            Ограничения и ошибки приёма
          </Link>
        </section>
      )}
      <SourceLinks
        ids={[
          "https://www.rch.org.au/kidsinfo/fact_sheets/Pain_relief_for_children/",
          "https://www.nhs.uk/medicines/paracetamol-for-children/",
          "https://www.nhs.uk/medicines/ibuprofen-for-children/",
        ]}
      />
    </>
  );
}
