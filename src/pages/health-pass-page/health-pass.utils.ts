export type WeightPoint = { weight_kg: number };

export const MEDICAL_TAGS = ["Аллергия на курицу", "Боится ветеринаров"] as const;

export const buildChartPath = (weights: Array<WeightPoint>) => {
  if (!weights.length) return "";
  const max = Math.max(...weights.map((w) => w.weight_kg));
  const min = Math.min(...weights.map((w) => w.weight_kg));
  const pad = 1;
  const top = max + pad;
  const bottom = Math.max(1, min - pad);
  return weights
    .map((w, i) => {
      const x = (i / Math.max(1, weights.length - 1)) * 100;
      const y = 100 - ((w.weight_kg - bottom) / Math.max(0.01, top - bottom)) * 100;
      return `${i === 0 ? "M" : "L"} ${x} ${y}`;
    })
    .join(" ");
};

