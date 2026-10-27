import { test, expect } from "@playwright/test";
import { readFile } from "node:fs/promises";
import { games } from "../../src/data/games";
import { recipes } from "../../src/data/nutrition";
import { guides } from "../../src/data/guides";
import { rhymes } from "../../src/data/rhymes";
import { stories } from "../../src/data/stories";
import { articles } from "../../src/content.js";
import { healthArticles } from "../../src/data/health";
const go = async (page, hash) => {
  await page.evaluate((h) => (location.hash = h), hash);
  await expect(page.locator("h1").first()).toBeVisible();
  await expect(page.locator("body")).not.toContainText("Something went wrong");
};
async function profile(page) {
  await go(page, "profile");
  await page.locator("[name=name]").fill("Алиса");
  await page.locator("[name=birth]").fill("2025-10-01");
  await page
    .getByRole("button", { name: "Сохранить профиль", exact: true })
    .click();
  await expect(page.locator("#toast")).toContainText("сохранён");
}
const fixture = {
  current: {
    temperature_2m: 8,
    apparent_temperature: 5,
    precipitation: 1,
    weather_code: 61,
    wind_speed_10m: 25,
    relative_humidity_2m: 70,
    time: "2026-10-28T12:00",
  },
  daily: { uv_index_max: [4] },
};
test.beforeEach(async ({ page }) => {
  await page.clock.install({ time: new Date("2026-10-28T12:00:00Z") });
  await page.goto("/");
});
test("all parent routes and every content entry render without JS errors or mobile overflow", async ({
  page,
}) => {
  test.setTimeout(120000);
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  const routes = [
    "home",
    "diary",
    "recommendations",
    "more",
    "profile",
    "development",
    "growth",
    "sleep-log",
    "temperature",
    "medicines",
    "weather",
    "nutrition",
    "recipes",
    "menu",
    "menu-builder",
    "safe-food",
    "sleep",
    "speech",
    "potty",
    "health",
    "guides",
    "regressions",
    "games",
    "rhymes",
    "stories",
    "cards",
    "words",
    "repeat",
    "sources",
    "favorites",
    "reminders",
    ...games.map((g) => "game/" + g.id),
    ...recipes.map((r) => "recipe/" + r.id),
    ...guides.map((g) => "guide/" + g.id),
    ...rhymes.map((r) => "rhyme/" + r.id),
    ...stories.map((s) => "story/" + s.id),
    ...articles.map((a) => "article/" + a.id),
    ...healthArticles.map((a) => "article/" + a.id),
  ];
  for (const route of routes) {
    await go(page, route);
    await expect(page.locator("h1").first()).not.toHaveText(
      "Такой страницы нет",
    );
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
      route,
    ).toBeTruthy();
  }
  await go(page, "development");
  for (let m = 0; m <= 36; m++) {
    await page.locator("#month").selectOption(String(m));
    await expect(page.locator(".development-card")).toContainText(
      m + " МЕСЯЦЕВ",
    );
    await expect(page.locator(".domain-card")).toHaveCount(8);
  }
  expect(errors).toEqual([]);
});
test("profile and all dietary fields persist; homepage contains real metrics and exact age", async ({
  page,
}) => {
  await profile(page);
  await page.locator("[name=country]").fill("Россия");
  await page.locator("[name=city]").fill("Владивосток");
  await page.locator("[name=region]").selectOption("ru-fareast");
  await page.locator("[name=allergies]").fill("молоко");
  await page.locator("[name=excluded]").fill("Яйцо");
  await page.locator("[name=introduced]").fill("Овсянка, Груша");
  await page.locator("[name=pantry]").fill("Овсянка, Груша");
  await page
    .getByRole("button", { name: "Сохранить профиль", exact: true })
    .click();
  await page.reload();
  await expect(page.locator("[name=allergies]")).toHaveValue("молоко");
  await expect(page.locator("[name=city]")).toHaveValue("Владивосток");
  await go(page, "growth");
  await page.locator("[name=weight]").fill("10.2");
  await page.locator("[name=height]").fill("78");
  await page.locator("[name=head]").fill("46");
  await page.getByRole("button", { name: "Сохранить измерение" }).click();
  await expect(page.locator(".growth-chart circle")).toHaveCount(1);
  await page.getByRole("button", { name: "Голова", exact: true }).click();
  await expect(page.locator(".growth-chart")).toHaveAttribute(
    "aria-label",
    /окружности/,
  );
  await go(page, "home");
  await expect(page.locator("h1")).toContainText("Алиса");
  await expect(page.locator(".dashboard-metrics")).toContainText("10.2 кг");
  await expect(page.locator(".greeting")).toContainText("1 г.");
  await expect(page.locator(".greeting")).toContainText("27 дн.");
});
test("unified diary, formula feeding, filters, temperature chart and deletion", async ({
  page,
}) => {
  await profile(page);
  await go(page, "diary");
  await page.locator("textarea").fill("Первый шаг ♡");
  await page.getByRole("button", { name: "Сохранить запись" }).click();
  await page.locator("[name=kind]").selectOption("Смесь");
  await page.locator("[name=amount]").fill("120");
  await page.locator("textarea").fill("По инструкции");
  await page.getByRole("button", { name: "Сохранить запись" }).click();
  await go(page, "temperature");
  await page.locator("[name=temperature]").fill("38.2");
  await page.locator("[name=observation]").fill("Пьёт воду");
  await page.getByRole("button", { name: "Сохранить наблюдение" }).click();
  await expect(page.locator(".growth-chart circle")).toHaveCount(1);
  await page.reload();
  await expect(page.locator(".entry")).toContainText("38.2");
  await go(page, "diary");
  await expect(page.locator(".entry")).toHaveCount(3);
  await page.getByLabel("Фильтр событий").selectOption("Смесь");
  await expect(page.locator(".entry")).toHaveCount(1);
  await expect(page.locator(".entry")).toContainText("120 мл");
  await page.getByLabel("Фильтр событий").selectOption("Момент");
  await page
    .getByRole("button", { name: "Удалить запись", exact: true })
    .click();
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Удалить", exact: true })
    .click();
  await expect(page.locator(".entry")).toHaveCount(0);
});
test("sleep through midnight is clipped to selected day and overlap rejected", async ({
  page,
}) => {
  await go(page, "sleep-log");
  await page.locator("[name=start]").fill("2026-10-27T22:00");
  await page.locator("[name=end]").fill("2026-10-28T06:30");
  await page.getByRole("button", { name: "Сохранить сон" }).click();
  await expect(page.locator(".entry")).toContainText("8 ч 30 мин");
  await expect(page.locator(".chart-card h2")).toContainText("6 ч 30 мин");
  await page.locator("[name=start]").fill("2026-10-28T00:00");
  await page.locator("[name=end]").fill("2026-10-28T07:00");
  await page.getByRole("button", { name: "Сохранить сон" }).click();
  await expect(page.getByRole("alert")).toContainText("пересекается");
  await page.reload();
  await expect(page.locator(".sleep-segment")).toHaveCount(1);
});
test("global search, full guides and favorite recipe/story/game/rhyme persist", async ({
  page,
}) => {
  await go(page, "more");
  await page.locator("#library-q").fill("рвота");
  await page.getByRole("button", { name: "Найти", exact: true }).click();
  await expect(page.locator(".article-card")).not.toHaveCount(0);
  for (const path of [
    "recipe/oats-pear",
    "story/story-dark",
    "game/game-0-0",
    "rhyme/rhyme-0",
    "guide/potty-plan",
  ]) {
    await go(page, path);
    await page
      .getByRole("button", { name: "В избранное", exact: false })
      .click();
  }
  await go(page, "guide/potty-plan");
  await expect(page.locator(".guide-reading section")).toHaveCount(13);
  await page.getByRole("checkbox").first().check();
  await page.reload();
  await expect(page.getByRole("checkbox").first()).toBeChecked();
  await go(page, "favorites");
  await expect(page.locator(".article-card")).toHaveCount(5);
});
test("14 menu days open actual recipes; filters pantry/allergy and replaces only one slot", async ({
  page,
}) => {
  await profile(page);
  await page.locator("[name=allergies]").fill("молоко");
  await page.locator("[name=region]").selectOption("ru-fareast");
  await page
    .getByRole("button", { name: "Сохранить профиль", exact: true })
    .click();
  await go(page, "menu");
  await page.locator(".day").nth(13).click();
  await expect(page.locator(".menu-card")).toContainText("День 14");
  await page.locator(".recipe-meal").first().click();
  await expect(page.locator(".reading")).toContainText("Продукты и количество");
  await go(page, "menu-builder");
  await page.getByRole("button", { name: "Собрать меню", exact: true }).click();
  await expect(page.locator("[data-slot]")).toHaveCount(4);
  const before = await page.locator("[data-slot] h2").allTextContents();
  await page
    .locator("[data-slot=breakfast]")
    .getByRole("button", { name: "Другое блюдо", exact: true })
    .click();
  const after = await page.locator("[data-slot] h2").allTextContents();
  expect(after[0]).not.toBe(before[0]);
  expect(after.slice(1)).toEqual(before.slice(1));
  await expect(page.locator("[data-slot=snack]")).not.toContainText("Йогурт");
  await expect(page.locator("[data-slot=snack]")).not.toContainText("Творог");
  await page.getByRole("button", { name: "Овсянка", exact: true }).click();
  await page.getByRole("button", { name: "Груша", exact: true }).click();
  await page.getByLabel("Строго из продуктов дома").check();
  await page.getByRole("button", { name: "Собрать меню", exact: true }).click();
  await expect(page.locator("[data-slot=breakfast] h2")).toContainText(
    "Овсянка с грушей",
  );
  await page.reload();
  await expect(page.locator("[data-slot=breakfast] h2")).toContainText(
    "Овсянка с грушей",
  );
});
test("medicine calculator refuses missing age and shows verified formula with label concentration", async ({
  page,
}) => {
  await go(page, "medicines");
  await page.locator("[name=weight]").fill("10");
  await page.locator("[name=strength]").fill("120");
  await page.locator("[name=volume]").fill("5");
  await page.getByRole("checkbox").check();
  await page.getByRole("button", { name: "Рассчитать объём" }).click();
  await expect(page.getByRole("alert")).toContainText("6–36");
  await profile(page);
  await go(page, "medicines");
  await page.locator("[name=weight]").fill("10");
  await page.locator("[name=strength]").fill("120");
  await page.locator("[name=volume]").fill("5");
  await page.getByRole("checkbox").check();
  await page.getByRole("button", { name: "Рассчитать объём" }).click();
  await expect(page.locator(".result-card")).toContainText("6.25 мл");
  await expect(page.locator(".result-card")).toContainText("максимум 4");
});
test("weather manual city works after denied geolocation; all clothing layers and UV shown", async ({
  page,
}) => {
  await page.route("**/geocoding-api.open-meteo.com/**", (r) =>
    r.fulfill({
      json: {
        results: [
          {
            name: "Владивосток",
            country: "Россия",
            country_code: "RU",
            latitude: 43.11,
            longitude: 131.88,
          },
        ],
      },
    }),
  );
  await page.route("**/api.open-meteo.com/**", (r) =>
    r.fulfill({ json: fixture }),
  );
  await go(page, "weather");
  await page.evaluate(
    () => (navigator.geolocation.getCurrentPosition = (s, e) => e({ code: 1 })),
  );
  await page
    .getByRole("button", { name: "Определить моё местоположение" })
    .click();
  await expect(page.getByRole("alert")).toContainText("запрещён");
  await page.locator("#city-q").fill("Владивосток");
  await page.getByRole("button", { name: "Найти", exact: true }).click();
  await page.locator(".city-result").click();
  await expect(page.locator(".weather-card")).toContainText("8°");
  await expect(page.locator(".weather-card")).toContainText("70%");
  await expect(page.locator(".weather-card")).toContainText("UV max за день 4");
  await expect(page.locator(".wardrobe-layer")).toHaveCount(6);
  await page
    .getByRole("button", { name: "Активная прогулка", exact: true })
    .click();
  await expect(page.locator(".outfit-card")).toContainText("активной игре");
  await page.reload();
  await expect(page.locator(".weather-card")).toContainText("Владивосток");
});
test("weather geolocation success, empty search, server failure, incomplete response and offline", async ({
  page,
  context,
}) => {
  await context.grantPermissions(["geolocation"]);
  await context.setGeolocation({ latitude: 43, longitude: 131 });
  await page.route("**/api.open-meteo.com/**", (r) =>
    r.fulfill({ json: fixture }),
  );
  await go(page, "weather");
  await page
    .getByRole("button", { name: "Определить моё местоположение" })
    .click();
  await expect(page.locator(".weather-card")).toContainText(
    "Моё местоположение",
  );
  await page.route("**/geocoding-api.open-meteo.com/**", (r) =>
    r.fulfill({ json: { results: [] } }),
  );
  await page.locator("#city-q").fill("Негород");
  await page.getByRole("button", { name: "Найти", exact: true }).click();
  await expect(page.getByRole("alert")).toContainText("Город не найден");
  await page.route("**/api.open-meteo.com/**", (r) =>
    r.fulfill({ status: 503, body: "Unavailable" }),
  );
  await page.getByRole("button", { name: "Обновить", exact: true }).click();
  await expect(page.locator(".danger").last()).toContainText("503");
  await page.route("**/api.open-meteo.com/**", (r) =>
    r.fulfill({ json: { current: { temperature_2m: 10 } } }),
  );
  await page
    .getByRole("button", { name: "Попробовать снова", exact: true })
    .click();
  await expect(page.locator(".danger").last()).toContainText("неполные");
  await context.setOffline(true);
  await page.unroute("**/api.open-meteo.com/**");
  await page
    .getByRole("button", { name: "Попробовать снова", exact: true })
    .click();
  await expect(page.locator(".danger").last()).toContainText("Нет сети");
  await context.setOffline(false);
});
test("child mode survives back/reload and blocks parents until adult gate", async ({
  page,
}) => {
  await go(page, "child");
  await expect(page.locator(".child-menu button")).toHaveCount(6);
  await expect(page.locator(".bottom-nav")).toHaveCount(0);
  await expect(page.locator(".child-shell a")).toHaveCount(0);
  await go(page, "health");
  await expect(page.locator(".child-menu")).toBeVisible();
  await page.reload();
  await expect(page.locator(".child-menu")).toBeVisible();
  await page.getByRole("button", { name: "Для взрослого" }).click();
  await page.getByLabel("Ответ на пример").fill("0");
  await page.getByRole("button", { name: "Выйти к маме" }).click();
  await expect(page.getByRole("dialog")).toContainText("не совпал");
  const label = await page.getByRole("dialog").locator("label").textContent();
  const nums = label.match(/(\d+)\s*\+\s*(\d+)/);
  await page
    .getByLabel("Ответ на пример")
    .fill(String(Number(nums[1]) + Number(nums[2])));
  await page.getByRole("button", { name: "Выйти к маме" }).click();
  await expect(page.locator(".bottom-nav")).toBeVisible();
  await expect(page.locator("h1")).toContainText("Растём вместе");
});
test("child swipe cards, visual quiz, bubbles, box and stories have working interactions", async ({
  page,
}) => {
  await go(page, "child/cards");
  const before = await page.locator(".learning-card h1").textContent();
  await page.getByRole("button", { name: "Следующая карточка" }).click();
  expect(await page.locator(".learning-card h1").textContent()).not.toBe(
    before,
  );
  await go(page, "child/quiz");
  const target = (await page.locator("h1").textContent())
    .replace("Где ", "")
    .replace("?", "");
  await page
    .getByRole("button", { name: new RegExp("^" + target + "$", "i") })
    .click();
  await expect(page.locator(".child-feedback")).toContainText("Получилось");
  await page.getByRole("button", { name: "Ещё", exact: false }).click();
  await go(page, "child/actions");
  await page.getByRole("button", { name: "Пузыри" }).click();
  await page
    .getByRole("button", { name: "Лопнуть пузырь 1", exact: true })
    .click();
  await expect(page.locator(".popped")).toHaveCount(1);
  await page.getByRole("button", { name: "Новые пузыри" }).click();
  await expect(page.locator(".popped")).toHaveCount(0);
  await page.getByRole("button", { name: "Коробочка" }).click();
  await page.getByRole("button", { name: "Открыть коробочку" }).click();
  await expect(page.locator(".child-feedback")).toContainText("Мишка здесь");
  await go(page, "child/stories");
  await page.getByRole("button", { name: "Следующая страница" }).click();
  await expect(page.locator(".child-controls")).toContainText("2 / 5");
});
test("microphone is explicit, records real fake-device audio, stops tracks, saves/restores clip locally", async ({
  page,
  context,
}) => {
  await context.grantPermissions(["microphone"]);
  await page.addInitScript(() => {
    const original = navigator.mediaDevices.getUserMedia.bind(
      navigator.mediaDevices,
    );
    window.__streams = [];
    navigator.mediaDevices.getUserMedia = async (c) => {
      const s = await original(c);
      window.__streams.push(s);
      return s;
    };
  });
  await page.reload();
  await go(page, "words");
  expect(await page.evaluate(() => window.__streams.length)).toBe(0);
  await page.locator("[name=word]").fill("Мама");
  await page
    .getByRole("button", { name: "Записать голос", exact: false })
    .click();
  await expect(page.getByRole("status").first()).toContainText("Слушаю");
  await page.waitForTimeout(900);
  await page.getByRole("button", { name: "Остановить запись" }).click();
  await expect(page.locator(".recorder-box audio")).toBeVisible();
  expect(
    await page.evaluate(() =>
      window.__streams
        .flatMap((s) => s.getTracks())
        .every((t) => t.readyState === "ended"),
    ),
  ).toBe(true);
  await page
    .getByRole("button", { name: "Сохранить слово", exact: true })
    .click();
  // IndexedDB is asynchronous: reload only once saving is visibly complete.
  await expect(page.locator(".entry")).toContainText("Мама");
  await page.reload();
  await expect(page.locator(".entry")).toContainText("Мама");
  await page.getByRole("button", { name: "Открыть аудио" }).click();
  const audio = page.locator(".entry audio");
  await expect(audio).toBeVisible();
  await audio.evaluate((a) => a.play());
  await expect
    .poll(() => audio.evaluate((a) => a.currentTime))
    .toBeGreaterThan(0);
  await go(page, "profile");
  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Экспорт JSON с аудио" }).click();
  const download = await downloadPromise;
  const backup = JSON.parse(await readFile(await download.path(), "utf8"));
  expect(backup.audio).toHaveLength(1);
  expect(backup.audio[0].url).toMatch(/^data:audio\//);
});
test("mic denial, absent API, transient repeat cleanup and navigation during recording", async ({
  page,
  context,
}) => {
  await go(page, "repeat");
  await page.evaluate(() => {
    navigator.mediaDevices.getUserMedia = async () => {
      throw new DOMException("denied", "NotAllowedError");
    };
  });
  await page
    .getByRole("button", { name: "Разрешить микрофон и сказать" })
    .click();
  await expect(page.getByRole("alert")).toContainText("запрещён");
  await page.reload();
  await context.grantPermissions(["microphone"]);
  await go(page, "repeat");
  await page
    .getByRole("button", { name: "Разрешить микрофон и сказать" })
    .click();
  await expect(page.locator(".repeat-screen h2")).toContainText("Говори");
  await page.waitForTimeout(600);
  await page.getByRole("button", { name: "Закончить" }).click();
  await expect
    .poll(() => page.locator(".repeat-screen h2").textContent())
    .toMatch(/Повторяю|Повторю/);
  await expect
    .poll(() => page.locator(".repeat-screen").textContent())
    .not.toContain("Остановить и удалить");
  await page.evaluate(() => {
    window.MediaRecorder = undefined;
  });
  await page
    .getByRole("button", { name: "Разрешить микрофон и сказать" })
    .click();
  await expect(page.getByRole("alert")).toContainText("не поддерживаются");
});
test.describe("offline app", () => {
  test.use({ serviceWorkers: "allow" });
  test("PWA caches all modules, manifest and icons; offline reload and diary work", async ({
    page,
    context,
  }) => {
    await page.evaluate(() => navigator.serviceWorker.ready);
    await page.reload();
    await expect
      .poll(() => page.evaluate(() => !!navigator.serviceWorker.controller))
      .toBe(true);
    const manifest = await (
      await page.request.get("/manifest.webmanifest")
    ).json();
    expect(manifest.display).toBe("standalone");
    for (const icon of manifest.icons) {
      const r = await page.request.get(icon.src);
      expect(r.ok()).toBe(true);
      expect(r.headers()["content-type"]).toContain("image/png");
    }
    await context.setOffline(true);
    await page.reload();
    await expect(page.locator("h1")).toContainText("Растём вместе");
    for (const route of [
      "games",
      "recipes",
      "guide/potty-plan",
      "stories",
      "development/36",
      "cards",
    ]) {
      await go(page, route);
      await expect(page.locator("h1")).not.toHaveText("Такой страницы нет");
    }
    await go(page, "diary");
    await page.locator("textarea").fill("Офлайн-заметка");
    await page.getByRole("button", { name: "Сохранить запись" }).click();
    await page.reload();
    await expect(page.locator(".entry")).toContainText("Офлайн-заметка");
    await context.setOffline(false);
  });
});
test("mobile 320px, desktop, malformed routes, bad import and reminder persistence", async ({
  page,
}) => {
  for (const width of [320, 390, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    for (const route of [
      "home",
      "profile",
      "diary",
      "growth",
      "temperature",
      "menu-builder",
      "menu",
      "weather",
      "development",
      "cards",
    ]) {
      await go(page, route);
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
        width + " " + route,
      ).toBeTruthy();
    }
    await go(page, "home");
    await page.screenshot({
      path: `test-results/home-${width}.png`,
      fullPage: true,
    });
  }
  for (const hash of ["constructor", "__proto__", "%E0%A4%A"]) {
    await go(page, hash);
    await expect(page.locator("h1")).toContainText("Такой страницы нет");
  }
  await go(page, "reminders");
  await page.locator("[name=text]").fill("Вопрос педиатру");
  await page.getByRole("button", { name: "Добавить напоминание" }).click();
  await page.reload();
  await expect(page.locator(".check-row")).toContainText("Вопрос педиатру");
  await go(page, "profile");
  await page.locator("#import-data").setInputFiles({
    name: "bad.json",
    mimeType: "application/json",
    buffer: Buffer.from('{"version":2,"events":[{}]}'),
  });
  await expect(page.locator("#toast")).toContainText("повреждён");
  await page.reload();
  await go(page, "reminders");
  await expect(page.locator(".check-row")).toContainText("Вопрос педиатру");
});

test("recording auto-stops after a spoken pause and navigation releases microphone", async ({
  page,
  context,
}) => {
  await context.grantPermissions(["microphone"]);
  await page.addInitScript(() => {
    window.__streams = [];
    const original = navigator.mediaDevices.getUserMedia.bind(
      navigator.mediaDevices,
    );
    navigator.mediaDevices.getUserMedia = async (c) => {
      const s = await original(c);
      window.__streams.push(s);
      return s;
    };
    let count = 0;
    AnalyserNode.prototype.getByteTimeDomainData = function (array) {
      array.fill(++count < 6 ? 160 : 128);
    };
  });
  await page.reload();
  await go(page, "words");
  await page.getByRole("button", { name: "Записать голос" }).click();
  await expect(page.locator(".recorder-box")).toContainText("Слушаю");
  await expect(page.locator(".recorder-box audio")).toBeVisible({
    timeout: 10000,
  });
  expect(
    await page.evaluate(() =>
      window.__streams
        .flatMap((s) => s.getTracks())
        .every((t) => t.readyState === "ended"),
    ),
  ).toBe(true);
  await page.getByRole("button", { name: "Записать голос" }).click();
  await expect(page.locator(".recorder-box")).toContainText("Слушаю");
  await go(page, "home");
  await expect
    .poll(() =>
      page.evaluate(() =>
        window.__streams
          .flatMap((s) => s.getTracks())
          .every((t) => t.readyState === "ended"),
      ),
    )
    .toBe(true);
});

test("local audio backup imports, clear removes recordings and corrupt storage is recoverable", async ({
  page,
  context,
}) => {
  await context.grantPermissions(["microphone"]);
  await go(page, "words");
  await page.locator("[name=word]").fill("Папа");
  await page.getByRole("button", { name: "Записать голос" }).click();
  await expect(page.locator(".recorder-box")).toContainText("Слушаю");
  await page.waitForTimeout(700);
  await page.getByRole("button", { name: "Остановить запись" }).click();
  await expect(page.locator(".recorder-box audio")).toBeVisible();
  await page
    .getByRole("button", { name: "Сохранить слово", exact: true })
    .click();
  await go(page, "profile");
  const promise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Экспорт JSON с аудио" }).click();
  const download = await promise,
    buffer = await readFile(await download.path());
  const backup = JSON.parse(buffer.toString());
  expect(backup.audio).toHaveLength(1);
  await page.getByRole("button", { name: "Удалить все мои данные" }).click();
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Удалить", exact: true })
    .click();
  await expect(page.locator("#toast")).toContainText("Данные удалены");
  await go(page, "words");
  await expect(page.locator(".entry")).toHaveCount(0);
  await go(page, "profile");
  await page.locator("#import-data").setInputFiles({
    name: "restore.json",
    mimeType: "application/json",
    buffer,
  });
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Заменить", exact: true })
    .click();
  await expect(page.locator("#toast")).toContainText("восстановлены");
  await go(page, "words");
  await page.getByRole("button", { name: "Открыть аудио" }).click();
  const audio = page.locator(".entry audio");
  await audio.evaluate((a) => a.play());
  await expect
    .poll(() => audio.evaluate((a) => a.currentTime))
    .toBeGreaterThan(0);
  await page.evaluate(() => localStorage.setItem("babyguide.v2", '{"broken":'));
  await page.reload();
  await expect(page.locator(".storage-warning")).toContainText(
    "Не удалось прочитать",
  );
  await go(page, "profile");
  await page.locator("#import-data").setInputFiles({
    name: "restore.json",
    mimeType: "application/json",
    buffer,
  });
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Заменить", exact: true })
    .click();
  await expect(page.locator(".storage-warning")).toHaveCount(0);
  const second = page.waitForEvent("download");
  await page.getByRole("button", { name: "Экспорт JSON с аудио" }).click();
  const d = await second;
  expect(JSON.parse(await readFile(await d.path(), "utf8")).data.version).toBe(
    2,
  );
});

test("child narrow layouts and swipe; rejected localStorage writes never claim success", async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 800 });
  for (const route of [
    "child",
    "child/cards",
    "child/quiz",
    "child/actions",
    "child/repeat",
    "child/rhymes",
    "child/stories",
  ]) {
    await go(page, route);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
      route,
    ).toBe(true);
  }
  await go(page, "child/cards");
  const first = await page.locator(".learning-card h1").textContent();
  await page
    .locator(".learning-card")
    .dispatchEvent("pointerdown", { clientX: 280, clientY: 250 });
  await page
    .locator(".learning-card")
    .dispatchEvent("pointerup", { clientX: 30, clientY: 250 });
  expect(await page.locator(".learning-card h1").textContent()).not.toBe(first);
  await page.getByRole("button", { name: "Для взрослого" }).click();
  const label = await page.getByRole("dialog").locator("label").textContent();
  const numbers = label.match(/(\d+)\s*\+\s*(\d+)/);
  await page
    .getByLabel("Ответ на пример")
    .fill(String(Number(numbers[1]) + Number(numbers[2])));
  await page.getByRole("button", { name: "Выйти к маме" }).click();
  await page.reload();
  await go(page, "profile");
  await page.evaluate(
    () =>
      (Storage.prototype.setItem = function () {
        throw new DOMException("full", "QuotaExceededError");
      }),
  );
  await page.locator("[name=name]").fill("Несохранённое");
  await page
    .getByRole("button", { name: "Сохранить профиль", exact: true })
    .click();
  await expect(page.locator(".storage-warning")).toContainText(
    "Не удалось сохранить",
  );
  await expect(page.locator("#toast")).not.toContainText("Профиль сохранён");
});

test("large system-sized text keeps parent and child layouts usable", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.evaluate(() => (document.documentElement.style.fontSize = "24px"));
  for (const route of [
    "home",
    "profile",
    "growth",
    "menu-builder",
    "child",
    "child/cards",
    "child/repeat",
  ]) {
    await go(page, route);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
      route,
    ).toBe(true);
  }
  await page.screenshot({ path: "test-results/large-text-child.png" });
});

test("automatic profile region survives a second save and partial measurement preserves last weight", async ({
  page,
}) => {
  await profile(page);
  await page.locator("[name=country]").fill("США");
  await page.locator("[name=city]").fill("Бостон");
  await page
    .getByRole("button", { name: "Сохранить профиль", exact: true })
    .click();
  await expect(page.locator("[name=region]")).toHaveValue("us");
  await page
    .getByRole("button", { name: "Сохранить профиль", exact: true })
    .click();
  await page.reload();
  await expect(page.locator("[name=region]")).toHaveValue("us");
  await go(page, "growth");
  await page.locator("[name=weight]").fill("10");
  await page.locator("[name=height]").fill("77");
  await page.getByRole("button", { name: "Сохранить измерение" }).click();
  await page.locator("[name=head]").fill("46");
  await page.getByRole("button", { name: "Сохранить измерение" }).click();
  await go(page, "home");
  await expect(page.locator(".dashboard-metrics")).toContainText("10 кг");
  await expect(page.locator(".dashboard-metrics")).toContainText("77 см");
});

test("manual city lookup remains available when geolocation API is absent", async ({
  page,
}) => {
  await page.route("**/geocoding-api.open-meteo.com/**", (r) =>
    r.fulfill({
      json: {
        results: [
          {
            name: "Казань",
            country: "Россия",
            country_code: "RU",
            latitude: 55.79,
            longitude: 49.12,
          },
        ],
      },
    }),
  );
  await page.route("**/api.open-meteo.com/**", (r) =>
    r.fulfill({ json: fixture }),
  );
  await go(page, "weather");
  await page.evaluate(() =>
    Object.defineProperty(navigator, "geolocation", {
      configurable: true,
      value: undefined,
    }),
  );
  await page
    .getByRole("button", { name: "Определить моё местоположение" })
    .click();
  await expect(page.getByRole("alert")).toContainText(
    "Геолокация не поддерживается",
  );
  await page.locator("#city-q").fill("Казань");
  await page.getByRole("button", { name: "Найти", exact: true }).click();
  await page.locator(".city-result").click();
  await expect(page.locator(".weather-card")).toContainText("Казань");
  await expect(page.locator(".weather-card")).toContainText("8°");
  await expect(page.locator(".wardrobe-layer")).toHaveCount(6);
});

test("choosing a new home city ends the temporary trip and keeps forecast identity consistent", async ({
  page,
}) => {
  const cities = {
    Москва: {
      name: "Москва",
      country: "Россия",
      country_code: "RU",
      latitude: 55.75,
      longitude: 37.61,
    },
    Владивосток: {
      name: "Владивосток",
      country: "Россия",
      country_code: "RU",
      latitude: 43.11,
      longitude: 131.88,
    },
    Казань: {
      name: "Казань",
      country: "Россия",
      country_code: "RU",
      latitude: 55.79,
      longitude: 49.12,
    },
  };
  await page.route("**/geocoding-api.open-meteo.com/**", (r) => {
    const city = cities[new URL(r.request().url()).searchParams.get("name")];
    return r.fulfill({ json: { results: city ? [city] : [] } });
  });
  await page.route("**/api.open-meteo.com/**", (r) => {
    const latitude = Number(
      new URL(r.request().url()).searchParams.get("latitude"),
    );
    const temperature = latitude === 55.75 ? 10 : latitude === 43.11 ? 20 : 30;
    return r.fulfill({
      json: {
        ...fixture,
        current: { ...fixture.current, temperature_2m: temperature },
      },
    });
  });
  await go(page, "weather");
  async function selectCity(name) {
    await page.locator("#city-q").fill(name);
    await page.getByRole("button", { name: "Найти", exact: true }).click();
    await page.locator(".city-result").click();
    await expect(page.locator(".weather-card")).toContainText(name);
  }
  await selectCity("Москва");
  await page.getByLabel("Выбираю временный город поездки").check();
  await selectCity("Владивосток");
  await expect(page.locator(".weather-card")).toContainText("ПОЕЗДКА");
  await page.getByLabel("Выбираю временный город поездки").uncheck();
  await selectCity("Казань");
  await expect(page.locator(".weather-card")).not.toContainText("ПОЕЗДКА");
  const saved = await page.evaluate(() =>
    JSON.parse(localStorage.getItem("babyguide.v2")),
  );
  expect(saved.travelCity).toBeNull();
  expect(saved.city.name).toContain("Казань");
  expect(saved.profile.city).toContain("Казань");
  await page.reload();
  await expect(page.locator(".weather-card")).toContainText("Казань");
  await expect(page.locator(".weather-card")).toContainText("30°");
  await expect(page.locator(".weather-card")).not.toContainText("ПОЕЗДКА");
});
