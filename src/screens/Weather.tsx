import { useRef, useState } from "react";
import { useApp } from "../hooks/useApp";
import { Heading, Note } from "../components/UI";
import { useWeather } from "../hooks/useWeather";
import { weatherLabel, findCities, type CityResult } from "../services/weather";
import { wardrobe } from "../services/wardrobe";
import { geographicFoodRegion } from "../services/menu";
import { regions } from "../data/nutrition";
import type { City } from "../types";
const countryRegions: Record<string, string> = {
  JP: "asia",
  KR: "asia",
  CN: "asia",
  US: "us",
  CA: "us",
  ES: "mediterranean",
  IT: "mediterranean",
  GR: "mediterranean",
  DE: "europe",
  FR: "europe",
  GB: "europe",
};
function cityRegion(c: { country_code?: string; longitude: number }) {
  return c.country_code === "RU"
    ? c.longitude > 120
      ? "ru-fareast"
      : "ru"
    : countryRegions[c.country_code || ""] || "europe";
}
export function Weather() {
  const { data, update, notify } = useApp();
  const currentCity = data.travelCity || data.city;
  const { snapshot, refresh } = useWeather(currentCity);
  const [query, setQuery] = useState(""),
    [country, setCountry] = useState(data.city?.countryCode || "RU"),
    [results, setResults] = useState<CityResult[]>([]),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false),
    [travel, setTravel] = useState(!!data.travelCity),
    [mode, setMode] = useState("stroller");
  const request = useRef(0);
  async function choose(c: City) {
    update((d) => ({
      ...d,
      [travel ? "travelCity" : "city"]: c,
      ...(!travel
        ? {
            travelCity: null,
            profile: {
              ...d.profile,
              city: c.name,
              country: c.country || d.profile.country,
              region: c.region || d.profile.region,
            },
          }
        : {}),
    }));
    setResults([]);
    await refresh(c);
  }
  async function search(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const id = ++request.current;
    setBusy(true);
    setError("");
    setResults([]);
    try {
      const rows = await findCities(query, country);
      if (id !== request.current) return;
      setResults(rows);
      if (!rows.length)
        setError(
          "Город не найден. Проверьте название или выберите другую страну.",
        );
    } catch {
      if (id === request.current)
        setError(
          "Не удалось найти город. Проверьте интернет и повторите поиск. Геолокация для ручного поиска не нужна.",
        );
    } finally {
      if (id === request.current) setBusy(false);
    }
  }
  function locate() {
    setError("");
    if (!navigator.geolocation) {
      setError("Геолокация не поддерживается. Найдите город вручную.");
      return;
    }
    if (!window.isSecureContext) {
      setError("Геолокация доступна по HTTPS. Используйте ручной город.");
      return;
    }
    setBusy(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setBusy(false);
        void choose({
          name: "Моё местоположение",
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          region: geographicFoodRegion(
            pos.coords.latitude,
            pos.coords.longitude,
            data.profile.region,
          ),
        });
      },
      (e) => {
        setBusy(false);
        setError(
          e.code === 1
            ? "Доступ к геолокации запрещён. Ручной поиск города остаётся доступен."
            : e.code === 3
              ? "Не удалось определить местоположение вовремя. Попробуйте ещё раз или укажите город."
              : "Не удалось определить местоположение. Укажите город вручную.",
        );
      },
      { timeout: 12000, maximumAge: 300000, enableHighAccuracy: false },
    );
  }
  const w = snapshot.current,
    outfit = w
      ? wardrobe(
          w.apparent_temperature,
          mode,
          w.wind_speed_10m,
          w.precipitation,
          w.uv,
        )
      : null;
  return (
    <>
      <Heading
        title="Время на прогулку"
        sub="Погода, регион и полный комплект одежды"
      />
      <section className="form-card">
        <label>
          Страна поиска
          <select value={country} onChange={(e) => setCountry(e.target.value)}>
            {[
              ["RU", "Россия"],
              ["KZ", "Казахстан"],
              ["BY", "Беларусь"],
              ["JP", "Япония"],
              ["KR", "Южная Корея"],
              ["CN", "Китай"],
              ["US", "США"],
              ["DE", "Германия"],
              ["FR", "Франция"],
              ["ES", "Испания"],
              ["IT", "Италия"],
              ["GB", "Великобритания"],
              ["", "Все страны"],
            ].map(([v, n]) => (
              <option key={v} value={v}>
                {n}
              </option>
            ))}
          </select>
        </label>
        <form id="city-search" className="search" onSubmit={search}>
          <label className="sr-only" htmlFor="city-q">
            Город
          </label>
          <input
            id="city-q"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            type="search"
            minLength={2}
            maxLength={100}
            required
            placeholder="Город, например Владивосток"
          />
          <button className="button" disabled={busy}>
            Найти
          </button>
        </form>
        <button className="secondary" onClick={locate} disabled={busy}>
          ⌖ Определить моё местоположение
        </button>
        <p className="small muted">
          Геолокация запрашивается только здесь, после нажатия. Координаты или
          название передаются Open-Meteo для погоды. Дневники туда не
          передаются.
        </p>
        <label className="check-row">
          <input
            type="checkbox"
            checked={travel}
            onChange={(e) => setTravel(e.target.checked)}
          />
          <span>Выбираю временный город поездки, домашний не менять</span>
        </label>
        {data.travelCity && (
          <button
            className="text-button"
            onClick={() => {
              update((d) => ({ ...d, travelCity: null }));
              setTravel(false);
              if (data.city) void refresh(data.city);
              notify("Возвращён домашний город");
            }}
          >
            Вернуться к домашнему городу
          </button>
        )}
        {busy && <p role="status">Ищем местоположение…</p>}
        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}
        <div className="city-results">
          {results.map((c, i) => (
            <button
              key={i}
              className="city-result"
              onClick={() =>
                void choose({
                  name: [c.name, c.country].filter(Boolean).join(", "),
                  latitude: c.latitude,
                  longitude: c.longitude,
                  country: c.country,
                  countryCode: c.country_code,
                  region: cityRegion(c),
                })
              }
            >
              {c.name}
              <small>{[c.admin1, c.country].filter(Boolean).join(", ")}</small>
              <span>→</span>
            </button>
          ))}
        </div>
      </section>
      {currentCity && (
        <section className="form-card">
          <label>
            Регион продуктов для меню
            <select
              value={currentCity.region || data.profile.region}
              onChange={(e) =>
                update((d) => ({
                  ...d,
                  profile: data.travelCity
                    ? d.profile
                    : { ...d.profile, region: e.target.value },
                  [data.travelCity ? "travelCity" : "city"]: {
                    ...currentCity,
                    region: e.target.value,
                  },
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
          <p className="small muted">
            По GPS предлагается широкая географическая зона, а не точная страна.
            Проверьте выбор вручную: он влияет на приоритет продуктов, но не
            блокирует другие рецепты.
          </p>
        </section>
      )}
      {snapshot.busy && <Note>Получаем свежую погоду…</Note>}
      {snapshot.error && (
        <Note danger>
          <p role="alert">{snapshot.error}</p>
          {snapshot.city && (
            <button
              className="secondary"
              onClick={() => void refresh(snapshot.city!)}
            >
              Попробовать снова
            </button>
          )}
        </Note>
      )}
      {w && (
        <>
          <section className="weather-card">
            <div>
              <p className="eyebrow">
                {snapshot.city?.name}
                {data.travelCity ? " · ПОЕЗДКА" : ""}
              </p>
              <h2>
                {Math.round(w.temperature_2m)}°
                <span>{w.weather_code <= 3 ? "☀" : "☁"}</span>
              </h2>
              <p>
                {weatherLabel(w.weather_code)} · ощущается как{" "}
                {Math.round(w.apparent_temperature)}°
              </p>
              <div className="weather-details">
                <span>Ветер {w.wind_speed_10m} км/ч</span>
                <span>Осадки {w.precipitation} мм</span>
              </div>
              <p>
                {w.relative_humidity_2m !== undefined
                  ? "Влажность " + w.relative_humidity_2m + "% · "
                  : ""}
                {w.uv !== undefined ? "UV max за день " + w.uv : ""}
              </p>
              <p className="small">
                Данные на {w.time.replace("T", " ")} · местное время
              </p>
            </div>
            <button
              className="secondary"
              onClick={() => void refresh(snapshot.city!)}
            >
              Обновить
            </button>
          </section>
          <section className="outfit-card">
            <p className="eyebrow">КАК ОДЕТЬ СЕГОДНЯ</p>
            <h2>Слои, которые можно менять</h2>
            <div className="segmented">
              <button
                className={mode === "stroller" ? "selected" : ""}
                aria-pressed={mode === "stroller"}
                onClick={() => setMode("stroller")}
              >
                Коляска
              </button>
              <button
                className={mode === "active" ? "selected" : ""}
                aria-pressed={mode === "active"}
                onClick={() => setMode("active")}
              >
                Активная прогулка
              </button>
            </div>
            <div
              className="wardrobe-grid"
              role="group"
              aria-label="Полный комплект одежды"
            >
              {outfit!.layers.map((layer, i) => (
                <div className="wardrobe-layer" key={layer.label}>
                  <span aria-hidden="true">{layer.icon}</span>
                  <small>
                    {i + 1}. {layer.label}
                  </small>
                  <h3>{layer.item}</h3>
                </div>
              ))}
            </div>
            {outfit!.warnings.map((t) => (
              <Note key={t}>{t}</Note>
            ))}
            <p>
              Проверьте шею и спину: тепло, но не горячо и не влажно. Холодные
              кисти сами по себе не показывают переохлаждение. Комплект —
              бытовой ориентир по ощущаемой температуре, не медицинское
              назначение.
            </p>
          </section>
        </>
      )}
      {!w && !snapshot.busy && !snapshot.error && (
        <div className="weather-empty">
          <span>☀</span>
          <h2>Выберите место для прогулки</h2>
          <p>
            Ручной город работает без разрешения геолокации. Данные не
            подменяются примерным прогнозом.
          </p>
        </div>
      )}
      <p className="source">
        Прогноз —{" "}
        <a
          href="https://open-meteo.com/"
          target="_blank"
          rel="noopener noreferrer"
        >
          Open-Meteo ↗
        </a>
        . UV — дневной максимум, не текущее измерение. Новые погодные данные
        требуют сети.
      </p>
    </>
  );
}
