import { Link } from "../components/UI";
import { useApp } from "../hooks/useApp";
import { useWeather } from "../hooks/useWeather";
import { development } from "../data/development";
import { games } from "../data/games";
import { exactAge, hours, months, sleepInPeriod } from "../utils/dates";
import { wardrobe } from "../services/wardrobe";

const ACTIVE_SLEEP_KEY = "babyguide.sleep.active";
function activeSleep() { try { return localStorage.getItem(ACTIVE_SLEEP_KEY) || ""; } catch { return ""; } }

export function TodayV3() {
  const { data } = useApp();
  const age = months(data.profile.birth);
  const safeAge = Math.min(Math.max(age ?? 0, 0), 36);
  const stage = development[safeAge];
  const availableGames = games.filter((game) => safeAge >= game.min && safeAge <= game.max);
  const game = availableGames[new Date().getDate() % Math.max(1, availableGames.length)] || games[0];
  const sleeps = data.events.filter((event) => event.kind === "Сон" && event.end);
  const now = new Date();
  const sleep24 = sleepInPeriod(sleeps, new Date(+now - 86400000), now);
  const active = activeSleep();
  const lastSleep = [...sleeps].sort((a,b)=>b.time.localeCompare(a.time))[0];
  const sinceWake = lastSleep?.end ? Math.max(0, Math.round((Date.now()-Date.parse(lastSleep.end))/60000)) : null;
  const { snapshot: weather } = useWeather(data.travelCity || data.city);
  const outfit = weather.current ? wardrobe(weather.current.apparent_temperature,"stroller",weather.current.wind_speed_10m,weather.current.precipitation).layers.slice(0,3).map((layer)=>layer.item).join(" · ") : "Добавьте город — подберём одежду";

  return (
    <div className="today-v3-page">
      <section className="today-v3-header">
        <div><p className="eyebrow">СЕГОДНЯ</p><h1>{data.profile.name || "Растём вместе"}</h1><p>{exactAge(data.profile.birth)}</p></div>
        <Link to="profile" className="today-v3-avatar">{data.profile.name ? data.profile.name[0].toUpperCase() : "♡"}</Link>
      </section>

      <section className="today-v3-now">
        <div className="today-v3-now-art" aria-hidden="true"><span className={active?"moon":"sun"}/><i/><b/></div>
        <div className="today-v3-now-copy"><p className="eyebrow">{active?"СЕЙЧАС СПИТ":"СОН СЕГОДНЯ"}</p><h2>{active?"Таймер идёт":hours(sleep24)}</h2><p>{active?`Начало в ${new Date(active).toLocaleTimeString("ru-RU",{hour:"2-digit",minute:"2-digit"})}`:sinceWake===null?"Первой записи сна пока нет":`Последнее пробуждение ${hours(sinceWake)} назад`}</p></div>
        <Link to="sleep-log" className="today-v3-primary">{active?"Открыть таймер":"☾ Женя уснул"}</Link>
      </section>

      <Link to="quick-add" className="today-v3-quick"><span>+</span><div><strong>Записать событие</strong><small>Сон, еда, температура, лекарство, рост или новое слово</small></div><b>›</b></Link>

      <section className="today-v3-section">
        <div className="today-v3-section-head"><div><p className="eyebrow">ГЛАВНОЕ НА СЕГОДНЯ</p><h2>Три полезных шага</h2></div></div>
        <div className="today-v3-main-grid">
          <Link to="development" className="today-v3-feature development"><div className="today-v3-feature-art"><span/><i/><b/></div><small>РАЗВИТИЕ · {age===null?"ВОЗРАСТ":`${age} МЕС.`}</small><h3>{stage.title}</h3><p>{stage.activity}</p><strong>Что сейчас развивается →</strong></Link>
          <Link to={`game/${game.id}`} className="today-v3-feature game"><div className="today-v3-feature-art"><span/><i/><b/></div><small>ИГРА · {game.minutes} МИН</small><h3>{game.title}</h3><p>{game.goal}</p><strong>Показать игру →</strong></Link>
          <Link to="nutrition" className="today-v3-feature nutrition"><div className="today-v3-feature-art"><span/><i/><b/></div><small>ПИТАНИЕ</small><h3>{safeAge<6?"Подготовка к прикорму":"Что приготовить сегодня"}</h3><p>{safeAge<6?"Признаки готовности, безопасная подача и аллергены.":`${data.profile.introduced.length} продуктов отмечено как введённые.`}</p><strong>Открыть питание →</strong></Link>
        </div>
      </section>

      <section className="today-v3-two-col">
        <Link to="weather" className="today-v3-weather"><div className="weather-v3-art" aria-hidden="true"><span className={weather.current?.precipitation?"rain":"clear"}/><i/><b/></div><div><small>ПРОГУЛКА</small><h3>{weather.current?`${Math.round(weather.current.temperature_2m)}° · ${weather.city?.name || "погода"}`:"Погода"}</h3><p>{outfit}</p></div><strong>›</strong></Link>
        <Link to="health" className="today-v3-health"><div className="health-v3-art" aria-hidden="true"><span>+</span><i/><b/></div><div><small>ЗДОРОВЬЕ</small><h3>Что случилось?</h3><p>Температура, насморк, травма, аллергия, первая помощь и аптечка.</p></div><strong>›</strong></Link>
      </section>

      <section className="today-v3-manual">
        <div className="manual-v3-mini-art" aria-hidden="true"><span/><i/><b/></div><div><p className="eyebrow">МЕТОДИЧЕСКИЕ ПОСОБИЯ</p><h2>Не короткий совет, а полный разбор</h2><p>Визуальная схема → алгоритм → практика → ошибки → красные флаги.</p><Link to="manuals" className="button">Открыть пособия</Link></div>
      </section>
    </div>
  );
}
