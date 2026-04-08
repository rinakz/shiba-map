import { supabase } from "./supabase-сlient";
import type { Community } from "../types";

const normalizeTelegramLink = (value: string) => {
  const trimmed = value.trim();
  if (!trimmed) return "";
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed;
  }
  if (trimmed.startsWith("t.me/")) return `https://${trimmed}`;
  if (trimmed.startsWith("@")) return `https://t.me/${trimmed.slice(1)}`;
  return `https://t.me/${trimmed}`;
};

export const fetchUserCommunity = async (userId: string) => {
  const { data: membership, error: membershipError } = await supabase
    .from("user_community_memberships")
    .select("community_id")
    .eq("user_id", userId)
    .maybeSingle();
  if (membershipError) throw membershipError;
  if (!membership?.community_id) return null;

  const { data: community, error: communityError } = await supabase
    .from("communities")
    .select("*")
    .eq("id", membership.community_id)
    .maybeSingle();
  if (communityError) throw communityError;
  return (community as Community | null) ?? null;
};

export const fetchAllCommunities = async () => {
  const { data, error } = await supabase
    .from("communities")
    .select("*")
    .order("updated_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as Community[];
};

export const fetchCommunityMemberships = async () => {
  const { data, error } = await supabase
    .from("user_community_memberships")
    .select("user_id,community_id,joined_at");
  if (error) throw error;
  return (data ?? []) as Array<{
    user_id: string;
    community_id: string;
    joined_at: string;
  }>;
};

export const saveUserCommunity = async (params: {
  authUserId: string;
  title: string;
  tgLink: string;
  avatarUrl: string;
}) => {
  const { authUserId, title, tgLink, avatarUrl } = params;
  const normalizedTitle = title.trim();
  const normalizedLink = normalizeTelegramLink(tgLink);
  const normalizedAvatar = avatarUrl.trim() || null;

  if (!normalizedTitle && !normalizedLink && !normalizedAvatar) {
    const { error } = await supabase
      .from("user_community_memberships")
      .delete()
      .eq("user_id", authUserId);
    if (error) throw error;
    return null;
  }

  if (!normalizedTitle || !normalizedLink) {
    throw new Error("Для сообщества нужны название и ссылка.");
  }

  const { data: community, error: upsertError } = await supabase
    .from("communities")
    .upsert(
      {
        title: normalizedTitle,
        tg_link: normalizedLink,
        avatar_url: normalizedAvatar,
        created_by: authUserId,
      },
      { onConflict: "tg_link" },
    )
    .select("*")
    .single();
  if (upsertError) throw upsertError;

  const { error: membershipError } = await supabase
    .from("user_community_memberships")
    .upsert(
      {
        user_id: authUserId,
        community_id: community.id,
      },
      { onConflict: "user_id" },
    );
  if (membershipError) throw membershipError;

  return community as Community;
};

export const assignUserToCommunity = async (params: {
  authUserId: string;
  communityId: string;
}) => {
  const { authUserId, communityId } = params;
  const { error } = await supabase
    .from("user_community_memberships")
    .upsert(
      {
        user_id: authUserId,
        community_id: communityId,
      },
      { onConflict: "user_id" },
    );
  if (error) throw error;
};

export const clearUserCommunity = async (authUserId: string) => {
  const { error } = await supabase
    .from("user_community_memberships")
    .delete()
    .eq("user_id", authUserId);
  if (error) throw error;
};

export const deleteCommunity = async (communityId: string) => {
  const { error } = await supabase.from("communities").delete().eq("id", communityId);
  if (error) throw error;
};
