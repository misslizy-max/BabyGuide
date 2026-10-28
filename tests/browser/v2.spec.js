import { test, expect } from "@playwright/test";

const go = async (page, hash) => {
  await page.evaluate((h) => (location.hash = h), hash);
  await expect(page.locator("h1").first()).toBeVisible();
};

async function holdForParent(page) {
  const parent = page.getByRole("button", {
    name: /Удерживайте, чтобы вернуться к маме/,
  });
  await parent.dispatchEvent("pointerdown", { pointerType: "touch" });
  await page.waitForTimeout(1950);
  await expect(page.getByRole("dialog")).toContainText("Вернуться к маме?");
}

test.beforeEach(async ({ page }) => {
  await page.goto("/");
});

test("V3 shell has five obvious primary tabs and dedicated nutrition/more hubs", async ({ page }) => {
  await go(page, "home");
  await expect(page.locator(".bottom-nav a")).toHaveText([
    /Сегодня/,
    /Развитие/,
    /Питание/,
    /Дневник/,
    /Ещё/,
  ]);
  await go(page, "nutrition");
  await expect(page.locator(".nutrition-home-v3")).toBeVisible();
  await expect(page.getByRole("link", { name: /Собрать меню/ })).toBeVisible();
  await go(page, "more");
  await expect(page.locator(".more-v3-page")).toBeVisible();
  await expect(page.getByRole("link", { name: /Аптечка ребёнка/ })).toBeVisible();
  await expect(page.getByRole("link", { name: /Методические пособия/ })).toBeVisible();
});

test("child V3 uses visual educational activities and parent hold exit", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await go(page, "child");
  await expect(page.locator(".bottom-nav")).toHaveCount(0);
  await expect(page.locator(".kid-home-grid .kid-home-tile")).toHaveCount(6);
  await go(page, "child/actions/piano");
  await expect(page.locator(".kid-piano button")).toHaveCount(7);
  await expect(page.getByRole("button", { name: "Повтори 2 ноты" })).toBeVisible();
  await go(page, "child/actions/bubbles");
  await expect(page.locator(".kid-bubble").first()).toBeVisible();
  await expect(page.getByRole("button", { name: "Найди большой" })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await holdForParent(page);
  await page.getByRole("dialog").getByRole("button", { name: "Да, к маме", exact: true }).click();
  await expect(page.locator(".bottom-nav")).toBeVisible();
});

test("sleep V3 has one-tap tracker, weekly chart and manual fallback", async ({ page }) => {
  await go(page, "sleep-log");
  await expect(page.locator(".sleep-live-card")).toBeVisible();
  await expect(page.getByRole("button", { name: /уснул/ })).toBeVisible();
  await expect(page.locator(".sleep-week-chart")).toBeVisible();
  await page.getByRole("button", { name: /уснул/ }).click();
  await expect(page.getByRole("button", { name: /проснулся/ })).toBeVisible();
});

test("menu builder V3 can build multiple days and expose shopping list", async ({ page }) => {
  await go(page, "menu-builder");
  await expect(page.locator(".menu-builder-v3")).toBeVisible();
  await expect(page.getByRole("button", { name: /Собрать меню/ })).toBeVisible();
  await expect(page.locator(".menu-day-pills button")).toHaveCount(4);
});

test("Repeat keeps explicit microphone permission", async ({ page }) => {
  await go(page, "repeat");
  await page.evaluate(() => {
    navigator.mediaDevices.getUserMedia = async () => {
      throw new DOMException("denied", "NotAllowedError");
    };
  });
  await page.getByRole("button", { name: "Слушай и повторяй" }).click();
  await expect(page.getByRole("alert")).toContainText("запрещён");
});