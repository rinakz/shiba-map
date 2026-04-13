import { supabase } from "../../shared/api/supabase-сlient";
import type { NewsLikesListRow } from "./news-page.types";
import type { NewsLikeRow } from "./news-page-feed.utils";

export async function fetchNewsLikeRowsForItemIds(
  itemIds: string[],
): Promise<NewsLikeRow[]> {
  if (!itemIds.length) return [];
  const { data, error } = await supabase
    .from("news_likes")
    .select("item_id,user_id")
    .in("item_id", itemIds);
  if (error) return [];
  return (data ?? []) as NewsLikeRow[];
}

export async function fetchSibasWhoLikedNewsItems(
  itemIds: string[],
): Promise<NewsLikesListRow[]> {
  if (!itemIds.length) return [];
  const { data, error } = await supabase
    .from("news_likes")
    .select("user_id")
    .in("item_id", itemIds);
  if (error) return [];
  const userIds = [
    ...new Set((data ?? []).map((x: { user_id: string }) => x.user_id)),
  ];
  if (!userIds.length) return [];
  const { data: sibas, error: sibErr } = await supabase
    .from("siba_map_markers")
    .select(
      "id,siba_user_id,siba_name,siba_icon,photos,community_title,community_avatar_url,community_tg_link",
    )
    .in("siba_user_id", userIds);
  if (sibErr) return [];
  const rows = (sibas ?? []) as NewsLikesListRow[];
  const byUser = new Map<string, NewsLikesListRow>();
  for (const row of rows) {
    if (!byUser.has(row.siba_user_id)) byUser.set(row.siba_user_id, row);
  }
  return userIds
    .map((uid) => byUser.get(uid))
    .filter(Boolean) as NewsLikesListRow[];
}
