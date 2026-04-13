import type { SibaKennelLinkRow } from "../profile-page/profile.utils";
import type { Community, ShibaType } from "../../shared/types";
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

export const sortSibasByLevelThenFollowers = (
  a: ShibaType,
  b: ShibaType,
): number => {
  const levelDiff = (b.level ?? 0) - (a.level ?? 0);
  if (levelDiff !== 0) return levelDiff;
  return (b.followers ?? 0) - (a.followers ?? 0);
};

/** Сумма уровней выпускников питомника в приложении (без анкеты заводчика), только владельцы. */
export const computeBreederTraineeLevelSumByBreeder = (
  sibas: ShibaType[],
  links: SibaKennelLinkRow[],
): Map<string, number> => {
  const allById = new Map(sibas.map((s) => [String(s.id), s]));
  const kennelMembers = new Map<string, string[]>();
  for (const row of links) {
    const k = String(row.kennel_id);
    const sid = String(row.siba_id);
    const arr = kennelMembers.get(k);
    if (arr) arr.push(sid);
    else kennelMembers.set(k, [sid]);
  }
  const levelSumByBreeder = new Map<string, number>();
  const breeders = sibas.filter((s) => s.account_type === "breeder");
  for (const b of breeders) {
    const bId = String(b.id);
    const myKennels = new Set(
      links
        .filter((l) => String(l.siba_id) === bId)
        .map((l) => String(l.kennel_id)),
    );
    const traineeIds = new Set<string>();
    for (const kid of myKennels) {
      for (const sid of kennelMembers.get(kid) ?? []) {
        if (sid !== bId) traineeIds.add(sid);
      }
    }
    let sumLv = 0;
    for (const sid of traineeIds) {
      const s = allById.get(sid);
      if (s && s.account_type !== "breeder") {
        sumLv += s.level ?? 0;
      }
    }
    levelSumByBreeder.set(bId, sumLv);
  }
  return levelSumByBreeder;
};

export const buildWorldLeaderboard = (
  sibas: ShibaType[],
): LeaderboardSibaRow[] => {
  const ownersOnly = sibas.filter((s) => s.account_type !== "breeder");
  return [...ownersOnly].sort(sortSibasByLevelThenFollowers).map((siba, index) => ({
    ...siba,
    place: index + 1,
  }));
};

export const buildBreederLeaderboard = (
  sibas: ShibaType[],
  links: SibaKennelLinkRow[],
): LeaderboardSibaRow[] => {
  const breedersOnly = sibas.filter((s) => s.account_type === "breeder");
  const levelSumByBreeder = computeBreederTraineeLevelSumByBreeder(sibas, links);
  const sorted = [...breedersOnly].sort((a, b) => {
    const lb = levelSumByBreeder.get(String(b.id)) ?? 0;
    const la = levelSumByBreeder.get(String(a.id)) ?? 0;
    if (lb !== la) return lb - la;
    return sortSibasByLevelThenFollowers(a, b);
  });
  return sorted.map((siba, index) => {
    const id = String(siba.id);
    return {
      ...siba,
      place: index + 1,
      level: levelSumByBreeder.get(id) ?? 0,
    };
  });
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
        return sum + (siba ? (siba.level ?? 0) : 0);
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
