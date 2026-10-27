import { useState, type FormEvent } from "react";
import { useApp } from "../hooks/useApp";
import { Heading, Link, Note, Confirm, values } from "../components/UI";
import {
  exactAge,
  months,
  today,
  formatDate,
  hours,
  sleepInPeriod,
} from "../utils/dates";
import { development } from "../data/development";
import { games } from "../data/games";
import { guides } from "../data/guides";
import { foods, regions } from "../data/nutrition";
import { hero } from "../visuals.js";
import { initial, validate } from "../services/persistence";
import { exportBackup, importBackup, clearAudio } from "../services/audio";
import { useWeather } from "../hooks/useWeather";
import { wardrobe } from "../services/wardrobe";
import { regionFor } from "../services/menu";
import type { Profile, AppData } from "../types";
const csv = (s: string) =>
  s
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean);
export function Home() {
  const { data, update } = useApp();
  const p = data.profile,
    age = months(p.birth),
    stage = development[Math.min(age || 0, 36)],
    measurements = data.events
      .filter((e) => e.kind === "Рост")
      .sort((a, b) => b.time.localeCompare(a.time)),
    lastWeight = measurements.find((e) => e.weight !== undefined),
    lastHeight = measurements.find((e) => e.height !== undefined),
    lastHead = measurements.find((e) => e.head !== undefined);
  const sleeps = data.events.filter((e) => e.kind === "Сон"),
    now = new Date(),
    from = new Date(+now - 86400000);
  const total = sleepInPeriod(sleeps, from, now);
  const game = games.filter(
    (g) => Math.min(age ?? 0, 36) >= g.min && Math.min(age ?? 0, 36) <= g.max,
  )[
    new Date().getDate() %
      Math.max(
        1,
        games.filter(
          (g) =>
            Math.min(age ?? 0, 36) >= g.min && Math.min(age ?? 0, 36) <= g.max,
        ).length,
      )
  ];
  const feeding = data.events.filter(
    (e) => ["Еда", "Смесь"].includes(e.kind) && e.time.slice(0, 10) === today(),
  );
  const currentGuide =
    guides.find(
      (g) =>
        (data.practice[g.id] || []).length > 0 &&
        (data.practice[g.id] || []).length < g.practice.length,
    ) ||
    guides.find(
      (g) =>
        g.id === (age !== null && age >= 18 ? "potty-plan" : "bedtime-ritual"),
    )!;
  const { snapshot: weather } = useWeather(data.travelCity || data.city);
  return (
    <>
      <div className="greeting">
        <p className="eyebrow">МАМА · ВАШ ДЕНЬ С BABYGUIDE</p>
        <h1>
          {p.name ? `${p.name}, растём вместе` : "Растём вместе"}
          <span className="coral">.</span>
        </h1>
        <p className="muted">
          {exactAge(p.birth)} · маленькие шаги каждый день
        </p>
      </div>
      <section className="hero">
        <div className="hero-copy">
          <span className="pill">ЧТО ВАЖНО СЕГОДНЯ</span>
          <h2>
            {age === null
              ? "Рядом на каждом этапе"
              : "Время маленьких открытий"}
          </h2>
          <p>
            {age === null
              ? "Добавьте профиль — покажем подходящие игры и ориентиры."
              : stage.activity}
          </p>
          <Link
            to={age === null ? "profile" : "development"}
            className="button"
          >
            {age === null ? "Познакомимся с малышом →" : "Мой этап развития →"}
          </Link>
        </div>
        <div className="hero-art" dangerouslySetInnerHTML={{ __html: hero }} />
      </section>
      <section className="dashboard-metrics" aria-label="Сводка малыша">
        <Link to="growth">
          <span>Вес</span>
          <strong>
            {lastWeight?.weight ? lastWeight.weight + " кг" : "—"}
          </strong>
          <small>{lastWeight ? formatDate(lastWeight.time) : "Добавить"}</small>
        </Link>
        <Link to="growth">
          <span>Рост</span>
          <strong>
            {lastHeight?.height ? lastHeight.height + " см" : "—"}
          </strong>
          <small>
            {lastHead?.head
              ? "Голова " + lastHead.head + " см"
              : "История измерений"}
          </small>
        </Link>
        <Link to="sleep-log">
          <span>Сон за 24 часа</span>
          <strong>{sleeps.length ? hours(total) : "—"}</strong>
          <small>{sleeps.length ? "По дневнику" : "Записать сон"}</small>
        </Link>
        <Link to="diary">
          <span>Питание сегодня</span>
          <strong>{feeding.length || "—"}</strong>
          <small>
            {feeding.length ? "записей в дневнике" : "Добавить кормление"}
          </small>
        </Link>
      </section>
      <section className="section">
        <div className="section-title">
          <h2>Сегодня для вас</h2>
          <Link to="recommendations" className="text-link">
            Все рекомендации →
          </Link>
        </div>
        <div className="today-grid">
          <Link to={"game/" + game.id} className="age-card">
            <span className="circle-icon green">{game.icon}</span>
            <div>
              <p className="eyebrow">АКТИВНОСТЬ ДНЯ · {game.minutes} МИН</p>
              <h3>{game.title}</h3>
              <p>{game.goal}</p>
            </div>
            <span className="arrow">→</span>
          </Link>
          <Link to="development" className="daily-note">
            <p className="eyebrow">
              АКТУАЛЬНЫЙ ЭТАП ·{" "}
              {age === null ? "ВЫБЕРИТЕ ВОЗРАСТ" : age + " МЕС."}
            </p>
            <h3>{stage.title}</h3>
            <p>{stage.skills}</p>
          </Link>
        </div>
      </section>
      <section className="today-grid section">
        <Link to="weather" className="weather-summary">
          <span>☀</span>
          <div>
            <p className="eyebrow">КАК ОДЕТЬ СЕГОДНЯ</p>
            <h3>
              {weather.current
                ? `${Math.round(weather.current.temperature_2m)}° · ${weather.city?.name}`
                : data.city
                  ? "Обновить погоду"
                  : "Выбрать город"}
            </h3>
            <p>
              {weather.current
                ? wardrobe(
                    weather.current.apparent_temperature,
                    "stroller",
                    weather.current.wind_speed_10m,
                    weather.current.precipitation,
                  )
                    .layers.slice(0, 3)
                    .map((x) => x.item)
                    .join(" · ")
                : "Прогноз и полный комплект для коляски или активной прогулки"}
            </p>
          </div>
        </Link>
        <Link to={"guide/" + currentGuide.id} className="daily-note">
          <p className="eyebrow">ВАШ ТЕКУЩИЙ ГАЙД</p>
          <h3>{currentGuide.title}</h3>
          <p>
            Выполнено {(data.practice[currentGuide.id] || []).length} из{" "}
            {currentGuide.practice.length} шагов
          </p>
          <progress
            value={(data.practice[currentGuide.id] || []).length}
            max={currentGuide.practice.length}
          />
        </Link>
      </section>
      <section className="section">
        <div className="section-title">
          <h2>Напоминания</h2>
          <Link to="reminders" className="text-link">
            Добавить →
          </Link>
        </div>
        {data.reminders
          .filter((r) => !r.done)
          .slice(0, 3)
          .map((r) => (
            <label className="check-row" key={r.id}>
              <input
                type="checkbox"
                checked={r.done}
                onChange={() =>
                  update((d) => ({
                    ...d,
                    reminders: d.reminders.map((x) =>
                      x.id === r.id ? { ...x, done: true } : x,
                    ),
                  }))
                }
              />
              <span>
                {r.text}
                <small>
                  {formatDate(r.date)} · отметка, без фонового уведомления
                </small>
              </span>
            </label>
          ))}
        {!data.reminders.some((r) => !r.done) && (
          <p className="muted">
            Нет незавершённых напоминаний. Можно добавить прогулку, замер роста
            или вопрос врачу.
          </p>
        )}
      </section>
      <section className="section">
        <h2>Быстрые действия</h2>
        <div className="quick-grid section">
          <Link to="diary" className="quick-card">
            <span>✎</span>
            <h3>Сохранить момент</h3>
            <p>Навык, еда, маленькая победа</p>
          </Link>
          <Link to="words" className="quick-card">
            <span>💬</span>
            <h3>Первое слово</h3>
            <p>Голос и история взросления</p>
          </Link>
          <Link to="child" className="quick-card">
            <span>🧸</span>
            <h3>Поиграть вместе</h3>
            <p>Защищённый детский режим</p>
          </Link>
        </div>
      </section>
      <Note>
        Вам не нужно успевать всё. Выберите то, что помогает вашей семье
        сегодня. ♡
      </Note>
    </>
  );
}
export function ProfileScreen() {
  const { data, update, notify, replace, raw } = useApp();
  const p = data.profile;
  const [reset, setReset] = useState(false),
    [incoming, setIncoming] = useState<{
      data: AppData;
      audio: unknown[];
    } | null>(null);
  const [busy, setBusy] = useState(false);
  const list = (key: keyof Profile) =>
    Array.isArray(p[key]) ? (p[key] as string[]).join(", ") : "";
  function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = values(e);
    const profile: Profile = {
      ...p,
      name: f.name.trim(),
      birth: f.birth,
      sex: f.sex === "boy" ? "boy" : "girl",
      country: f.country,
      city: f.city,
      region:
        (f.country !== p.country || f.city !== p.city) && f.region === p.region
          ? regionFor(f.country, f.city, "")
          : f.region,
      feeding: f.feeding,
      toy: f.toy,
      notes: f.notes,
      season: f.season as Profile["season"],
      allergies: csv(f.allergies),
      excluded: csv(f.excluded),
      introduced: csv(f.introduced),
      favorites: csv(f.favorites),
      dislikes: csv(f.dislikes),
      skills: csv(f.skills),
      pantry: csv(f.pantry),
    };
    if (update((d) => ({ ...d, profile }))) notify("Профиль сохранён");
  }
  async function backup() {
    setBusy(true);
    try {
      const text = raw || (await exportBackup(data));
      const url = URL.createObjectURL(
          new Blob([text], { type: "application/json" }),
        ),
        a = document.createElement("a");
      a.href = url;
      a.download = "babyguide-" + today() + ".json";
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      notify("Резервная копия подготовлена");
    } catch {
      notify(
        "Не удалось прочитать аудио для копии. Проверьте доступ к хранилищу.",
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <Heading
        title="Ваш маленький мир"
        sub="Профиль, предпочтения и локальные данные"
      />
      <form
        id="profile-form"
        key={JSON.stringify(p)}
        className="form-card"
        onSubmit={submit}
      >
        <h2>Познакомимся с малышом</h2>
        <label>
          Как зовут малыша
          <input name="name" maxLength={40} defaultValue={p.name} />
        </label>
        <div className="form-row">
          <label>
            Дата рождения
            <input
              name="birth"
              type="date"
              max={today()}
              defaultValue={p.birth}
            />
          </label>
          <label>
            Пол
            <select name="sex" defaultValue={p.sex}>
              <option value="girl">Девочка</option>
              <option value="boy">Мальчик</option>
            </select>
          </label>
        </div>
        <label>
          Любимая игрушка для историй
          <input name="toy" maxLength={50} defaultValue={p.toy} />
        </label>
        <details open>
          <summary>Регион и питание</summary>
          <div className="form-row">
            <label>
              Страна
              <input name="country" defaultValue={p.country} maxLength={80} />
            </label>
            <label>
              Город
              <input name="city" defaultValue={p.city} maxLength={100} />
            </label>
          </div>
          <label>
            Регион продуктов
            <select name="region" defaultValue={p.region}>
              {regions.map(([v, n]) => (
                <option key={v} value={v}>
                  {n}
                </option>
              ))}
            </select>
          </label>
          <p className="muted small">
            Для Владивостока выберите Дальний Восток. Регион меняет приоритеты,
            а не запрещает остальные рецепты. В поездке можно временно выбрать
            другой город в погоде.
          </p>
          <label>
            Тип питания
            <select name="feeding" defaultValue={p.feeding}>
              {[
                "Грудное",
                "Смесь",
                "Смешанное",
                "Общий стол",
                "Вегетарианское",
                "Веганское",
              ].map((x) => (
                <option key={x}>{x}</option>
              ))}
            </select>
          </label>
          <label>
            Аллергии · через запятую
            <input
              name="allergies"
              defaultValue={list("allergies")}
              placeholder="молоко, яйцо, рыба, глютен, соя"
              maxLength={1000}
            />
          </label>
          <p className="small muted">
            Аллергия на молоко исключает блюда с молочными ингредиентами, а не
            только стакан молока. При редких или сложных ограничениях проверьте
            весь состав с врачом.
          </p>
          {(
            [
              "excluded",
              "introduced",
              "favorites",
              "dislikes",
              "pantry",
            ] as const
          ).map((key, i) => (
            <label key={key}>
              {
                [
                  "Исключённые продукты",
                  "Введённые продукты",
                  "Любимые продукты",
                  "Не любит",
                  "Что есть дома",
                ][i]
              }{" "}
              · через запятую
              <input
                name={key}
                defaultValue={list(key)}
                list="food-list"
                maxLength={2500}
              />
            </label>
          ))}
          <datalist id="food-list">
            {Object.values(foods).map((f) => (
              <option key={f.name} value={f.name} />
            ))}
          </datalist>
          <label>
            Сезон меню
            <select name="season" defaultValue={p.season}>
              {[
                ["auto", "По текущему месяцу"],
                ["winter", "Зима"],
                ["spring", "Весна"],
                ["summer", "Лето"],
                ["autumn", "Осень"],
              ].map(([v, n]) => (
                <option value={v} key={v}>
                  {n}
                </option>
              ))}
            </select>
          </label>
        </details>
        <details>
          <summary>Навыки и заметки</summary>
          <label>
            Освоенные навыки · через запятую
            <input
              name="skills"
              defaultValue={list("skills")}
              maxLength={2000}
            />
          </label>
          <label>
            Что важно знать
            <textarea name="notes" defaultValue={p.notes} maxLength={4000} />
          </label>
        </details>
        <button className="button">Сохранить профиль</button>
      </form>
      <Link to="growth" className="feature-banner">
        <span>📏</span>
        <div>
          <h2>Вес, рост и окружность головы</h2>
          <p>Добавить измерение или посмотреть динамику</p>
        </div>
        <span>→</span>
      </Link>
      <section className="form-card">
        <h2>Ваши данные — на вашем устройстве</h2>
        <p>
          Регистрация не нужна. Дневники хранятся в браузере, аудио — в
          IndexedDB. Нет синхронизации между устройствами. Очистка данных сайта
          может удалить записи.
        </p>
        <div className="actions">
          <button className="secondary" disabled={busy} onClick={backup}>
            ↓ Экспорт JSON с аудио
          </button>
          <label className="secondary file-label">
            ↑ Импорт JSON
            <input
              id="import-data"
              type="file"
              className="sr-only"
              accept=".json,application/json"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                e.target.value = "";
                if (!file) return;
                if (file.size > 50 * 1024 * 1024) {
                  notify("Максимальный размер резервной копии — 50 МБ");
                  return;
                }
                try {
                  const v = JSON.parse(await file.text());
                  setIncoming({
                    data: validate(v.data || v),
                    audio: v.audio || [],
                  });
                } catch {
                  notify(
                    "Не удалось импортировать: файл повреждён или имеет неверный формат",
                  );
                }
              }}
            />
          </label>
        </div>
        <p className="small muted">
          Импорт заменяет профиль и дневники после подтверждения. Старые
          резервные копии поддерживаются. Сохраняйте свои файлы в безопасном
          месте.
        </p>
        <button
          className="text-button destructive"
          onClick={() => setReset(true)}
        >
          Удалить все мои данные
        </button>
      </section>
      <section className="form-card">
        <h2>BabyGuide на iPhone</h2>
        <ol>
          <li>Откройте приложение в Safari по HTTPS.</li>
          <li>«Поделиться» → «На экран Домой».</li>
          <li>Откройте с интернетом один раз для офлайн-библиотеки.</li>
        </ol>
        <p>
          Погода требует сети. Системный голос для озвучки может потребовать
          предварительной загрузки в настройках iOS. Микрофон и геолокация
          включаются только после вашего действия.
        </p>
        <button
          className="secondary"
          onClick={async () => {
            try {
              const r = await navigator.serviceWorker?.getRegistration();
              if (!r) {
                notify("Офлайн-модуль доступен в production-сборке.");
                return;
              }
              await r.update();
              notify(
                r.waiting
                  ? "Обновление готово. Закройте вкладки BabyGuide и откройте снова."
                  : "Проверка обновлений завершена.",
              );
            } catch {
              notify("Проверка недоступна без сети.");
            }
          }}
        >
          Проверить обновление приложения
        </button>
        <Link to="sources" className="text-link">
          Источники и методика →
        </Link>
      </section>
      <Confirm
        open={reset}
        title="Удалить профиль, дневники и аудио?"
        onClose={() => setReset(false)}
        onConfirm={() => {
          void (async () => {
            try {
              if (replace(initial())) {
                await clearAudio();
                localStorage.removeItem("babyguide.v1");
                notify("Данные удалены");
              }
            } catch {
              notify("Не удалось удалить аудио. Попробуйте снова.");
            }
          })();
        }}
      />
      <Confirm
        open={!!incoming}
        title="Заменить данные резервной копией?"
        action="Заменить"
        onClose={() => setIncoming(null)}
        onConfirm={() => {
          if (!incoming) return;
          void (async () => {
            try {
              await importBackup(incoming.audio);
              if (replace(incoming.data)) notify("Данные восстановлены");
            } catch {
              notify(
                "Не удалось импортировать аудио. Текущие дневники сохранены.",
              );
            }
          })();
        }}
      />
    </>
  );
}
export function Reminders() {
  const { data, update, notify } = useApp();
  return (
    <>
      <Heading
        title="Напоминания"
        sub="Локальный список дел: без фоновых push-уведомлений"
      />
      <form
        className="form-card"
        onSubmit={(e) => {
          e.preventDefault();
          const f = values(e);
          if (
            update((d) => ({
              ...d,
              reminders: [
                ...d.reminders,
                {
                  id: crypto.randomUUID(),
                  text: f.text,
                  date: f.date,
                  done: false,
                },
              ],
            }))
          ) {
            notify("Напоминание добавлено");
            e.currentTarget.reset();
          }
        }}
      >
        <label>
          Что запомнить
          <input name="text" maxLength={200} required />
        </label>
        <label>
          Дата
          <input name="date" type="date" required defaultValue={today()} />
        </label>
        <button className="button">Добавить напоминание</button>
      </form>
      {data.reminders.map((r) => (
        <div className="check-row" key={r.id}>
          <input
            aria-label={"Выполнено: " + r.text}
            type="checkbox"
            checked={r.done}
            onChange={() =>
              update((d) => ({
                ...d,
                reminders: d.reminders.map((x) =>
                  x.id === r.id ? { ...x, done: !x.done } : x,
                ),
              }))
            }
          />
          <span>
            {r.text}
            <small>{formatDate(r.date)}</small>
          </span>
          <button
            className="icon-button"
            aria-label="Удалить напоминание"
            onClick={() =>
              update((d) => ({
                ...d,
                reminders: d.reminders.filter((x) => x.id !== r.id),
              }))
            }
          >
            ×
          </button>
        </div>
      ))}
      {!data.reminders.length && (
        <Note>Добавьте первый вопрос врачу или семейное дело.</Note>
      )}
    </>
  );
}
