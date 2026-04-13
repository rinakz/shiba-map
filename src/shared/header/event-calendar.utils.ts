import { supabase } from "../api/supabase-сlient";
import type { SibaMini } from "./event-calendar.types";

export const monthStart = (d: Date) => new Date(d.getFullYear(), d.getMonth(), 1);

export const monthEnd = (d: Date) => new Date(d.getFullYear(), d.getMonth() + 1, 0);

export const dayStart = (d: Date) =>
  new Date(d.getFullYear(), d.getMonth(), d.getDate());

export const isSameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

export const dayKey = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate(),
  ).padStart(2, "0")}`;

export const formatMonth = (d: Date) =>
  d.toLocaleDateString("ru-RU", { month: "long", year: "numeric" });

export const formatDateTime = (iso: string) =>
  new Date(iso).toLocaleString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });

export const normalizeCoords = (coords: unknown): [number, number] | null => {
  if (!Array.isArray(coords) || coords.length < 2) return null;
  const lat = Number(coords[0]);
  const lng = Number(coords[1]);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  return [lat, lng];
};

export const parseCoordsFromAddress = (
  value: string,
): [number, number] | null => {
  const trimmed = value.trim();
  if (!trimmed.startsWith("[") || !trimmed.endsWith("]")) return null;
  try {
    const parsed = JSON.parse(trimmed);
    if (!Array.isArray(parsed) || parsed.length < 2) return null;
    const lat = Number(parsed[0]);
    const lng = Number(parsed[1]);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
    return [lat, lng];
  } catch {
    return null;
  }
};

export const fetchSibaByUserMap = async (userIds: string[]) => {
  if (!userIds.length) return new globalThis.Map<string, SibaMini>();

  const { data, error } = await supabase
    .from("siba_map_markers")
    .select(
      "id,siba_user_id,siba_name,siba_icon,photos,community_id,community_title,community_avatar_url,community_tg_link",
    )
    .in("siba_user_id", userIds);

  if (error) return new globalThis.Map<string, SibaMini>();

  return new globalThis.Map<string, SibaMini>(
    ((data ?? []) as SibaMini[]).map((siba) => [siba.siba_user_id, siba]),
  );
};
