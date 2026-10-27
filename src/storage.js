export const KEY = "babyguide.v1";
export const initial = () => ({
  profile: { name: "", birth: "", sex: "girl" },
  diary: [],
  sleep: [],
  growth: [],
  favorites: [],
  menuDone: [],
  city: null,
});
export function validDate(value) {
  return (
    typeof value === "string" &&
    /^\d{4}-\d{2}-\d{2}$/.test(value) &&
    Number.isFinite(Date.parse(value)) &&
    new Date(value).toISOString().slice(0, 10) === value
  );
}
const text = (value, max, required = false) => {
  if (
    typeof value !== "string" ||
    value.length > max ||
    (required && !value.trim())
  )
    throw new Error("Некорректный текст записи");
  return value;
};
export function sleepMinutes(start, end) {
  const s = new Date(start),
    e = new Date(end);
  return Number.isFinite(+s) && Number.isFinite(+e) && e > s
    ? Math.round((e - s) / 60000)
    : 0;
}
export function validateData(value) {
  if (!value || typeof value !== "object" || Array.isArray(value))
    throw new Error("Неверный формат данных");
  if (
    !["profile", "diary", "sleep", "growth"].some((k) =>
      Object.hasOwn(value, k),
    )
  )
    throw new Error("Это не резервная копия BabyGuide");
  const d = initial();
  if (value.profile !== undefined) {
    const p = value.profile;
    if (!p || typeof p !== "object" || Array.isArray(p))
      throw new Error("Неверный профиль");
    d.profile.name = text(p.name ?? "", 40);
    if (p.birth && !validDate(p.birth))
      throw new Error("Неверная дата рождения");
    d.profile.birth = p.birth || "";
    d.profile.sex = p.sex === "boy" ? "boy" : "girl";
  }
  for (const key of ["diary", "sleep", "growth"]) {
    if (
      value[key] !== undefined &&
      (!Array.isArray(value[key]) || value[key].length > 5000)
    )
      throw new Error("Повреждён список " + key);
    const ids = new Set();
    d[key] = (value[key] || []).map((x) => {
      if (
        !x ||
        typeof x !== "object" ||
        typeof x.id !== "string" ||
        !x.id ||
        x.id.length > 100 ||
        ids.has(x.id) ||
        !validDate(x.date)
      )
        throw new Error("Повреждена запись");
      ids.add(x.id);
      const base = { id: x.id, date: x.date };
      if (key === "diary")
        return {
          ...base,
          text: text(x.text, 2000, true),
          kind: text(x.kind ?? "Момент", 50),
          mood: text(x.mood ?? "☺ Спокойно", 100),
        };
      if (key === "growth") {
        if (
          !Number.isFinite(x.weight) ||
          !Number.isFinite(x.height) ||
          x.weight < 0.3 ||
          x.weight > 50 ||
          x.height < 20 ||
          x.height > 150
        )
          throw new Error("Неверные измерения");
        return { ...base, weight: x.weight, height: x.height };
      }
      const mins = sleepMinutes(x.start, x.end);
      if (
        typeof x.start !== "string" ||
        typeof x.end !== "string" ||
        !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(x.start) ||
        !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(x.end) ||
        !validDate(x.start.slice(0, 10)) ||
        !validDate(x.end.slice(0, 10)) ||
        x.date !== x.start.slice(0, 10) ||
        !mins ||
        mins > 1440
      )
        throw new Error("Неверный интервал сна");
      return {
        ...base,
        start: x.start,
        end: x.end,
        quality: text(x.quality ?? "Спокойно", 50),
        note: text(x.note ?? "", 300),
      };
    });
  }
  d.favorites = Array.isArray(value.favorites)
    ? [
        ...new Set(
          value.favorites.filter(
            (x) => typeof x === "string" && x.length < 100,
          ),
        ),
      ]
    : [];
  d.menuDone = Array.isArray(value.menuDone)
    ? [
        ...new Set(
          value.menuDone.filter((x) => Number.isInteger(x) && x >= 0 && x < 14),
        ),
      ]
    : [];
  if (
    value.city &&
    typeof value.city.name === "string" &&
    Number.isFinite(value.city.latitude) &&
    Number.isFinite(value.city.longitude) &&
    Math.abs(value.city.latitude) <= 90 &&
    Math.abs(value.city.longitude) <= 180
  )
    d.city = {
      name: value.city.name.slice(0, 100),
      latitude: value.city.latitude,
      longitude: value.city.longitude,
    };
  return d;
}
export function read() {
  let raw = null;
  try {
    raw = localStorage.getItem(KEY);
    return raw
      ? { data: validateData(JSON.parse(raw)), error: null, raw: null }
      : { data: initial(), error: null, raw: null };
  } catch {
    return {
      data: initial(),
      raw,
      error:
        "Не удалось прочитать сохранённые данные. Экспортируйте резервную копию, прежде чем сбрасывать хранилище.",
    };
  }
}
export function write(data) {
  localStorage.setItem(KEY, JSON.stringify(data));
}
export function ageMonths(birth, now = new Date()) {
  if (!validDate(birth)) return null;
  const d = new Date(birth + "T00:00:00");
  if (d > now) return null;
  return Math.max(
    0,
    (now.getFullYear() - d.getFullYear()) * 12 +
      now.getMonth() -
      d.getMonth() -
      (now.getDate() < d.getDate() ? 1 : 0),
  );
}
