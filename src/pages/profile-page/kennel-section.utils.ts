import { supabase } from "../../shared/api/supabase-сlient";
import { buildSafeAvatarSrc } from "../../shared/header/news-panel/news-panel.utils";
import type { ShibaType } from "../../shared/types";
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

export async function fetchSibasByKennelId(
  kennelId: string,
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
  return (sibas ?? []) as ShibaType[];
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
  const url = `${window.location.origin}${window.location.pathname}#/auth`;
  return `Привет! Зарегистрируйся как заводчик в Сибинаторе и пройди верификацию питомника — после проверки документов тебя смогут выбрать владельцы: ${url}`;
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
