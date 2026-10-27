import tables from "../data/who-lms.json";
export type Metric = "weight" | "height" | "head";
export function lmsValue(
  metric: Metric,
  sex: "boy" | "girl",
  day: number,
  z: number,
) {
  const row = tables[metric][sex][Math.round(day)];
  if (!row) return null;
  const [l, m, s] = row;
  return l === 0 ? m * Math.exp(s * z) : m * Math.pow(1 + l * s * z, 1 / l);
}
export function zScore(
  metric: Metric,
  sex: "boy" | "girl",
  day: number,
  value: number,
) {
  const row = tables[metric][sex][Math.round(day)];
  if (!row || value <= 0) return null;
  const [l, m, s] = row;
  return l === 0
    ? Math.log(value / m) / s
    : (Math.pow(value / m, l) - 1) / (l * s);
}
export function approximatePercentile(z: number) {
  const sign = z < 0 ? -1 : 1,
    x = Math.abs(z) / Math.sqrt(2),
    t = 1 / (1 + 0.3275911 * x);
  const erf =
    1 -
    ((((1.061405429 * t - 1.453152027) * t + 1.421413741) * t - 0.284496736) *
      t +
      0.254829592) *
      t *
      Math.exp(-x * x);
  return 50 * (1 + sign * erf);
}
export function ageDays(birth: string, date: string) {
  return Math.floor(
    (Date.parse(date.slice(0, 10)) - Date.parse(birth)) / 86400000,
  );
}
export function references(metric: Metric, sex: "boy" | "girl", maxDay = 1096) {
  return [-1.8807936, 0, 1.8807936].map((z) =>
    Array.from({ length: 37 }, (_, i) => {
      const x = Math.min(1096, Math.round(i * 30.4375));
      return { x, y: lmsValue(metric, sex, x, z)! };
    }).filter((p) => p.x <= maxDay),
  );
}
