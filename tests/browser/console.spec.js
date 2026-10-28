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
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Растём вместе",
  );
  for (const [route, heading] of [
    ["diary", "Дневник маленьких открытий"],
    ["recommendations", "Рекомендации"],
    ["profile", "Ваш маленький мир"],
    ["more", "Библиотека заботы"],
    ["development", "Растём месяц за месяцем"],
    ["games", "Библиотека игр"],
    ["menu", "Меню на 14 дней"],
    ["growth", "Рост маленького человека"],
    ["sleep-log", "Дневник сна"],
    ["temperature", "Температура и приём лекарств"],
    ["weather", "Время на прогулку"],
    ["guide/potty-plan", "Горшок: от знакомства к самостоятельности"],
    ["rhymes", "Потешки с движениями"],
    ["stories", "Поддерживающие истории"],
    ["cards", "Развивающие карточки"],
    ["words", "Мои первые слова"],
    ["child", "Во что поиграем?"],
    ["child/cards", "Кот"],
    ["child/actions", "Нажми и посмотри!"],
    ["child/repeat", "Повторюшка"],
  ]) {
    await page.evaluate((r) => (location.hash = r), route);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(heading);
  }
  expect(errors).toEqual([]);
});
