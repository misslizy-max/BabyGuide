import type { AppData, Profile, JournalEvent, EventKind } from "../types";
import { validDate, localNow, duration, today } from "../utils/dates";
import { validateData as validateLegacy } from "../storage.js";
export const KEY = "babyguide.v2";
export const emptyProfile = (): Profile => ({
  name: "",
  birth: "",
  sex: "girl",
  country: "Россия",
  city: "",
  region: "ru",
  feeding: "Смешанное",
  allergies: [],
  excluded: [],
  introduced: [],
  favorites: [],
  dislikes: [],
  skills: [],
  notes: "",
  toy: "мишка",
  pantry: [],
  season: "auto",
});
export const initial = (): AppData => ({
  version: 2,
  profile: emptyProfile(),
  events: [],
  favorites: [],
  menuDone: [],
  city: null,
  travelCity: null,
  menuPlan: [],
  practice: {},
  reminders: [],
});
const strings = (x: unknown, max = 300) => {
  if (
    !Array.isArray(x) ||
    x.length > max ||
    x.some((v) => typeof v !== "string" || v.length > 200)
  )
    throw Error("Некорректный список");
  return [...new Set(x as string[])];
};
const str = (x: unknown, max = 2000) => {
  if (typeof x !== "string" || x.length > max)
    throw Error("Некорректный текст");
  return x;
};
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
export function validate(value: unknown): AppData {
  if (!value || typeof value !== "object")
    throw Error("Неверный файл BabyGuide");
  const v = value as Record<string, unknown>;
  if (v.version !== 2) {
    const old = validateLegacy(value);
    const d = initial();
    Object.assign(d.profile, old.profile);
    d.city = old.city;
    const aliases: Record<string, string> = {
      "guide-week": "speech-seven",
      "guide-home": "safe-home",
      "rhyme-hands": "rhyme-0",
      "rhyme-rain": "rhyme-1",
      "rhyme-feet": "rhyme-2",
      "game-baby": "game-0-0",
      "game-box": "game-1-2",
      "game-story": "game-5-3",
    };
    d.favorites = old.favorites.map((id: string) => aliases[id] || id);
    d.menuDone = old.menuDone;
    d.events = [
      ...old.diary.map(
        (e: { id: string; date: string; kind: string; text: string }) => ({
          id: e.id,
          time: e.date + "T12:00",
          text: e.text,
          kind: (kinds.includes(e.kind as EventKind)
            ? e.kind
            : e.kind === "Питание"
              ? "Еда"
              : "Момент") as EventKind,
        }),
      ),
      ...old.sleep.map(
        (e: {
          id: string;
          start: string;
          end: string;
          note: string;
          quality: string;
        }) => ({
          id: e.id,
          kind: "Сон" as const,
          time: e.start,
          end: e.end,
          text: e.note,
          quality: e.quality,
        }),
      ),
      ...old.growth.map(
        (e: { id: string; date: string; weight: number; height: number }) => ({
          id: e.id,
          kind: "Рост" as const,
          time: e.date + "T12:00",
          text: "",
          weight: e.weight,
          height: e.height,
        }),
      ),
    ];
    return d;
  }
  const d = initial();
  if (
    !v.profile ||
    typeof v.profile !== "object" ||
    !Array.isArray(v.events) ||
    v.events.length > 10000
  )
    throw Error("Повреждён профиль или дневник");
  const p = v.profile as Record<string, unknown>;
  for (const key of [
    "name",
    "birth",
    "country",
    "city",
    "region",
    "feeding",
    "notes",
    "toy",
    "season",
  ] as const)
    if (p[key] !== undefined)
      (d.profile[key] as string) = str(
        p[key],
        key === "notes" ? 4000 : key === "name" ? 40 : 200,
      );
  if (
    d.profile.birth &&
    (!validDate(d.profile.birth) || d.profile.birth > today())
  )
    throw Error("Неверная дата рождения");
  d.profile.sex = p.sex === "boy" ? "boy" : "girl";
  for (const key of [
    "allergies",
    "excluded",
    "introduced",
    "favorites",
    "dislikes",
    "skills",
    "pantry",
  ] as const)
    if (p[key] !== undefined) d.profile[key] = strings(p[key]);
  const ids = new Set();
  d.events = v.events.map((raw) => {
    if (!raw || typeof raw !== "object") throw Error("Повреждена запись");
    const e = raw as JournalEvent;
    if (
      !kinds.includes(e.kind) ||
      typeof e.id !== "string" ||
      e.id.length > 100 ||
      ids.has(e.id) ||
      typeof e.time !== "string" ||
      !/^\d{4}-\d{2}-\d{2}T(?:[01]\d|2[0-3]):[0-5]\d$/.test(e.time) ||
      !validDate(e.time.slice(0, 10)) ||
      !Number.isFinite(Date.parse(e.time))
    )
      throw Error("Повреждена запись");
    ids.add(e.id);
    const event: JournalEvent = {
      id: e.id,
      kind: e.kind,
      time: e.time,
      text: str(e.text, 4000),
    };
    for (const key of [
      "end",
      "quality",
      "method",
      "medicine",
      "word",
      "audioId",
    ] as const)
      if (e[key] !== undefined) event[key] = str(e[key], 300);
    for (const [key, min, max] of [
      ["weight", 0.3, 50],
      ["height", 20, 150],
      ["head", 20, 65],
      ["temperature", 30, 43],
      ["amount", 0, 1500],
    ] as const) {
      if (e[key] !== undefined) {
        if (
          typeof e[key] !== "number" ||
          !Number.isFinite(e[key]) ||
          e[key]! < min ||
          e[key]! > max
        )
          throw Error("Неверное измерение");
        event[key] = e[key];
      }
    }
    if (
      event.kind === "Сон" &&
      (!event.end ||
        duration(event.time, event.end) <= 0 ||
        duration(event.time, event.end) > 1440)
    )
      throw Error("Неверный интервал сна");
    return event;
  });
  d.favorites = v.favorites === undefined ? [] : strings(v.favorites, 2000);
  d.menuPlan = v.menuPlan === undefined ? [] : strings(v.menuPlan, 4); // slots may repeat: preserve ordering below
  if (Array.isArray(v.menuPlan)) {
    if (v.menuPlan.length !== 0 && v.menuPlan.length !== 4)
      throw Error("Неверный план меню");
    d.menuPlan = v.menuPlan.map((x) => str(x, 100));
  }
  d.menuDone = Array.isArray(v.menuDone)
    ? v.menuDone.filter(
        (n): n is number =>
          Number.isInteger(n) && Number(n) >= 0 && Number(n) < 14,
      )
    : [];
  for (const key of ["city", "travelCity"] as const) {
    const c = v[key] as AppData["city"];
    if (c) {
      if (
        typeof c.name !== "string" ||
        !Number.isFinite(c.latitude) ||
        !Number.isFinite(c.longitude) ||
        Math.abs(c.latitude) > 90 ||
        Math.abs(c.longitude) > 180
      )
        throw Error("Неверные координаты");
      d[key] = {
        name: c.name.slice(0, 100),
        latitude: c.latitude,
        longitude: c.longitude,
        country:
          typeof c.country === "string" ? c.country.slice(0, 100) : undefined,
        countryCode:
          typeof c.countryCode === "string"
            ? c.countryCode.slice(0, 5)
            : undefined,
        region:
          typeof c.region === "string" ? c.region.slice(0, 100) : undefined,
      };
    }
  }
  if (v.practice && typeof v.practice === "object")
    for (const [id, days] of Object.entries(v.practice)) {
      if (
        ["__proto__", "constructor", "prototype"].includes(id) ||
        id.length > 100 ||
        !Array.isArray(days) ||
        days.some((n) => !Number.isInteger(n) || n < 0 || n > 30)
      )
        throw Error("Неверный практикум");
      d.practice[id] = [...new Set(days)];
    }
  if (v.reminders !== undefined) {
    if (!Array.isArray(v.reminders) || v.reminders.length > 500)
      throw Error("Неверные напоминания");
    d.reminders = v.reminders.map((r) => {
      if (!r || !validDate(r.date)) throw Error("Неверная дата напоминания");
      return {
        id: str(r.id, 100),
        text: str(r.text, 200),
        date: r.date,
        done: !!r.done,
      };
    });
  }
  return d;
}
export function readData(): {
  data: AppData;
  error: string;
  raw: string | null;
} {
  let raw = null;
  try {
    raw = localStorage.getItem(KEY) || localStorage.getItem("babyguide.v1");
    return {
      data: raw ? validate(JSON.parse(raw)) : initial(),
      error: "",
      raw: null,
    };
  } catch {
    return {
      data: initial(),
      error:
        "Не удалось прочитать данные. Сохраните исходную копию в профиле перед сбросом.",
      raw,
    };
  }
}
export function writeData(d: AppData) {
  localStorage.setItem(KEY, JSON.stringify(d));
}
export const newEvent = (
  kind: EventKind,
  text = "",
  fields: Partial<JournalEvent> = {},
): JournalEvent => ({
  id: crypto.randomUUID(),
  kind,
  time: localNow(),
  text,
  ...fields,
});
