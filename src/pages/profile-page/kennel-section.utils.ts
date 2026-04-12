import { supabase } from "../../shared/api/supabase-сlient";
import { buildSafeAvatarSrc } from "../../shared/header/news-panel/news-panel.utils";
import type { ShibaType } from "../../shared/types";
import { getSiteAuthUrl } from "../../shared/utils/site-url";
import { OPEN_SIBA_FROM_KENNEL_EVENT } from "./kennel-section.constants";
import type { Kennel, KennelWithAvatar } from "./kennel-section.types";

export function escapeIlike(q: string) {
  return q.replace(/\\/g, "\\\\").replace(/%/g, "\\%").replace(/_/g, "\\_");
}

export async function fetchKennelRepresentativeAvatarMap(
  kennelIds: string[],
): Promise<Map<string, string>> {
  const map = new Map<string, string>();
  if (!kennelIds.length) return map;

  const { data, error } = await supabase
    .from("siba_kennels")
    .select("kennel_id, created_at, sibains(photos, siba_icon)")
    .in("kennel_id", kennelIds)
    .order("created_at", { ascending: true });

  if (error || !data?.length) return map;

  for (const row of data) {
    const kid = String((row as { kennel_id: string }).kennel_id);
    if (map.has(kid)) continue;
    const emb = (row as { sibains: unknown }).sibains;
    const siba = Array.isArray(emb) ? emb[0] : emb;
    const photos =
      siba && typeof siba === "object" && siba !== null && "photos" in siba
        ? ((siba as { photos: string | null }).photos ?? null)
        : null;
    const icon =
      siba && typeof siba === "object" && siba !== null && "siba_icon" in siba
        ? String((siba as { siba_icon: string }).siba_icon)
        : "sibka";
    map.set(kid, buildSafeAvatarSrc(photos, icon));
  }
  return map;
}

/**
 * У строк из `sibains` нет `account_type`. Без него в генеалогическом древе владельца
 * остаётся анкета заводчика (она же в `siba_kennels`). Тип подставляем из view / users и
 * убираем всех заводчиков — в древе только «обычные» сибы.
 */
async function withAccountTypesExcludingBreeders(
  list: ShibaType[],
): Promise<ShibaType[]> {
  if (!list.length) return list;

  const ids = list.map((s) => String(s.id));

  const { data: markers } = await supabase
    .from("siba_map_markers")
    .select("id, account_type")
    .in("id", ids);

  const fromMarkers = new Map<string, string | null | undefined>();
  for (const row of markers ?? []) {
    const m = row as { id: string; account_type: string | null };
    fromMarkers.set(String(m.id), m.account_type);
  }

  const needUser = list.filter((s) => !fromMarkers.has(String(s.id)));
  const userIds = [
    ...new Set(
      needUser
        .map((s) => s.siba_user_id)
        .filter((u): u is string => Boolean(u && String(u).trim())),
    ),
  ];

  const fromUsers = new Map<string, string | null>();
  if (userIds.length) {
    const { data: usersRows } = await supabase
      .from("users")
      .select("user_id, account_type")
      .in("user_id", userIds);
    for (const row of usersRows ?? []) {
      const u = row as { user_id: string; account_type: string | null };
      fromUsers.set(u.user_id, u.account_type ?? null);
    }
  }

  return list
    .map((s) => {
      const sid = String(s.id);
      const account_type = fromMarkers.has(sid)
        ? (fromMarkers.get(sid) ?? null)
        : (fromUsers.get(s.siba_user_id) ?? null);
      return { ...s, account_type };
    })
    .filter((s) => s.account_type !== "breeder");
}

export async function fetchSibasByKennelId(
  kennelId: string,
  opts?: { excludeSibaId?: string | null; excludeSibaUserId?: string | null },
): Promise<ShibaType[]> {
  const { data: links, error: linksErr } = await supabase
    .from("siba_kennels")
    .select("siba_id")
    .eq("kennel_id", kennelId);
  if (linksErr) return [];
  const ids = (links ?? []).map((x: { siba_id: string }) => x.siba_id);
  if (!ids.length) return [];
  const { data: sibas, error: sibasErr } = await supabase
    .from("sibains")
    .select("*")
    .in("id", ids);
  if (sibasErr) return [];
  let list = (sibas ?? []) as ShibaType[];
  const exId = opts?.excludeSibaId?.trim();
  if (exId) {
    list = list.filter((s) => String(s.id) !== exId);
  }
  const exUser = opts?.excludeSibaUserId?.trim();
  if (exUser) {
    list = list.filter((s) => s.siba_user_id !== exUser);
  }
  return withAccountTypesExcludingBreeders(list);
}

export async function fetchMyKennelForSiba(
  sibaId: string,
): Promise<Kennel | null> {
  const { data, error } = await supabase
    .from("siba_kennels")
    .select("kennel_id, kennels(*)")
    .eq("siba_id", sibaId)
    .maybeSingle();
  if (error) return null;
  return (data as unknown as { kennels: Kennel } | null)?.kennels ?? null;
}

export async function fetchBreederKennelCatalogWithAvatars(
  searchQuery: string,
): Promise<KennelWithAvatar[]> {
  const { data: breederRows, error: breederErr } = await supabase
    .from("users")
    .select("user_id")
    .eq("account_type", "breeder");
  if (breederErr) return [];
  const breederIds = [
    ...new Set(
      (breederRows ?? []).map((r: { user_id: string }) => r.user_id),
    ),
  ];
  if (!breederIds.length) return [];

  const q = searchQuery.trim();
  const esc = escapeIlike(q);
  let req = supabase
    .from("kennels")
    .select("*")
    .eq("is_verified", true)
    .not("created_by", "is", null)
    .in("created_by", breederIds)
    .order("created_at", { ascending: false })
    .limit(40);
  if (q) {
    req = req.or(`name.ilike.%${esc}%,prefix.ilike.%${esc}%`);
  }
  const { data, error } = await req;
  if (error) return [];
  const kennels = (data ?? []) as unknown as Kennel[];
  const avatarMap = await fetchKennelRepresentativeAvatarMap(
    kennels.map((k) => k.id),
  );
  return kennels.map((k) => ({
    ...k,
    avatarSrc: avatarMap.get(k.id) ?? buildSafeAvatarSrc(null, "sibka"),
  }));
}

export function buildBreederInviteShareText(): string {
  const url = getSiteAuthUrl();
  return `Привет! Зарегистрируйся как заводчик в Сибинаторе и пройди верификацию питомника — после проверки документов тебя смогут выбрать владельцы: ${url}`;
}

/** Приглашение для владельцев щенков / выпускников (не для других заводчиков). */
export function buildGraduateOwnerInviteShareText(): string {
  const url = getSiteAuthUrl();
  return `Привет! Зарегистрируйся в Сибинаторе, добавь анкету своей сибы и в разделе «Питомник» привяжи её к нашему питомнику — так мы останемся на связи в приложении: ${url}`;
}

export function dispatchOpenSibaFromKennel(sibaId: string) {
  const ev = new CustomEvent(OPEN_SIBA_FROM_KENNEL_EVENT, {
    detail: { sibaId },
  });
  window.dispatchEvent(ev);
}

export function sumSibaLevels(sibas: ShibaType[]): number {
  return sibas.reduce(
    (acc, s) => acc + (typeof s.level === "number" ? s.level : 0),
    0,
  );
}
