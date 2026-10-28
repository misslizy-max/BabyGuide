import { Link, Note } from "../components/UI";
import { useApp } from "../hooks/useApp";
import { useWeather } from "../hooks/useWeather";
import { development } from "../data/development";
import { games } from "../data/games";
import { guides } from "../data/guides";
import { exactAge, hours, months, sleepInPeriod } from "../utils/dates";
import { wardrobe } from "../services/wardrobe";

export function Today() {
  const { data } = useApp();
  const profile = data.profile;
  const age = months(profile.birth);
  const safeAge = Math.min(Math.max(age ?? 0, 0), 36);
  const stage = development[safeAge];
  const name = profile.name || "Малыш";
  const eligibleGames = games.filter(
    (game) => safeAge >= game.min && safeAge <= game.max,
  );
  const game =
    eligibleGames[new Date().getDate() % Math.max(eligibleGames.length, 1)] ||
    games[0];
  const eligibleGuides = guides
    .filter((guide) => guide.min <= safeAge)
    .sort((a, b) => b.min - a.min);
  const currentGuide = eligibleGuides[0] || guides[0];
  const sleeps = data.events.filter((event) => event.kind === "Сон");
  const now = new Date();
  const sleepMinutes = sleepInPeriod(
    sleeps,
    new Date(+now - 24 * 60 * 60 * 1000),
    now,
  );
  const { snapshot: weather } = useWeather(data.travelCity || data.city);
  const clothes = weather.current
    ? wardrobe(
        weather.current.apparent_temperature,
        "stroller",
        weather.current.wind_speed_10m,
        weather.current.precipitation,
      ).layers
        .slice(0, 3)
        .map((layer) => layer.item)
        .join(" · ")
    : "Открыть прогноз и подобрать одежду";

  return (
    <div className="today-page">
      <section className="today-intro">
        <div>
          <p className="eyebrow">СЕГОДНЯ</p>
          <h1>{name}</h1>
          <p className="today-age">{exactAge(profile.birth)}</p>
        </div>
        <Link to="profile" className="today-profile">
          <span className="sr-only">Профиль ребёнка</span>
          {profile.name ? profile.name[0].toUpperCase() : "♡"}
        </Link>
      </section>

      <Link to="weather" className="today-weather">
        <span className="sr-only">Погода и одежда. </span>
        <span className="today-weather-icon" aria-hidden="true">
          {weather.current?.precipitation ? "☂" : "☀"}
        </span>
        <span>
          <strong>
            {weather.current
              ? `${Math.round(weather.current.temperature_2m)}° · ${weather.city?.name || "погода"}`
              : data.city
                ? "Погода не загружена"
                : "Добавьте город"}
          </strong>
          <small>{weather.current ? clothes : "Подберём комплект на прогулку"}</small>
        </span>
        <span className="today-chevron">›</span>
      </Link>

      <section className="today-section">
        <div className="section-title today-section-title">
          <div>
            <p className="eyebrow">ПЛАН БЕЗ ПЕРЕГРУЗКИ</p>
            <h2>Сегодня для {profile.name || "малыша"}</h2>
          </div>
          <Link to="recommendations" className="text-link">
            Ещё →
          </Link>
        </div>

        <div className="today-grid-v2">
          <Link to="development" className="today-card today-card-wide">
            <span className="today-card-icon">🌱</span>
            <div>
              <small>НАВЫК ДНЯ · {age === null ? "ВОЗРАСТ" : `${age} МЕС.`}</small>
              <h3>{stage.title}</h3>
              <p>{stage.activity}</p>
            </div>
            <span className="today-chevron">›</span>
          </Link>

          <Link to={`game/${game.id}`} className="today-card">
            <span className="today-card-icon">{game.icon}</span>
            <small>ИГРА · {game.minutes} МИН</small>
            <h3>{game.title}</h3>
            <p>{game.goal}</p>
          </Link>

          <Link to="menu" className="today-card">
            <span className="today-card-icon">🥣</span>
            <small>ПИТАНИЕ</small>
            <h3>{safeAge < 6 ? "Питание по возрасту" : "Меню на 14 дней"}</h3>
            <p>
              {safeAge < 6
                ? "Ориентиры и безопасный переход к прикорму по готовности"
                : `${profile.introduced.length} продуктов отмечено как введённые`}
            </p>
          </Link>

          <Link to="sleep-log" className="today-card">
            <span className="today-card-icon">🌙</span>
            <small>СОН · 24 ЧАСА</small>
            <h3>{sleeps.length ? hours(sleepMinutes) : "Нет записи"}</h3>
            <p>{sleeps.length ? "По вашему дневнику" : "Добавить сон в дневник"}</p>
          </Link>

          <Link to="weather" className="today-card">
            <span className="today-card-icon">🧥</span>
            <small>ПРОГУЛКА</small>
            <h3>{weather.current ? "Как одеть" : "Проверить погоду"}</h3>
            <p>{clothes}</p>
          </Link>

          <Link to="age-guide" className="today-card today-card-wide today-guide-card">
            <span className="today-card-icon">🧭</span>
            <div>
              <small>ГАЙД ПО ВОЗРАСТУ</small>
              <h3>{age === null ? "Настройте возраст" : `${age} месяцев: главное сейчас`}</h3>
              <p>Развитие, питание, сон, здоровье и идеи занятий в одном месте.</p>
            </div>
            <span className="today-chevron">›</span>
          </Link>
        </div>
      </section>

      <section className="today-quick">
        <Link to="repeat">
          <span>🎙</span>
          <strong>Повторюшка</strong>
          <small>Говорим без спешки</small>
        </Link>
        <Link to="health">
          <span>♡</span>
          <strong>Здоровье</strong>
          <small>Что делать и когда к врачу</small>
        </Link>
        <Link to={`guide/${currentGuide.id}`}>
          <span>✓</span>
          <strong>Текущий гайд</strong>
          <small>{currentGuide.title}</small>
        </Link>
      </section>

      {age === null && (
        <Note>
          Добавьте дату рождения в профиле — BabyGuide подстроит развитие, игры,
          питание и гайды под возраст.
        </Note>
      )}
    </div>
  );
}
