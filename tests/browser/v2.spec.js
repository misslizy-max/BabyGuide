import { test, expect } from "@playwright/test";

const go = async (page, hash) => {
  await page.evaluate((h) => (location.hash = h), hash);
  await expect(page.locator("h1").first()).toBeVisible();
};

async function holdForParent(page) {
  const parent = page.getByRole("button", {
    name: /Удерживайте две секунды, чтобы вернуться в режим родителя/,
  });
  await parent.dispatchEvent("pointerdown", { pointerType: "touch" });
  await page.waitForTimeout(2150);
  await expect(page.getByRole("dialog")).toContainText(
    "Вернуться в режим родителя?",
  );
}

test.beforeEach(async ({ page }) => {
  await page.goto("/");
});

test("V2 Today dashboard has four primary tabs and age guide", async ({ page }) => {
  await go(page, "home");
  await expect(page.locator(".today-page")).toBeVisible();
  await expect(page.locator(".today-grid-v2 .today-card")).toHaveCount(6);
  await expect(page.locator(".bottom-nav a")).toHaveText([
    /Сегодня/,
    /Развитие/,
    /Дневник/,
    /Библиотека/,
  ]);
  await go(page, "age-guide");
  await expect(page.locator(".age-guide-icons > span")).toHaveCount(4);
  await expect(page.locator(".age-guide-page")).toContainText("Развитие");
  await expect(page.locator(".age-guide-page")).toContainText("Питание");
  await expect(page.locator(".age-guide-page")).toContainText("Здоровье");
  await go(page, "health");
  await expect(page.locator(".health-actions-grid > a")).toHaveCount(4);
  await expect(page.locator(".health-topic-grid > a")).not.toHaveCount(0);
});

test("child mode exits only after two-second parent hold and confirmation", async ({ page }) => {
  await go(page, "child");
  await expect(page.locator(".bottom-nav")).toHaveCount(0);
  const parent = page.getByRole("button", {
    name: /Удерживайте две секунды, чтобы вернуться в режим родителя/,
  });
  await parent.click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await holdForParent(page);
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Да, к маме", exact: true })
    .click();
  await expect(page.locator(".bottom-nav")).toBeVisible();
  await expect(page.locator(".today-page")).toBeVisible();
});

test("V2 child layouts stay narrow and rejected storage writes still show an error", async ({ page }) => {
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
  await holdForParent(page);
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Да, к маме", exact: true })
    .click();
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

test("V2 Repeat keeps explicit microphone permission and cleans up after manual stop", async ({
  page,
  context,
}) => {
  await go(page, "repeat");
  await page.evaluate(() => {
    navigator.mediaDevices.getUserMedia = async () => {
      throw new DOMException("denied", "NotAllowedError");
    };
  });
  await page.getByRole("button", { name: "Слушай и повторяй" }).click();
  await expect(page.getByRole("alert")).toContainText("запрещён");

  await page.reload();
  await context.grantPermissions(["microphone"]);
  await go(page, "repeat");
  await page.getByRole("button", { name: "Слушай и повторяй" }).click();
  await expect(page.locator(".repeat-screen h2")).toContainText("Говори");
  await page.waitForTimeout(600);
  await page.getByRole("button", { name: "Закончить" }).click();
  await expect
    .poll(() => page.locator(".repeat-screen h2").textContent())
    .toMatch(/Повторяю|Повторю/);
});
