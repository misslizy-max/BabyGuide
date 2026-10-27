import { test } from "node:test";
import assert from "node:assert/strict";
import {
  ageMonths,
  sleepMinutes,
  validateData,
  initial,
} from "../src/storage.js";
import { development } from "../src/development.js";
import { articles, categories } from "../src/content.js";
test("age handles month boundaries, future and empty birthday", () => {
  assert.equal(ageMonths("2025-12-31", new Date("2026-01-30T12:00:00")), 0);
  assert.equal(ageMonths("2025-12-10", new Date("2026-01-10T12:00:00")), 1);
  assert.equal(ageMonths(""), null);
  assert.equal(ageMonths("2099-01-01"), null);
});
test("sleep spans midnight and rejects reversed/invalid intervals", () => {
  assert.equal(sleepMinutes("2026-10-01T22:00", "2026-10-02T06:30"), 510);
  assert.equal(sleepMinutes("x", "y"), 0);
  assert.equal(sleepMinutes("2026-10-02T06:30", "2026-10-01T22:00"), 0);
});
test("backup validates structure and preserves safe profile and valid collections", () => {
  assert.throws(() => validateData(null));
  assert.throws(() => validateData({ sleep: {} }));
  const d = validateData({
    ...initial(),
    profile: { name: "Миша", birth: "2025-01-01", sex: "boy" },
    city: { name: "Город", latitude: 10, longitude: 20 },
  });
  assert.equal(d.profile.name, "Миша");
  assert.equal(d.city.latitude, 10);
  assert.equal(
    validateData({ ...initial(), city: { latitude: 200, longitude: 0 } }).city,
    null,
  );
});
test("legacy reference retains every month and nonempty categories", () => {
  assert.equal(development.length, 37);
  assert.deepEqual(
    development.map((x) => x.month),
    Array.from({ length: 37 }, (_, i) => i),
  );
  assert.equal(new Set(development.map((x) => x.activity)).size, 37);
  for (const c of categories.filter(
    (c) => !["weather", "growth", "development"].includes(c.id),
  ))
    assert.ok(
      articles.some((a) => a.category === c.id),
      c.id,
    );
  for (const a of articles) {
    assert.ok(a.blocks.length >= 2);
    assert.ok(
      a.blocks.every(([h, p]) => h && p.length > 40),
      a.id,
    );
  }
});
test("malformed backups cannot corrupt graphs, sleep or overwrite with unrelated JSON", () => {
  assert.throws(() => validateData({ hello: "world" }));
  assert.throws(() =>
    validateData({ ...initial(), profile: { name: "X", birth: "2026-02-30" } }),
  );
  assert.throws(() =>
    validateData({
      ...initial(),
      growth: [{ id: "1", date: "2026-01-01", weight: "nan", height: 75 }],
    }),
  );
  assert.throws(() =>
    validateData({
      ...initial(),
      sleep: [
        {
          id: "1",
          date: "2026-01-01",
          start: "2026-01-01T22:00",
          end: "2026-01-01T21:00",
        },
      ],
    }),
  );
  assert.throws(() =>
    validateData({
      ...initial(),
      diary: [{ id: "1", date: "2026-01-01", text: { unexpected: true } }],
    }),
  );
});
