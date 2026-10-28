import { test, expect } from "@playwright/test";

const go = async (page, hash) => {
  await page.evaluate((value) => (location.hash = value), hash);
  await expect(page.locator("h1").first()).toBeVisible();
};

test.beforeEach(async ({ page }) => {
  await page.goto("/");
});

test("recipe library and recipe detail always expose meaningful visuals", async ({ page }) => {
  await go(page, "recipes");
  await expect(page.locator(".recipe-card-v3").first()).toBeVisible();
  await expect(page.locator(".recipe-card-v3 .recipe-hero-art").first()).toBeVisible();
  const href = await page.locator(".recipe-card-v3").first().getAttribute("href");
  expect(href).toMatch(/^#recipe\//);
  await go(page, href.slice(1));
  await expect(page.locator(".recipe-detail-v3 > .recipe-hero-art")).toBeVisible();
  await expect(page.locator(".ingredient-visual-list article").first()).toBeVisible();
  await expect(page.locator(".recipe-steps-visual article").first()).toBeVisible();
  await expect(page.locator(".texture-visual")).toBeVisible();
});

test("generated and fixed menus display illustrated meals", async ({ page }) => {
  await go(page, "profile");
  await page.locator("[name=name]").fill("Женя");
  await page.locator("[name=birth]").fill("2025-11-21");
  await page.getByRole("button", { name: "Сохранить профиль", exact: true }).click();

  await go(page, "menu-builder");
  const introducedOnly = page.locator(".menu-rule-grid label").filter({ hasText: "Только введённые" }).locator("input");
  if (await introducedOnly.isChecked()) await introducedOnly.uncheck();
  await page.getByRole("button", { name: /^3\s*дня$/ }).click();
  await page.getByRole("button", { name: /Собрать меню на 3 дня/ }).click();
  await expect(page.locator(".menu-day-v3")).toHaveCount(3);
  await expect(page.locator(".visual-meal-v3 .recipe-hero-art").first()).toBeVisible();

  await go(page, "menu");
  await expect(page.locator(".fortnight-meal-v3 .recipe-hero-art").first()).toBeVisible();
});

test("safe food uses diagrams instead of emoji-only instructions", async ({ page }) => {
  await go(page, "safe-food");
  await expect(page.locator(".safe-texture-diagram")).toBeVisible();
  await expect(page.locator(".safe-example-grid .ingredient-glyph").first()).toBeVisible();
  await expect(page.locator(".gagging-comparison svg")).toHaveCount(2);
  await expect(page.locator(".safe-check-flow")).toBeVisible();
});

test("rhymes and stories have illustrations plus natural-voice controls", async ({ page }) => {
  await go(page, "rhymes");
  await expect(page.locator(".reading-card-v3 .reading-scene-v3").first()).toBeVisible();
  await page.locator(".reading-card-v3").first().click();
  await expect(page.locator(".reading-detail-v3 > .reading-scene-v3")).toBeVisible();
  await expect(page.locator(".natural-speech-button")).toBeVisible();
  await expect(page.locator(".movement-v3")).toBeVisible();

  await go(page, "stories");
  await expect(page.locator(".reading-card-v3 .reading-scene-v3").first()).toBeVisible();
  await page.locator(".reading-card-v3").first().click();
  await expect(page.locator(".reading-detail-v3 > .reading-scene-v3")).toBeVisible();
  await expect(page.locator(".natural-speech-button")).toBeVisible();
  await expect(page.locator(".story-progress-v3")).toBeVisible();
});

test("natural voice is primary and system voice is explicitly fallback", async ({ page }) => {
  await go(page, "voice-settings");
  await expect(page.locator(".natural-voice-card")).toBeVisible();
  await expect(page.locator(".natural-voice-card")).toContainText(/нейронн/i);
  await expect(page.locator("details.voice-fallback-settings")).toContainText("Запасной системный голос");
});

test("visual media screens do not overflow iPhone widths", async ({ page }) => {
  for (const width of [320, 390]) {
    await page.setViewportSize({ width, height: 844 });
    for (const route of ["recipes", "menu", "safe-food", "rhymes", "stories", "voice-settings"]) {
      await go(page, route);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${route} at ${width}`).toBe(true);
    }
  }
});
