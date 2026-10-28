import { test, expect } from "@playwright/test";

const go = async (page, hash) => {
  await page.evaluate((h) => (location.hash = h), hash);
  await expect(page.locator("h1").first()).toBeVisible();
};

async function setupProfile(page) {
  await go(page, "profile");
  await page.locator("[name=name]").fill("Женя");
  await page.locator("[name=birth]").fill("2025-11-21");
  await page.locator("[name=city]").fill("Владивосток");
  await page.locator("[name=introduced]").fill("Овсянка, Груша, Гречка, Индейка, Брокколи, Кабачок, Банан");
  await page.locator("[name=pantry]").fill("Овсянка, Груша, Гречка, Индейка, Брокколи");
  await page.getByRole("button", { name: "Сохранить профиль", exact: true }).click();
  await expect(page.locator("#toast")).toContainText("сохранён");
}

test.beforeEach(async ({ page }) => {
  await page.clock.install({ time: new Date("2026-10-28T12:00:00Z") });
  await page.goto("/");
});

test("V3 profile persists and Today becomes personalized", async ({ page }) => {
  await setupProfile(page);
  await page.reload();
  await expect(page.locator("[name=name]")).toHaveValue("Женя");
  await go(page, "home");
  await expect(page.getByRole("heading", { level: 1 }).first()).toContainText("Женя");
  await expect(page.locator(".today-v3-page")).toContainText(/11 мес|11 месяцев|Женя/);
  await expect(page.getByRole("link", { name: /Записать событие/ })).toBeVisible();
});

test("V3 growth keeps last weight when a later measurement contains only another metric", async ({ page }) => {
  await setupProfile(page);
  await go(page, "growth");
  await page.locator("[name=weight]").fill("10");
  await page.locator("[name=height]").fill("77");
  await page.getByRole("button", { name: "Сохранить измерение" }).click();
  await page.locator("[name=head]").fill("46");
  await page.getByRole("button", { name: "Сохранить измерение" }).click();
  await expect(page.locator(".stats")).toContainText("10 кг");
  await expect(page.locator(".stats")).toContainText("77 см");
  await expect(page.locator(".stats")).toContainText("46 см");
});

test("V3 sleep timer survives reload and creates a tracked sleep", async ({ page }) => {
  await setupProfile(page);
  const start = "2026-10-28T10:30";
  await page.evaluate((value) => localStorage.setItem("babyguide.sleep.active", value), start);
  await go(page, "sleep-log");
  await expect(page.getByRole("button", { name: /Женя проснулся/ })).toBeVisible();
  await expect(page.locator(".sleep-live-card")).toContainText("СЕЙЧАС СПИТ");
  await page.reload();
  await expect(page.getByRole("button", { name: /Женя проснулся/ })).toBeVisible();
  await page.getByRole("button", { name: /Женя проснулся/ }).click();
  await expect(page.locator(".sleep-history-list")).toContainText("10:30");
  await expect(page.locator(".sleep-week-chart")).toBeVisible();
  expect(await page.evaluate(() => localStorage.getItem("babyguide.sleep.active"))).toBeNull();
});

test("V3 menu builds seven days, replaces one meal and creates shopping list", async ({ page }) => {
  await setupProfile(page);
  await go(page, "menu-builder");
  const introducedOnly = page.locator(".menu-rule-grid label").filter({ hasText: "Только введённые" }).locator("input");
  if (await introducedOnly.isChecked()) await introducedOnly.uncheck();
  await page.getByRole("button", { name: "7 дней", exact: true }).click();
  await page.getByRole("button", { name: "Собрать меню на 7 дней", exact: true }).click();
  await expect(page.locator(".menu-day-v3")).toHaveCount(7);
  await expect(page.locator(".menu-meal-v3 h3").first()).toBeVisible();
  const firstTitle = await page.locator(".menu-meal-v3 h3").first().textContent();
  const replace = page.locator(".menu-meal-v3 button").filter({ hasText: "заменить" }).first();
  if (await replace.count()) {
    await replace.click();
    const after = await page.locator(".menu-meal-v3 h3").first().textContent();
    expect(after).not.toBe(firstTitle);
  }
  await page.getByRole("button", { name: /Список покупок/ }).click();
  await expect(page.locator(".shopping-v3")).toBeVisible();
  await expect(page.locator(".shopping-list-v3 label").first()).toBeVisible();
  await page.reload();
  await expect(page.locator(".menu-day-v3")).toHaveCount(7);
});

test("V3 first aid kit is age-filtered and inventory persists", async ({ page }) => {
  await setupProfile(page);
  await go(page, "first-aid-kit");
  await expect(page.locator(".kit-card").first()).toBeVisible();
  await expect(page.locator(".kit-avoid")).toContainText("не стратегия");
  const checkbox = page.locator(".kit-have input").first();
  await checkbox.check();
  await page.reload();
  await expect(page.locator(".kit-have input").first()).toBeChecked();
});

test("V3 guide is a visual methodical mini-book with practice and sources", async ({ page }) => {
  await go(page, "guide/potty-plan");
  await expect(page.locator(".guide-v3-hero-svg")).toBeVisible();
  await expect(page.locator(".guide-chapter-v3")).toHaveCount(7);
  await expect(page.locator(".guide-decision-v3")).toBeVisible();
  await expect(page.locator(".guide-practice-v3")).toBeVisible();
  await expect(page.locator(".guide-sources-v3")).toBeVisible();
  const practice = page.locator(".guide-practice-v3 input").first();
  await practice.check();
  await page.reload();
  await expect(page.locator(".guide-practice-v3 input").first()).toBeChecked();
});

test("V3 core screens have no horizontal overflow at iPhone widths", async ({ page }) => {
  for (const width of [320, 390]) {
    await page.setViewportSize({ width, height: 844 });
    for (const route of ["home", "nutrition", "menu-builder", "sleep-log", "first-aid-kit", "manuals", "more", "guide/potty-plan"]) {
      await go(page, route);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${route} at ${width}`).toBe(true);
    }
  }
});
