import type { ShibaType, SibaStatus } from "../types";

export const SHIBA_STATUSES: Array<{
  id: SibaStatus;
  label: string;
  color: string;
  type: string;
}> = [
  { id: "walk", label: "Хочу гулять", color: "#4ADE80", type: "active" },
  { id: "training", label: "Тренировка", color: "#FACC15", type: "info" },
  { id: "angry", label: "Злюка", color: "#F87171", type: "warning" },
  { id: "heat", label: "Течка", color: "#F87171", type: "critical" },
  { id: "sick", label: "Болею", color: "#F87171", type: "critical" },
  { id: "girls_only", label: "Только с девочками", color: "#4ADE80", type: "social" },
  { id: "boys_only", label: "Только с мальчиками", color: "#4ADE80", type: "social" },
];

const META_BY_ID = new Map(SHIBA_STATUSES.map((s) => [s.id, s]));

export const getSibaStatus = (siba: Pick<ShibaType, "status" | "want_to_walk">): SibaStatus | null => {
  if (siba.status && META_BY_ID.has(siba.status)) return siba.status;
  return siba.want_to_walk ? "walk" : null;
};

export const SIBA_STATUS_LABEL: Record<SibaStatus, string> = Object.fromEntries(
  SHIBA_STATUSES.map((s) => [s.id, s.label]),
) as Record<SibaStatus, string>;

export const getSibaStatusColor = (status: SibaStatus) =>
  META_BY_ID.get(status)?.color ?? "#74736E";

export const isGreenStatus = (status: SibaStatus | null) =>
  status === "walk" || status === "girls_only" || status === "boys_only";

