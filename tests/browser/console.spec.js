import { test, expect } from "@playwright/test";
test("clean startup and V4 parent/child navigation emit no console errors", async ({ page }) => {
  const errors = [];
  page.on("pageerror", (e) => errors.push("JavaScript: " + e.message));
  page.on("console", (m) => { if (m.type() === "error") errors.push("Console: " + m.text()); });
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 }).first()).toBeVisible();
  for (const [route, heading] of [
    ["nutrition", "Питание"],
    ["more", "Ещё"],
    ["manuals", "Методические пособия"],
    ["first-aid-kit", "Аптечка ребёнка"],
    ["diary", "Дневник маленьких открытий"],
    ["profile", "Ваш маленький мир"],
    ["development", "Растём месяц за месяцем"],
    ["games", "Библиотека игр"],
    ["menu", "Меню на 14 дней"],
    ["menu-builder", "Конструктор меню"],
    ["growth", "Рост маленького человека"],
    ["sleep-log", "Сон"],
    ["temperature", "Температура и приём лекарств"],
    ["weather", "Время на прогулку"],
    ["guide/potty-plan", "Горшок: от знакомства к самостоятельности"],
    ["rhymes", "Потешки с движениями"],
    ["stories", "Поддерживающие истории"],
    ["cards", "Развивающие карточки"],
    ["words", "Мои первые слова"],
    ["child", "Что выберем?"],
    ["child/cards", "Карточки"],
    ["child/actions/piano", "Моё пианино"],
    ["child/actions/bubbles", "Пузырьки"],
    ["child/actions/box", "Коробочка"],
    ["child/repeat", "Повторюшка"],
  ]) {
    await page.evaluate((r) => (location.hash = r), route);
    await expect(page.getByRole("heading", { level: 1 }).first()).toHaveText(heading);
  }
  expect(errors).toEqual([]);
});
