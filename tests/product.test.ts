import { test } from "node:test";
import assert from "node:assert/strict";
import { initial, validate } from "../src/services/persistence";
import { months, sleepInPeriod, duration } from "../src/utils/dates";
import { dose } from "../src/services/medicines";
import { games } from "../src/data/games";
import { guides } from "../src/data/guides";
import { rhymes } from "../src/data/rhymes";
import { stories } from "../src/data/stories";
import { learningCards } from "../src/data/cards";
import { recipes, fortnight } from "../src/data/nutrition";
import { development, controlMonths } from "../src/data/development";
import { eligible, buildMenu, candidates } from "../src/services/menu";
import {
  lmsValue,
  zScore,
  approximatePercentile,
} from "../src/services/growth";
import { wardrobe } from "../src/services/wardrobe";
import { findCities, fetchWeather } from "../src/services/weather";
test("legacy data migrates without losing sleep, diary, favorites or growth", () => {
  const d = validate({
    profile: { name: "Аня", birth: "2025-01-01" },
    diary: [{ id: "d", date: "2026-01-01", text: "Шаг", kind: "Навык" }],
    sleep: [
      {
        id: "s",
        date: "2026-01-01",
        start: "2026-01-01T22:00",
        end: "2026-01-02T06:00",
        note: "Тихо",
      },
    ],
    growth: [{ id: "g", date: "2026-01-01", weight: 9.5, height: 75 }],
    favorites: ["safe-sleep"],
  });
  assert.equal(d.version, 2);
  assert.equal(d.profile.name, "Аня");
  assert.equal(d.events.length, 3);
  assert.equal(d.events[1].end, "2026-01-02T06:00");
  assert.equal(d.events[2].weight, 9.5);
  assert.equal(d.favorites[0], "safe-sleep");
  assert.deepEqual(validate(d), d);
});
test("schema rejects broken measurements, ids and dates; v2 backup retains all profile fields", () => {
  const d = initial();
  d.profile.allergies = ["молоко"];
  d.profile.pantry = ["rice"];
  assert.deepEqual(validate(d), d);
  assert.throws(() =>
    validate({
      ...d,
      events: [
        {
          id: "1",
          kind: "Рост",
          time: "2026-02-30T00:00",
          text: "",
          weight: 10,
        },
      ],
    }),
  );
  assert.throws(() =>
    validate({
      ...d,
      events: [
        {
          id: "1",
          kind: "Рост",
          time: "2026-02-20T00:00",
          text: "",
          head: 999,
        },
      ],
    }),
  );
});
test("daily sleep clips midnight and merges duplicate intervals", () => {
  const entries = [
    { time: "2026-01-01T22:00", end: "2026-01-02T06:00" },
    { time: "2026-01-02T00:00", end: "2026-01-02T06:00" },
    { time: "2026-01-02T12:00", end: "2026-01-02T13:30" },
  ];
  assert.equal(
    sleepInPeriod(
      entries,
      new Date("2026-01-02T00:00"),
      new Date("2026-01-03T00:00"),
    ),
    450,
  );
  assert.equal(duration(entries[0].time, entries[0].end), 480);
});
test("full content constraints: 37 months, 8 areas, 70 unique games, 20 rhymes, 17 full stories", () => {
  assert.equal(development.length, 37);
  for (const d of development) {
    assert.equal(d.domains.length, 8);
    assert.equal(d.control, controlMonths.includes(d.month));
    assert.ok(d.flags.length > 40);
  }
  assert.equal(games.length, 70);
  assert.equal(new Set(games.map((g) => g.steps.join())).size, 70);
  for (const g of games) {
    assert.equal(g.steps.length, 3);
    assert.ok(g.goal && g.prep && g.safety && g.material);
  }
  assert.ok(rhymes.length >= 20);
  assert.ok(rhymes.every((r) => r.text.split("\n").length >= 4));
  assert.equal(stories.length, 17);
  assert.ok(
    stories.every(
      (s) => s.paragraphs.length === 5 && s.paragraphs.join("").length > 500,
    ),
  );
  assert.equal(learningCards.length, 54);
  for (const g of guides) {
    assert.ok([3, 7, 14].includes(g.practice.length));
    assert.ok(
      g.assess && g.fallback && g.sources.length && g.steps.length >= 3,
    );
  }
});
test("recipe library has real instructions and 14 distinct full days", () => {
  assert.ok(recipes.length >= 50);
  assert.equal(fortnight.length, 14);
  assert.equal(new Set(fortnight.map((day) => day.join())).size, 14);
  for (const day of fortnight) {
    assert.equal(day.length, 4);
    for (const id of day) assert.ok(recipes.some((r) => r.id === id));
  }
  for (const r of recipes) {
    assert.ok(r.ingredients.every((i) => i.name && i.grams > 0));
    assert.ok(r.steps.length >= 3 && r.texture && r.serving && r.substitutions);
  }
});
test("menu excludes milk as an allergen, ingredients, dislikes and infant age; filters pantry strictly", () => {
  const p = initial().profile;
  p.allergies = ["молоко"];
  let menu = buildMenu(p, 18);
  assert.ok(
    menu.every(
      (id) => !recipes.find((r) => r.id === id)!.allergens.includes("молоко"),
    ),
  );
  p.excluded = ["Курица"];
  assert.ok(
    candidates(p, 18, "lunch").every(
      (r) => !r.ingredients.some((i) => i.id === "chicken"),
    ),
  );
  p.pantry = ["Овсянка", "Груша"];
  const list = candidates(p, 18, "breakfast", { pantryOnly: true });
  assert.equal(list.length, 1);
  assert.equal(list[0].id, "oats-pear");
  assert.equal(candidates(p, 5, "breakfast").length, 0);
  p.introduced = ["Овсянка"];
  assert.equal(
    candidates(p, 8, "breakfast", { onlyIntroduced: true }).length,
    0,
  );
  p.dislikes = ["Овсянка с грушей"];
  assert.equal(candidates(p, 18, "breakfast", { pantryOnly: true }).length, 0);
});
test("region and season change recommendations without forbidding manual recipes", () => {
  const p = initial().profile;
  p.region = "ru-fareast";
  const east = buildMenu(p, 24);
  p.region = "mediterranean";
  const med = buildMenu(p, 24);
  assert.notDeepEqual(east, med);
  assert.ok(candidates(p, 24, "lunch").some((r) => r.id === "salmon-rice"));
  p.season = "summer";
  const summer = candidates(p, 24, "breakfast").map((r) => r.id);
  p.season = "winter";
  assert.notDeepEqual(
    summer,
    candidates(p, 24, "breakfast").map((r) => r.id),
  );
});
test("WHO data matches official birth median and LMS inversion", () => {
  assert.equal(lmsValue("weight", "boy", 0, 0), 3.3464);
  assert.equal(lmsValue("height", "boy", 0, 0), 49.8842);
  for (const metric of ["weight", "height", "head"] as const) {
    for (const sex of ["boy", "girl"] as const) {
      const median = lmsValue(metric, sex, 365, 0)!;
      assert.ok(Math.abs(zScore(metric, sex, 365, median)!) < 1e-10);
      assert.ok(lmsValue(metric, sex, 365, 1.88)! > median);
    }
  }
  assert.equal(lmsValue("head", "boy", 2000, 0), null);
  assert.ok(Math.abs(approximatePercentile(0) - 50) < 0.001);
});
test("medicine conversion needs age, weight and label concentration; frequency conservatively bounded", () => {
  assert.throws(() => dose("paracetamol", 10, 120, 5, null));
  assert.throws(() => dose("ibuprofen", 10, 100, 5, 3));
  assert.throws(() => dose("paracetamol", 0, 120, 5, 12));
  assert.throws(() => dose("paracetamol", 10, 0, 5, 12));
  assert.throws(() => dose("paracetamol", 10, 10000, 1, 12));
  const a = dose("paracetamol", 10, 120, 5, 12);
  assert.equal(a.ml, 6.25);
  assert.equal(a.maxDoses, 4);
  assert.equal(a.interval, 6);
  const b = dose("ibuprofen", 10, 100, 5, 12);
  assert.equal(b.ml, 5);
  assert.equal(b.maxDoses, 3);
  assert.equal(b.interval, 8);
});
test("wardrobe includes all six functional layers and mode/weather warnings", () => {
  assert.equal(wardrobe(5, "stroller", 30, 1).layers.length, 6);
  assert.notDeepEqual(
    wardrobe(16, "stroller", 0, 0),
    wardrobe(16, "active", 0, 0),
  );
  assert.ok(
    wardrobe(30, "active", 0, 0, 6).warnings.some((x) => x.includes("UV")),
  );
  assert.ok(
    wardrobe(-15, "stroller", 30, 0).warnings.some((x) => x.includes("холод")),
  );
});
test("real weather client validates and encodes city requests, errors and optional UV", async () => {
  const original = global.fetch;
  try {
    let url = "";
    global.fetch = async (u) => {
      url = String(u);
      return new Response(
        JSON.stringify({
          results: [
            { name: "Москва", latitude: 55, longitude: 37 },
            { name: "Broken" },
          ],
        }),
      );
    };
    assert.equal((await findCities("Москва", "RU")).length, 1);
    assert.ok(url.includes("countryCode=RU"));
    await assert.rejects(findCities("a"));
    global.fetch = async () => new Response("", { status: 503 });
    await assert.rejects(
      fetchWeather({ name: "x", latitude: 0, longitude: 0 }),
      /503/,
    );
    global.fetch = async () =>
      new Response(JSON.stringify({ current: { temperature_2m: 10 } }));
    await assert.rejects(
      fetchWeather({ name: "x", latitude: 0, longitude: 0 }),
      /неполные/,
    );
    global.fetch = async () =>
      new Response(
        JSON.stringify({
          current: {
            temperature_2m: 10,
            apparent_temperature: 9,
            wind_speed_10m: 10,
            precipitation: 0,
            weather_code: 3,
            time: "2026-01-01T12:00",
          },
          daily: { uv_index_max: [4] },
        }),
      );
    assert.equal(
      (await fetchWeather({ name: "x", latitude: 0, longitude: 0 })).uv,
      4,
    );
  } finally {
    global.fetch = original;
  }
});

test("country and coordinate region defaults are suggestions with manual override", async () => {
  const { regionFor, geographicFoodRegion } = await import(
    "../src/services/menu"
  );
  assert.equal(regionFor("Россия", "Владивосток", ""), "ru-fareast");
  assert.equal(regionFor("США", "Бостон", ""), "us");
  assert.equal(regionFor("Япония", "Токио", ""), "asia");
  assert.equal(regionFor("Германия", "Берлин", ""), "europe");
  assert.equal(
    regionFor("Россия", "Владивосток", "mediterranean"),
    "mediterranean",
  );
  assert.equal(geographicFoodRegion(43.1, 131.9), "ru-fareast");
  assert.equal(geographicFoodRegion(35.6, 139.6), "asia");
});

test("weather timeout remains active with a caller signal and preserves external abort reasons", async (t) => {
  const originalFetch = global.fetch;
  t.mock.timers.enable({ apis: ["setTimeout"] });
  global.fetch = async (_input, options) =>
    new Promise<Response>((_resolve, reject) => {
      const signal = options?.signal;
      if (!signal) throw Error("Missing request cancellation");
      if (signal.aborted) reject(signal.reason);
      else
        signal.addEventListener("abort", () => reject(signal.reason), {
          once: true,
        });
    });
  try {
    const caller = new AbortController();
    const timed = findCities("Москва", "RU", caller.signal);
    const timedAssertion = assert.rejects(
      timed,
      (error: Error) => error.name === "TimeoutError",
    );
    t.mock.timers.tick(12000);
    await timedAssertion;
    assert.equal(caller.signal.aborted, false);

    const cancelled = new AbortController();
    const reason = new DOMException(
      "Пользователь отменил запрос",
      "AbortError",
    );
    const pending = findCities("Москва", "RU", cancelled.signal);
    const cancellationAssertion = assert.rejects(
      pending,
      (error: unknown) => error === reason,
    );
    cancelled.abort(reason);
    await cancellationAssertion;

    const alreadyCancelled = new AbortController();
    alreadyCancelled.abort(reason);
    await assert.rejects(
      findCities("Москва", "RU", alreadyCancelled.signal),
      (error: unknown) => error === reason,
    );
  } finally {
    global.fetch = originalFetch;
    t.mock.timers.reset();
  }
});
