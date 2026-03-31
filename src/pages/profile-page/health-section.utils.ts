import type {
  DrugOption,
  ParasiteProgress,
  VaccineKey,
  VaccineStatus,
} from "./health-section.types";

export const VACCINE_TITLES: Record<VaccineKey, string> = {
  rabies: "Бешенство",
  complex: "Комплексная",
};

export const DRUG_OPTIONS: readonly DrugOption[] = [
  "Bravecto",
  "Simparica",
  "Milbemax",
  "Свой вариант",
] as const;

export const DAYS_BY_DRUG: Record<Exclude<DrugOption, "Свой вариант">, number> = {
  Bravecto: 90,
  Simparica: 30,
  Milbemax: 30,
};

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

export const parseDate = (value: string): Date | null => {
  if (!value) return null;
  const d = new Date(`${value}T00:00:00`);
  return Number.isNaN(d.getTime()) ? null : d;
};

const startOfDay = (date: Date) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};

const plusCalendarYear = (from: Date) => {
  const d = new Date(from);
  d.setFullYear(d.getFullYear() + 1);
  return d;
};

export const getVaccineStatus = (
  lastShotDate: string,
  nowTs: number | null,
): VaccineStatus => {
  const d = parseDate(lastShotDate);
  if (!d || nowTs === null) return null;
  const nextDue = plusCalendarYear(d);
  const diff = nextDue.getTime() - startOfDay(new Date(nowTs)).getTime();
  const leftDays = Math.ceil(diff / ONE_DAY_MS);
  return { nextDue, leftDays, isExpired: leftDays < 0 };
};

export const getCycleDays = (drug: DrugOption, cycleDaysDraft: string) => {
  return drug === "Свой вариант"
    ? Math.max(1, Number(cycleDaysDraft) || 30)
    : DAYS_BY_DRUG[drug];
};

export const getParasiteProgress = (params: {
  drugDate: string;
  drug: DrugOption;
  cycleDaysDraft: string;
  nowTs: number | null;
}): ParasiteProgress => {
  const { drugDate, drug, cycleDaysDraft, nowTs } = params;
  const date = parseDate(drugDate);
  if (!date || nowTs === null) return { progress: 0, leftDays: null };

  const cycleDays = getCycleDays(drug, cycleDaysDraft);
  const elapsedMs = nowTs - date.getTime();
  const elapsedDays = Math.max(0, Math.floor(elapsedMs / ONE_DAY_MS));
  const leftDays = Math.max(0, cycleDays - elapsedDays);
  const progress = Math.min(100, Math.max(0, (elapsedDays / cycleDays) * 100));
  return { progress, leftDays };
};
