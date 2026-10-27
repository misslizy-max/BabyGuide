import { useEffect, useSyncExternalStore } from "react";
import type { City } from "../types";
import { fetchWeather, type WeatherCurrent } from "../services/weather";
type Snapshot = {
  city: City | null;
  current: WeatherCurrent | null;
  error: string;
  busy: boolean;
  updated: number;
};
const emptySnapshot: Snapshot = {
  city: null,
  current: null,
  error: "",
  busy: false,
  updated: 0,
};
let snapshot = emptySnapshot;
let request = 0;
const listeners = new Set<() => void>();
const emit = (s: Snapshot) => {
  snapshot = s;
  listeners.forEach((fn) => fn());
};
const subscribe = (fn: () => void) => {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
};
export async function requestWeather(city: City) {
  const id = ++request;
  emit({ city, current: null, error: "", busy: true, updated: 0 });
  try {
    const c = await fetchWeather(city);
    if (request === id)
      emit({ city, current: c, busy: false, error: "", updated: Date.now() });
  } catch (e) {
    if (id === request)
      emit({
        city,
        current: null,
        busy: false,
        error: navigator.onLine
          ? "Не удалось загрузить погоду. Проверьте соединение и повторите. " +
            (e instanceof Error ? e.message : "")
          : "Нет сети. Дневники и библиотека доступны офлайн; погода — после подключения.",
        updated: 0,
      });
  }
}
export function useWeather(city?: City | null) {
  const s = useSyncExternalStore(subscribe, () => snapshot);
  useEffect(() => {
    if (
      city &&
      (!snapshot.city ||
        snapshot.city.latitude !== city.latitude ||
        snapshot.city.longitude !== city.longitude ||
        (!snapshot.error &&
          !snapshot.busy &&
          Date.now() - snapshot.updated > 600000))
    )
      void requestWeather(city);
  }, [city?.latitude, city?.longitude]);
  return { snapshot: city ? s : emptySnapshot, refresh: requestWeather };
}
