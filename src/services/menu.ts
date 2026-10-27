import type { Profile, Recipe } from "../types";
import { recipes, foods, slots } from "../data/nutrition";
const normalize = (s: string) =>
  s.toLocaleLowerCase("ru").replace(/ё/g, "е").trim();
export function foodMatches(id: string, entries: string[]) {
  return entries.some(
    (e) =>
      normalize(e) === normalize(id) ||
      normalize(e) === normalize(foods[id]?.name || ""),
  );
}
const alias: Record<string, string[]> = {
  молоко: ["молоко", "молочные", "бкм", "белок коровьего молока"],
  яйцо: ["яйцо", "яйца"],
  рыба: ["рыба", "рыбу"],
  глютен: ["глютен", "пшеница", "пшеничная мука"],
  соя: ["соя", "соевый белок"],
};
export function eligible(
  r: Recipe,
  p: Profile,
  age: number,
  onlyIntroduced = false,
) {
  if (
    p.dislikes.some((x) => normalize(x) === normalize(r.name)) ||
    age < r.minAge ||
    r.allergens.some((a) =>
      p.allergies.some((x) => (alias[a] || [a]).includes(normalize(x))),
    )
  )
    return false;
  if (
    r.ingredients.some(
      (i) =>
        foodMatches(i.id, p.excluded) ||
        foodMatches(i.id, p.allergies) ||
        foodMatches(i.id, p.dislikes),
    )
  )
    return false;
  if (p.feeding === "Вегетарианское" && !r.vegetarian) return false;
  if (
    p.feeding === "Веганское" &&
    (!r.vegetarian || r.allergens.some((a) => ["молоко", "яйцо"].includes(a)))
  )
    return false;
  if (
    onlyIntroduced &&
    r.ingredients.some(
      (i) =>
        !["water", "oil"].includes(i.id) && !foodMatches(i.id, p.introduced),
    )
  )
    return false;
  return true;
}
export function seasonNow() {
  const m = new Date().getMonth();
  return m < 2 || m === 11
    ? "winter"
    : m < 5
      ? "spring"
      : m < 8
        ? "summer"
        : "autumn";
}
export function regionFor(country: string, city: string, manual: string) {
  if (manual) return manual;
  const name = normalize(city);
  if (/владивосток|хабаровск|сахалин|vladivostok/.test(name))
    return "ru-fareast";
  if (/япония|китай|корея|japan|china|korea/i.test(country)) return "asia";
  if (/сша|америк|usa|united states|канад|canada/i.test(country)) return "us";
  if (
    /итал|испан|грец|turkey|spain|italy|greece|portugal|португ/i.test(country)
  )
    return "mediterranean";
  if (
    /герм|франц|великобрит|germany|france|britain|united kingdom|бельг|нидерланд/i.test(
      country,
    )
  )
    return "europe";
  return "ru";
}
export function geographicFoodRegion(
  latitude: number,
  longitude: number,
  fallback = "ru",
) {
  if (latitude >= 40 && latitude <= 75 && longitude >= 120 && longitude <= 180)
    return "ru-fareast";
  if (latitude >= -10 && latitude <= 55 && longitude >= 90 && longitude <= 180)
    return "asia";
  if (latitude >= 20 && latitude <= 75 && longitude >= -170 && longitude <= -50)
    return "us";
  if (latitude >= 30 && latitude < 47 && longitude >= -10 && longitude <= 40)
    return "mediterranean";
  if (latitude >= 47 && latitude <= 72 && longitude >= -15 && longitude <= 40)
    return "europe";
  if (latitude >= 40 && latitude <= 75 && longitude > 40 && longitude < 120)
    return "ru";
  return fallback;
}
export function candidates(
  p: Profile,
  age: number,
  slot: Recipe["slot"],
  options: {
    onlyIntroduced?: boolean;
    pantryOnly?: boolean;
    region?: string;
  } = {},
) {
  const season = p.season === "auto" ? seasonNow() : p.season;
  return recipes
    .filter(
      (r) =>
        r.slot === slot &&
        eligible(r, p, age, options.onlyIntroduced) &&
        (!options.pantryOnly ||
          r.ingredients.every(
            (i) =>
              ["water", "oil"].includes(i.id) || foodMatches(i.id, p.pantry),
          )),
    )
    .map((r, index) => ({
      r,
      index,
      score:
        (r.regions.includes(options.region || p.region) ? 5 : 0) +
        (r.seasons.includes(season) ? 2 : 0) +
        r.ingredients.filter((i) => foodMatches(i.id, p.pantry)).length * 2 +
        r.ingredients.filter((i) => foodMatches(i.id, p.favorites)).length * 3,
    }))
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .map((x) => x.r);
}
export function buildMenu(
  p: Profile,
  age: number,
  options: Parameters<typeof candidates>[3] = {},
) {
  return slots.map((s) => candidates(p, age, s, options)[0]?.id || "");
}
