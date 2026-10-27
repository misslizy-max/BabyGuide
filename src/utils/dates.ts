export const today = () => localDate(new Date());
export function localDate(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
export function localNow() {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 16);
}
export function validDate(v: unknown): v is string {
  return (
    typeof v === "string" &&
    /^\d{4}-\d{2}-\d{2}$/.test(v) &&
    Number.isFinite(Date.parse(v)) &&
    new Date(v).toISOString().slice(0, 10) === v
  );
}
export function months(birth: string, now = new Date()) {
  if (!validDate(birth) || birth > localDate(now)) return null;
  const d = new Date(birth + "T00:00:00");
  return Math.max(
    0,
    (now.getFullYear() - d.getFullYear()) * 12 +
      now.getMonth() -
      d.getMonth() -
      (now.getDate() < d.getDate() ? 1 : 0),
  );
}
export function exactAge(birth: string) {
  const m = months(birth);
  if (m === null) return "Добавьте дату рождения";
  const now = new Date(),
    anchor = new Date(birth + "T00:00:00");
  const day = anchor.getDate();
  anchor.setDate(1);
  anchor.setMonth(anchor.getMonth() + m);
  anchor.setDate(
    Math.min(
      day,
      new Date(anchor.getFullYear(), anchor.getMonth() + 1, 0).getDate(),
    ),
  );
  const days = Math.max(0, Math.floor((+now - +anchor) / 86400000));
  return `${Math.floor(m / 12) ? Math.floor(m / 12) + " г. " : ""}${m % 12} мес. ${days} дн.`;
}
export function formatDate(v: string) {
  const d = new Date(v.length === 10 ? v + "T12:00:00" : v);
  return Number.isFinite(+d)
    ? d.toLocaleDateString("ru-RU", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "Дата не указана";
}
export const duration = (start: string, end: string) =>
  Math.max(0, Math.round((Date.parse(end) - Date.parse(start)) / 60000)) || 0;
export const hours = (minutes: number) =>
  `${Math.floor(minutes / 60)} ч ${minutes % 60} мин`;
// Merge clipped intervals so a duplicate entry never doubles a daily total.
export function sleepInPeriod(
  events: { time: string; end?: string }[],
  start: Date,
  end: Date,
) {
  const intervals = events
    .filter((e) => e.end)
    .map((e) => [
      Math.max(+start, Date.parse(e.time)),
      Math.min(+end, Date.parse(e.end!)),
    ])
    .filter(([a, b]) => b > a)
    .sort((a, b) => a[0] - b[0]);
  let total = 0,
    last = -Infinity;
  for (const [a, b] of intervals) {
    total += Math.max(0, b - Math.max(a, last));
    last = Math.max(last, b);
  }
  return Math.round(total / 60000);
}
