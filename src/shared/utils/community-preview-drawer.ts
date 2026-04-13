import { supabase } from "../api/supabase-сlient";
import type { CommunityMemberPreview } from "../types/community-preview-drawer.types";

/**
 * Участники сообщества: порядок по дате вступления (новые сверху в списке).
 */
export async function fetchCommunityMembersPreview(
  communityId: string,
): Promise<CommunityMemberPreview[]> {
  const { data: memberships, error: mErr } = await supabase
    .from("user_community_memberships")
    .select("user_id, joined_at")
    .eq("community_id", communityId)
    .order("joined_at", { ascending: false });

  if (mErr) throw mErr;

  const userIds = (memberships ?? []).map(
    (r: { user_id: string }) => r.user_id,
  );
  if (!userIds.length) return [];

  const { data: sibas, error: sErr } = await supabase
    .from("siba_map_markers")
    .select("id,siba_user_id,siba_name,siba_icon,photos")
    .in("siba_user_id", userIds);

  if (sErr) throw sErr;

  const byUser = new Map(
    (sibas ?? []).map(
      (s: {
        id: string;
        siba_user_id: string;
        siba_name: string;
        siba_icon: string;
        photos?: string | null;
      }) => [s.siba_user_id, s],
    ),
  );

  return userIds.map((user_id) => {
    const s = byUser.get(user_id);
    if (s) {
      return {
        user_id,
        siba_id: s.id,
        display_name: s.siba_name,
        avatar_src: s.photos ?? `/${s.siba_icon}.png`,
      };
    }
    return {
      user_id,
      siba_id: null,
      display_name: "Без сибы в приложении",
      avatar_src: "/default.png",
    };
  });
}

export function communityPreviewRuParticipantsWord(n: number): string {
  const abs = Math.abs(Math.floor(n)) % 100;
  const d = abs % 10;
  if (abs > 10 && abs < 20) return "участников";
  if (d === 1) return "участник";
  if (d >= 2 && d <= 4) return "участника";
  return "участников";
}

export function communityPreviewExternalLinkLabel(url: string | null): string {
  if (!url) return "Перейти";
  const u = url.toLowerCase();
  if (u.includes("t.me") || u.includes("telegram")) return "Открыть в Telegram";
  if (u.includes("vk.com") || u.includes("vkontakte")) return "Открыть во ВКонтакте";
  return "Перейти по ссылке";
}
