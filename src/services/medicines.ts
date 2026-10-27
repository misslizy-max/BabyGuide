export function dose(
  drug: "paracetamol" | "ibuprofen",
  weight: number,
  strength: number,
  volume: number,
  age: number | null,
) {
  if (age === null || age < 6 || age > 36)
    throw Error(
      "Расчёт доступен только для возраста 6–36 месяцев по заполненному профилю. Для другого возраста нужен индивидуальный план.",
    );
  if (
    ![weight, strength, volume].every(Number.isFinite) ||
    weight < 2 ||
    weight > 30 ||
    strength <= 0 ||
    volume <= 0
  )
    throw Error("Укажите актуальный вес и концентрацию именно с упаковки.");
  const concentration = strength / volume;
  if (concentration < 5 || concentration > 100)
    throw Error(
      "Необычная концентрация. Проверьте мг и мл с фармацевтом; этот расчёт не применяйте.",
    );
  const mgPerKg = drug === "paracetamol" ? 15 : 10,
    mg = weight * mgPerKg;
  return {
    weight,
    strength,
    volume,
    concentration,
    mgPerKg,
    mg,
    ml: mg / concentration,
    interval: drug === "paracetamol" ? 6 : 8,
    maxDoses: drug === "paracetamol" ? 4 : 3,
    dailyMax: drug === "paracetamol" ? 60 : 30,
  };
}
