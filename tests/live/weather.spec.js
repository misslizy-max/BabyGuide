import { test, expect } from "@playwright/test";
function waitApi(page, prefix, testInfo) {
  return new Promise((resolve, reject) => {
    let timer;
    const clean = () => {
      clearTimeout(timer);
      page.off("response", response);
      page.off("requestfailed", failed);
    };
    const response = (r) => {
      if (r.url().startsWith(prefix)) {
        clean();
        resolve(r);
      }
    };
    const failed = (request) => {
      if (!request.url().startsWith(prefix)) return;
      clean();
      const details = {
        url: request.url(),
        failure: request.failure()?.errorText,
        observedAt: new Date().toISOString(),
      };
      void testInfo
        .attach("real-request-failed", {
          body: JSON.stringify(details, null, 2),
          contentType: "application/json",
        })
        .then(
          () =>
            reject(
              new Error(
                "Real weather request failed: " +
                  details.failure +
                  "; network access is not verified.",
              ),
            ),
          reject,
        );
    };
    page.on("response", response);
    page.on("requestfailed", failed);
    timer = setTimeout(() => {
      clean();
      reject(new Error("Real weather API did not respond within 25 seconds"));
    }, 25000);
  });
}
async function evidence(response, testInfo, name) {
  const status = response.status();
  await testInfo.attach(name, {
    body: JSON.stringify(
      { url: response.url(), status, observedAt: new Date().toISOString() },
      null,
      2,
    ),
    contentType: "application/json",
  });
  expect(
    status,
    `Real Open-Meteo HTTP ${status}: a policy denial is not a working forecast`,
  ).toBe(200);
  return response.json();
}
test("real city search and forecast drive clothing without geolocation", async ({
  page,
}, testInfo) => {
  await page.addInitScript(() =>
    Object.defineProperty(navigator, "geolocation", {
      get: () => undefined,
      configurable: true,
    }),
  );
  await page.goto("/#weather");
  await page
    .getByRole("button", { name: "Определить моё местоположение" })
    .click();
  await expect(page.getByRole("alert")).toContainText("не поддерживается");
  await page.locator("#city-q").fill("Владивосток");
  const [search] = await Promise.all([
    waitApi(page, "https://geocoding-api.open-meteo.com/v1/search", testInfo),
    page.getByRole("button", { name: "Найти", exact: true }).click(),
  ]);
  const cities = await evidence(search, testInfo, "real-geocoding");
  expect(cities.results?.length).toBeGreaterThan(0);
  const [forecast] = await Promise.all([
    waitApi(page, "https://api.open-meteo.com/v1/forecast", testInfo),
    page.locator(".city-result").first().click(),
  ]);
  const payload = await evidence(forecast, testInfo, "real-forecast");
  expect(Number.isFinite(payload.current?.temperature_2m)).toBe(true);
  await expect(page.locator(".weather-card")).toContainText(
    Math.round(payload.current.temperature_2m) + "°",
  );
  await expect(page.locator(".wardrobe-layer")).toHaveCount(6);
  await page
    .getByRole("button", { name: "Активная прогулка", exact: true })
    .click();
  await expect(page.locator(".outfit-card")).toContainText("активной игре");
  await testInfo.attach("real-weather-result", {
    body: JSON.stringify(
      {
        current: payload.current,
        clothing: await page.locator(".wardrobe-layer h3").allTextContents(),
      },
      null,
      2,
    ),
    contentType: "application/json",
  });
});
test("real unknown city returns an empty result with clear explanation", async ({
  page,
}, testInfo) => {
  await page.goto("/#weather");
  await page.locator("#city-q").fill("zzqxxvvmnqpzzbabyguide");
  const [result] = await Promise.all([
    waitApi(page, "https://geocoding-api.open-meteo.com/v1/search", testInfo),
    page.getByRole("button", { name: "Найти", exact: true }).click(),
  ]);
  const payload = await evidence(result, testInfo, "real-unknown-city");
  expect(payload.results || []).toHaveLength(0);
  await expect(page.getByRole("alert")).toContainText("Город не найден");
});
test("network loss never produces a fictional forecast", async ({
  page,
  context,
}) => {
  await page.goto("/#weather");
  await context.setOffline(true);
  await page.locator("#city-q").fill("Владивосток");
  await page.getByRole("button", { name: "Найти", exact: true }).click();
  await expect(page.getByRole("alert")).toContainText("Не удалось найти город");
  await expect(page.locator(".weather-card")).toHaveCount(0);
  await expect(page.locator(".wardrobe-layer")).toHaveCount(0);
  await context.setOffline(false);
});

test("real coordinate forecast is checked independently of city search", async ({
  page,
}, testInfo) => {
  await page.addInitScript(() =>
    localStorage.setItem(
      "babyguide.v1",
      JSON.stringify({
        profile: { name: "", birth: "", sex: "girl" },
        diary: [],
        sleep: [],
        growth: [],
        favorites: [],
        menuDone: [],
        city: {
          name: "Владивосток · тестовая точка",
          latitude: 43.1155,
          longitude: 131.8855,
        },
      }),
    ),
  );
  const [forecast] = await Promise.all([
    waitApi(page, "https://api.open-meteo.com/v1/forecast", testInfo),
    page.goto("/#weather"),
  ]);
  const payload = await evidence(forecast, testInfo, "direct-real-forecast");
  expect(Number.isFinite(payload.current?.temperature_2m)).toBe(true);
  await expect(page.locator(".weather-card")).toContainText(
    Math.round(payload.current.temperature_2m) + "°",
  );
  await expect(page.locator(".wardrobe-layer")).toHaveCount(6);
  await testInfo.attach("direct-real-clothing", {
    body: JSON.stringify(
      {
        current: payload.current,
        layers: await page.locator(".wardrobe-layer h3").allTextContents(),
      },
      null,
      2,
    ),
    contentType: "application/json",
  });
});
