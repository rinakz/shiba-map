import { shibaSkills } from "../../../pages/profile-page/shiba-academy.data";
import { supabase } from "../../api/supabase-сlient";
import type { Place, PlaceKind } from "../../../feature/map/place-types";
import type { FeedItem, SibaNewsRow } from "./news-panel.types";

export const buildSafeAvatarSrc = (photo: string | null, icon: string) => {
  if (!photo) return `/${icon}.png`;
  const trimmed = photo.trim();
  if (!trimmed) return `/${icon}.png`;
  const lowered = trimmed.toLowerCase();
  if (lowered.includes("undefined") || lowered.includes("null")) {
    return `/${icon}.png`;
  }
  if (trimmed.startsWith("/") || trimmed.startsWith("data:image/")) {
    return trimmed;
  }
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    try {
      const parsed = new URL(trimmed);
      if (!parsed.hostname || parsed.hostname === "undefined") {
        return `/${icon}.png`;
      }
      return trimmed;
    } catch {
      return `/${icon}.png`;
    }
  }
  return `/${icon}.png`;
};

export const fetchNewsFeed = async (authUserId: string) => {
  const { data: followers, error: followersErr } = await supabase
    .from("user_friends")
    .select("user_id")
    .eq("friend_user_id", authUserId);
  if (followersErr) throw followersErr;
  const followerIds = (followers ?? []).map((x: { user_id: string }) => x.user_id);
  if (!followerIds.length) return [] as FeedItem[];

  const { data: sibas, error: sibasErr } = await supabase
    .from("siba_map_markers")
    .select("id,siba_user_id,siba_name,siba_icon,photos,community_title,community_avatar_url,community_tg_link")
    .in("siba_user_id", followerIds);
  if (sibasErr) throw sibasErr;
  const typedSibas = (sibas ?? []) as SibaNewsRow[];
  const sibaById = new Map<string, SibaNewsRow>(typedSibas.map((s) => [s.id, s]));

  const sibaIds = typedSibas.map((s) => s.id);
  if (!sibaIds.length) return [] as FeedItem[];

  const [cafes, parks, groomers] = await Promise.all([
    supabase.from("cafes").select("*"),
    supabase.from("parks").select("*"),
    supabase.from("groomers").select("*"),
  ]);
  const placeByKey = new Map<string, { kind: PlaceKind; place: Place }>();
  (cafes.data ?? []).forEach((p: Place) =>
    placeByKey.set(`cafe:${p.id}`, { kind: "cafe", place: p }),
  );
  (parks.data ?? []).forEach((p: Place) =>
    placeByKey.set(`park:${p.id}`, { kind: "park", place: p }),
  );
  (groomers.data ?? []).forEach((p: Place) =>
    placeByKey.set(`groomer:${p.id}`, { kind: "groomer", place: p }),
  );

  const [cafeVisits, parkVisits, groomerVisits] = await Promise.all([
    supabase
      .from("siba_cafe_visits")
      .select("id,cafe_id,siba_id,visited_at")
      .in("siba_id", sibaIds)
      .order("visited_at", { ascending: false })
      .limit(20),
    supabase
      .from("siba_park_visits")
      .select("id,place_id,siba_id,visited_at")
      .in("siba_id", sibaIds)
      .order("visited_at", { ascending: false })
      .limit(20),
    supabase
      .from("siba_groomer_visits")
      .select("id,place_id,siba_id,visited_at")
      .in("siba_id", sibaIds)
      .order("visited_at", { ascending: false })
      .limit(20),
  ]);

  const visitItems: FeedItem[] = [];
  (cafeVisits.data ?? []).forEach(
    (v: { id: string; cafe_id: string; siba_id: string; visited_at: string }) => {
      const siba = sibaById.get(v.siba_id);
      const place = placeByKey.get(`cafe:${v.cafe_id}`);
      if (!siba || !place) return;
      visitItems.push({
        id: `vc-${v.id}`,
        date: v.visited_at,
        actorSibaId: siba.id,
        actorSibaName: siba.siba_name,
        actorSibaAvatar: buildSafeAvatarSrc(siba.photos, siba.siba_icon),
        actorCommunityTitle: siba.community_title,
        actorCommunityAvatarUrl: siba.community_avatar_url,
        actorCommunityTgLink: siba.community_tg_link,
        verb: "сегодня посетил",
        place,
      });
    },
  );
  (parkVisits.data ?? []).forEach(
    (v: { id: string; place_id: string; siba_id: string; visited_at: string }) => {
      const siba = sibaById.get(v.siba_id);
      const place = placeByKey.get(`park:${v.place_id}`);
      if (!siba || !place) return;
      visitItems.push({
        id: `vp-${v.id}`,
        date: v.visited_at,
        actorSibaId: siba.id,
        actorSibaName: siba.siba_name,
        actorSibaAvatar: buildSafeAvatarSrc(siba.photos, siba.siba_icon),
        actorCommunityTitle: siba.community_title,
        actorCommunityAvatarUrl: siba.community_avatar_url,
        actorCommunityTgLink: siba.community_tg_link,
        verb: "сегодня посетил",
        place,
      });
    },
  );
  (groomerVisits.data ?? []).forEach(
    (v: { id: string; place_id: string; siba_id: string; visited_at: string }) => {
      const siba = sibaById.get(v.siba_id);
      const place = placeByKey.get(`groomer:${v.place_id}`);
      if (!siba || !place) return;
      visitItems.push({
        id: `vg-${v.id}`,
        date: v.visited_at,
        actorSibaId: siba.id,
        actorSibaName: siba.siba_name,
        actorSibaAvatar: buildSafeAvatarSrc(siba.photos, siba.siba_icon),
        actorCommunityTitle: siba.community_title,
        actorCommunityAvatarUrl: siba.community_avatar_url,
        actorCommunityTgLink: siba.community_tg_link,
        verb: "сегодня посетил",
        place,
      });
    },
  );

  const [newCafes, newParks, newGroomers] = await Promise.all([
    supabase
      .from("cafes")
      .select("*")
      .in("created_by", followerIds)
      .order("created_at", { ascending: false })
      .limit(10),
    supabase
      .from("parks")
      .select("*")
      .in("created_by", followerIds)
      .order("created_at", { ascending: false })
      .limit(10),
    supabase
      .from("groomers")
      .select("*")
      .in("created_by", followerIds)
      .order("created_at", { ascending: false })
      .limit(10),
  ]);

  const sibaByUser = new Map<string, SibaNewsRow>(
    typedSibas.map((s) => [s.siba_user_id, s]),
  );
  const createItems: FeedItem[] = [];
  (newCafes.data ?? []).forEach(
    (p: Place & { created_by?: string; created_at?: string }) => {
      const s = p.created_by ? sibaByUser.get(p.created_by) : null;
      if (!s) return;
      createItems.push({
        id: `ac-${p.id}`,
        date: p.created_at ?? new Date().toISOString(),
        actorSibaId: s.id,
        actorSibaName: s.siba_name,
        actorSibaAvatar: buildSafeAvatarSrc(s.photos, s.siba_icon),
        actorCommunityTitle: s.community_title,
        actorCommunityAvatarUrl: s.community_avatar_url,
        actorCommunityTgLink: s.community_tg_link,
        verb: "добавил кафе",
        place: { kind: "cafe", place: p },
      });
    },
  );
  (newParks.data ?? []).forEach(
    (p: Place & { created_by?: string; created_at?: string }) => {
      const s = p.created_by ? sibaByUser.get(p.created_by) : null;
      if (!s) return;
      createItems.push({
        id: `ap-${p.id}`,
        date: p.created_at ?? new Date().toISOString(),
        actorSibaId: s.id,
        actorSibaName: s.siba_name,
        actorSibaAvatar: buildSafeAvatarSrc(s.photos, s.siba_icon),
        actorCommunityTitle: s.community_title,
        actorCommunityAvatarUrl: s.community_avatar_url,
        actorCommunityTgLink: s.community_tg_link,
        verb: "добавил парк",
        place: { kind: "park", place: p },
      });
    },
  );
  (newGroomers.data ?? []).forEach(
    (p: Place & { created_by?: string; created_at?: string }) => {
      const s = p.created_by ? sibaByUser.get(p.created_by) : null;
      if (!s) return;
      createItems.push({
        id: `ag-${p.id}`,
        date: p.created_at ?? new Date().toISOString(),
        actorSibaId: s.id,
        actorSibaName: s.siba_name,
        actorSibaAvatar: buildSafeAvatarSrc(s.photos, s.siba_icon),
        actorCommunityTitle: s.community_title,
        actorCommunityAvatarUrl: s.community_avatar_url,
        actorCommunityTgLink: s.community_tg_link,
        verb: "добавил грумера",
        place: { kind: "groomer", place: p },
      });
    },
  );

  const friendshipRows: Array<{
    user_id: string;
    friend_user_id: string;
    created_at?: string | null;
  }> = await (async () => {
    const withCreated = await supabase
      .from("user_friends")
      .select("user_id,friend_user_id,created_at")
      .or(
        `user_id.in.(${followerIds.join(",")}),friend_user_id.in.(${followerIds.join(",")})`,
      )
      .limit(60);
    if (!withCreated.error) {
      return (withCreated.data ?? []) as Array<{
        user_id: string;
        friend_user_id: string;
        created_at?: string | null;
      }>;
    }
    const withoutCreated = await supabase
      .from("user_friends")
      .select("user_id,friend_user_id")
      .or(
        `user_id.in.(${followerIds.join(",")}),friend_user_id.in.(${followerIds.join(",")})`,
      )
      .limit(60);
    if (withoutCreated.error) throw withoutCreated.error;
    return (withoutCreated.data ?? []) as Array<{
      user_id: string;
      friend_user_id: string;
      created_at?: string | null;
    }>;
  })();

  const usersForSubs = Array.from(
    new Set(friendshipRows.flatMap((r) => [r.user_id, r.friend_user_id])),
  );
  const { data: allSubsSibas, error: allSubsSibasErr } = await supabase
    .from("siba_map_markers")
    .select("id,siba_user_id,siba_name,siba_icon,photos,community_title,community_avatar_url,community_tg_link")
    .in("siba_user_id", usersForSubs);
  if (allSubsSibasErr) throw allSubsSibasErr;
  const subByUser = new Map<string, SibaNewsRow>(
    ((allSubsSibas ?? []) as SibaNewsRow[]).map((s) => [s.siba_user_id, s]),
  );

  const subscriptionItems: FeedItem[] = [];
  friendshipRows.forEach((r, idx) => {
    const from = subByUser.get(r.user_id);
    const to = subByUser.get(r.friend_user_id);
    if (!from || !to) return;
    subscriptionItems.push({
      id: `sub-${r.user_id}-${r.friend_user_id}-${idx}`,
      date: r.created_at ?? new Date().toISOString(),
      actorSibaId: from.id,
      actorSibaName: from.siba_name,
      actorSibaAvatar: buildSafeAvatarSrc(from.photos, from.siba_icon),
      actorCommunityTitle: from.community_title,
      actorCommunityAvatarUrl: from.community_avatar_url,
      actorCommunityTgLink: from.community_tg_link,
      verb: "подписался на",
      targetSiba: {
        id: to.id,
        name: to.siba_name,
      },
    });
  });

  const { data: academyRows, error: academyErr } = await supabase
    .from("siba_academy_progress")
    .select("siba_id,learned_skill_ids,updated_at")
    .in("siba_id", sibaIds)
    .order("updated_at", { ascending: false })
    .limit(30);
  if (academyErr) throw academyErr;
  const skillNameById = new Map(shibaSkills.map((skill) => [skill.id, skill.name]));
  const academyItems: FeedItem[] = [];
  (academyRows ?? []).forEach(
    (row: { siba_id: string; learned_skill_ids: string[] | null; updated_at: string }) => {
      const siba = sibaById.get(row.siba_id);
      if (!siba) return;
      const learned = row.learned_skill_ids ?? [];
      const latestSkillId = learned[learned.length - 1];
      if (!latestSkillId) return;
      const commandName = skillNameById.get(latestSkillId);
      if (!commandName) return;
      academyItems.push({
        id: `acmd-${row.siba_id}-${latestSkillId}-${row.updated_at}`,
        date: row.updated_at,
        actorSibaId: siba.id,
        actorSibaName: siba.siba_name,
        actorSibaAvatar: buildSafeAvatarSrc(siba.photos, siba.siba_icon),
        actorCommunityTitle: siba.community_title,
        actorCommunityAvatarUrl: siba.community_avatar_url,
        actorCommunityTgLink: siba.community_tg_link,
        verb: "выучил команду",
        commandName,
      });
    },
  );

  return [...visitItems, ...createItems, ...subscriptionItems, ...academyItems]
    .sort((a, b) => +new Date(b.date) - +new Date(a.date))
    .slice(0, 40);
};
