import { test, expect } from "@playwright/test";
test("clean startup and parent/child navigation emit no console errors", async ({
  page,
}) => {
  const errors = [];
  page.on("pageerror", (e) => errors.push("JavaScript: " + e.message));
  page.on("console", (m) => {
    if (m.type() === "error") errors.push("Console: " + m.text());
  });
  await page.goto("/");
  await expect(page.locator("h1")).toBeVisible();
  for (const route of [
    "diary",
    "recommendations",
    "profile",
    "more",
    "development",
    "games",
    "menu",
    "growth",
    "sleep-log",
    "temperature",
    "weather",
    "guide/potty-plan",
    "rhymes",
    "stories",
    "cards",
    "words",
    "child",
    "child/cards",
    "child/actions",
    "child/repeat",
  ]) {
    await page.evaluate((r) => (location.hash = r), route);
    await expect(page.locator("h1").first()).toBeVisible();
  }
  expect(errors).toEqual([]);
});
