import {
  getSibaStatus,
  SIBA_STATUS_LABEL,
} from "../../shared/utils/siba-status";
import type {
  CommunityMembershipRow,
  CommunityRow,
  LeaderboardSibaRow,
  LeaderboardTab,
  SibaLeaderboardSubtitle,
} from "./leaderboard-page.types";

function breederFollowersLine(followers: number): string {
  const n = Math.max(0, Math.floor(followers));
  const abs = n % 100;
  const d = abs % 10;
  if (abs > 10 && abs < 20) return `${n} подписчиков`;
  if (d === 1) return `${n} подписчик`;
  if (d >= 2 && d <= 4) return `${n} подписчика`;
  return `${n} подписчиков`;
}

export function sibaLeaderboardStatusLine(
  item: LeaderboardSibaRow,
  subtitle: SibaLeaderboardSubtitle,
): string {
  if (subtitle === "breeder") {
    return breederFollowersLine(item.followers ?? 0);
  }
  const status = getSibaStatus(item);
  if (status) return SIBA_STATUS_LABEL[status];
  return "";
}

export function isLeaderboardListLoading(
  tab: LeaderboardTab,
  flags: {
    sibasLoading: boolean;
    kennelLoading: boolean;
    communitiesLoading: boolean;
    membershipsLoading: boolean;
  },
): boolean {
  if (flags.sibasLoading) return true;
  if (tab === "breeders" && flags.kennelLoading) return true;
  if (
    tab === "chats" &&
    (flags.communitiesLoading || flags.membershipsLoading)
  ) {
    return true;
  }
  return false;
}

export function findUserCommunityId(
  memberships: CommunityMembershipRow[],
  authUserId: string | null | undefined,
): string | null {
  const row = memberships.find((item) => item.user_id === authUserId);
  return row?.community_id ?? null;
}

export function findMyCommunityPlace(
  chatLeaderboard: CommunityRow[],
  myCommunityId: string | null,
): (CommunityRow & { place: number }) | null {
  if (!myCommunityId) return null;
  const index = chatLeaderboard.findIndex((item) => item.id === myCommunityId);
  if (index < 0) return null;
  return { ...chatLeaderboard[index], place: index + 1 };
}
