import { test, expect } from "@playwright/test";

const go = async (page, hash) => {
  await page.evaluate((h) => (location.hash = h), hash);
  await expect(page.locator("h1").first()).toBeVisible();
};

test.beforeEach(async ({ page }) => {
  await page.goto("/");
});

test("child V4 cards use real animal photos and disable mechanical narration fallback", async ({ page }) => {
  await go(page, "child/cards");
  await expect(page.locator(".animal-photo-card img")).toBeVisible();
  await expect(page.locator(".card-sound-label")).toContainText(/Мяу|Гав|Му|Кря|Бе|И-го-го/);
  await expect(page.locator(".kid-picture-card-v4")).toContainText("Нажми: услышишь животное");
});

test("child V4 piano has two octaves and black keys", async ({ page }) => {
  await go(page, "child/actions/piano");
  await expect(page.locator(".piano-white-key")).toHaveCount(14);
  await expect(page.locator(".piano-black-key")).toHaveCount(10);
  await expect(page.getByRole("button", { name: "Повтори мелодию" })).toBeVisible();
});

test("child V4 fills bubble field and box always reveals an object", async ({ page }) => {
  await go(page, "child/actions/bubbles");
  await expect(page.locator(".bubble-v4")).toHaveCount(18);
  await page.locator(".bubble-v4").first().click();
  await expect(page.locator(".bubble-v4")).toHaveCount(17);
  await go(page, "child/actions/box");
  await page.locator(".box-scene-v4").click();
  await expect(page.locator(".box-object-v4 .card-art-v3")).toBeVisible();
});

test("child V4 exposes expanded rhyme library", async ({ page }) => {
  await go(page, "child");
  await expect(page.locator(".kid-home-grid")).toContainText("40 потешек");
});

test("child V4 stays inside narrow mobile viewport", async ({ page }) => {
  for (const width of [320, 390]) {
    await page.setViewportSize({ width, height: 844 });
    for (const route of ["child", "child/cards", "child/actions/bubbles", "child/actions/box"]) {
      await go(page, route);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${route} at ${width}`).toBe(true);
    }
  }
});
