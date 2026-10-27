import type { City } from "../types";
export interface WeatherCurrent {
  temperature_2m: number;
  apparent_temperature: number;
  precipitation: number;
  wind_speed_10m: number;
  weather_code: number;
  relative_humidity_2m?: number;
  time: string;
  uv?: number;
}
export interface CityResult {
  name: string;
  latitude: number;
  longitude: number;
  country?: string;
  country_code?: string;
  admin1?: string;
}
async function json(url: string, signal?: AbortSignal) {
  const controller = new AbortController();
  const abortFromCaller = () => controller.abort(signal?.reason);
  if (signal?.aborted) abortFromCaller();
  else signal?.addEventListener("abort", abortFromCaller, { once: true });
  const timer = setTimeout(
    () =>
      controller.abort(
        new DOMException(
          "Сервис погоды не ответил за 12 секунд.",
          "TimeoutError",
        ),
      ),
    12000,
  );
  try {
    const response = await fetch(url, { signal: controller.signal });
    if (!response.ok) throw Error("Сервис ответил " + response.status);
    return await response.json();
  } finally {
    clearTimeout(timer);
    signal?.removeEventListener("abort", abortFromCaller);
  }
}
export async function findCities(
  name: string,
  country = "",
  signal?: AbortSignal,
): Promise<CityResult[]> {
  if (name.trim().length < 2) throw Error("Введите хотя бы две буквы");
  const data = await json(
    "https://geocoding-api.open-meteo.com/v1/search?name=" +
      encodeURIComponent(name.trim()) +
      "&count=8&language=ru&format=json" +
      (country ? "&countryCode=" + encodeURIComponent(country) : ""),
    signal,
  );
  return Array.isArray(data?.results)
    ? data.results.filter(
        (r: CityResult) =>
          typeof r.name === "string" &&
          Number.isFinite(r.latitude) &&
          Number.isFinite(r.longitude) &&
          Math.abs(r.latitude) <= 90 &&
          Math.abs(r.longitude) <= 180,
      )
    : [];
}
export async function fetchWeather(
  city: City,
  signal?: AbortSignal,
): Promise<WeatherCurrent> {
  if (
    !Number.isFinite(city.latitude) ||
    !Number.isFinite(city.longitude) ||
    Math.abs(city.latitude) > 90 ||
    Math.abs(city.longitude) > 180
  )
    throw Error("Неверные координаты");
  const data = await json(
    `https://api.open-meteo.com/v1/forecast?latitude=${city.latitude}&longitude=${city.longitude}&current=temperature_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m,relative_humidity_2m&daily=uv_index_max&forecast_days=1&timezone=auto`,
    signal,
  );
  const c = data?.current;
  if (
    !c ||
    ![
      "temperature_2m",
      "apparent_temperature",
      "precipitation",
      "wind_speed_10m",
      "weather_code",
    ].every((k) => Number.isFinite(c[k])) ||
    typeof c.time !== "string" ||
    !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(c.time)
  )
    throw Error("Сервис вернул неполные данные");
  return {
    ...c,
    uv: Number.isFinite(data.daily?.uv_index_max?.[0])
      ? data.daily.uv_index_max[0]
      : undefined,
    relative_humidity_2m: Number.isFinite(c.relative_humidity_2m)
      ? c.relative_humidity_2m
      : undefined,
  };
}
export function weatherLabel(code: number) {
  return code === 0
    ? "Ясно"
    : code <= 3
      ? "Переменная облачность"
      : code <= 48
        ? "Туман"
        : code <= 67
          ? "Дождь"
          : code <= 77
            ? "Снег"
            : code <= 82
              ? "Ливень"
              : code <= 86
                ? "Снегопад"
                : "Гроза";
}
