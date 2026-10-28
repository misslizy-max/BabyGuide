import { test, expect } from "@playwright/test";

const go = async (page, hash) => {
  await page.evaluate((h) => (location.hash = h), hash);
  await expect(page.locator("h1").first()).toBeVisible();
};

test.beforeEach(async ({ page }) => {
  await page.goto("/");
});

test("age guide exposes visual nutrition, routines and mom voice settings", async ({ page }) => {
  await go(page, "age-guide");
  await expect(page.locator(".routine-mini-flow")).toBeVisible();
  await expect(page.getByRole("link", { name: /Рутины и самообслуживание/ })).toBeVisible();
  await expect(page.getByRole("link", { name: /Настроить мамин голос/ })).toBeVisible();

  await go(page, "routines");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Рутины и самообслуживание",
  );
  await expect(page.locator(".routine-overview")).toBeVisible();
  await expect(page.locator(".routine-card").first()).toBeVisible();
  await page.setViewportSize({ width: 320, height: 800 });
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
  ).toBe(true);

  await go(page, "voice-settings");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Голос BabyGuide",
  );
  await expect(page.locator(".natural-voice-card")).toBeVisible();
  await expect(page.locator(".natural-voice-card")).toContainText(/Мамин голос|Лиза/i);
  await expect(page.getByText("Послушать мамин голос")).toBeVisible();
});

test("Repeat explains adaptive background-noise calibration", async ({ page }) => {
  await go(page, "repeat");
  await expect(page.locator(".repeat-screen")).toContainText(
    "подстраиваюсь под фоновый шум",
  );
  await expect(page.locator(".repeat-screen")).toContainText("до 20 секунд");
  await expect(page.locator(".repeat-screen")).toContainText("первых 5 секунд");
});
