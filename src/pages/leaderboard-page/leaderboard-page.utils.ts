import type { Community, ShibaType } from "../../shared/types";
import { getShibaRank } from "../profile-page/shiba-academy.data";
import {
  LEADERBOARD_POINTS_PER_FOLLOWER,
  LEADERBOARD_POINTS_PER_LEVEL,
} from "./leaderboard-page.constants";
import type {
  CommunityMembershipRow,
  CommunityRow,
  LeaderboardSibaRow,
} from "./leaderboard-page.types";

export const crownColorByPlace = (place: number): string => {
  if (place === 1) return "#FEAE11";
  if (place === 2) return "#C4CAD4";
  if (place === 3) return "#CD7F32";
  return "#E7E1D2";
};

export const computeSibaLeaderboardPoints = (
  level: number | null | undefined,
  followers: number | null | undefined,
): number =>
  (level ?? 0) * LEADERBOARD_POINTS_PER_LEVEL +
  (followers ?? 0) * LEADERBOARD_POINTS_PER_FOLLOWER;

const sortSibasByLevelThenFollowers = (a: ShibaType, b: ShibaType): number => {
  const levelDiff = (b.level ?? 0) - (a.level ?? 0);
  if (levelDiff !== 0) return levelDiff;
  return (b.followers ?? 0) - (a.followers ?? 0);
};

export const buildWorldLeaderboard = (
  sibas: ShibaType[],
): LeaderboardSibaRow[] => {
  const ownersOnly = sibas.filter((s) => s.account_type !== "breeder");
  return [...ownersOnly].sort(sortSibasByLevelThenFollowers).map((siba, index) => ({
    ...siba,
    place: index + 1,
    points: computeSibaLeaderboardPoints(siba.level, siba.followers),
    rankTitle: getShibaRank(siba.level ?? 0).rank?.rank ?? "Новичок",
  }));
};

export const buildBreederLeaderboard = (
  sibas: ShibaType[],
): LeaderboardSibaRow[] => {
  const breedersOnly = sibas.filter((s) => s.account_type === "breeder");
  return [...breedersOnly].sort(sortSibasByLevelThenFollowers).map((siba, index) => ({
    ...siba,
    place: index + 1,
    points: computeSibaLeaderboardPoints(siba.level, siba.followers),
  }));
};

export const buildChatLeaderboard = (
  communities: Community[],
  memberships: CommunityMembershipRow[],
  sibas: ShibaType[],
): CommunityRow[] => {
  const sibaByUser = new Map(sibas.map((siba) => [siba.siba_user_id, siba]));
  const sorted = communities
    .map((community) => {
      const members = memberships.filter(
        (membership) => membership.community_id === community.id,
      );
      const energy = members.reduce((sum, membership) => {
        const siba = sibaByUser.get(membership.user_id);
        return (
          sum + computeSibaLeaderboardPoints(siba?.level, siba?.followers)
        );
      }, 0);
      return {
        id: community.id,
        title: community.title,
        avatarUrl: community.avatar_url ?? null,
        tgLink: community.tg_link,
        participants: members.length,
        energy,
      };
    })
    .sort((a, b) => b.energy - a.energy);
  const leaderEnergy = sorted[0]?.energy ?? 0;

  return sorted.map((group, index) => ({
    id: group.id,
    title: group.title,
    avatarUrl: group.avatarUrl,
    tgLink: group.tgLink,
    participants: group.participants,
    energy: group.energy,
    gapToLeader: index === 0 ? 0 : Math.max(leaderEnergy - group.energy, 0),
    isLeader: index === 0,
  }));
};

export const chatEnergyBarPercent = (
  chatEnergy: number,
  leaderEnergy: number,
): number =>
  Math.max(8, Math.round((chatEnergy / Math.max(leaderEnergy, 1)) * 100));
