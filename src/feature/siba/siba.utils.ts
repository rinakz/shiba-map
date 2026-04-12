import type { SibaStatus, ShibaType } from "../../shared/types";
import { shibaSkills } from "../../pages/profile-page/shiba-academy.data";
import { SIBA_KNOWN_COMMANDS_PREVIEW_LIMIT, SIBA_STATUS_CLASS_SUFFIX } from "./siba.constants";

type SassModule = Record<string, string>;

export function visitStatsTotal(
  siba: Pick<ShibaType, "cafe" | "park" | "groomer"> | undefined,
): number {
  if (!siba) return 0;
  return (siba.cafe ?? 0) + (siba.park ?? 0) + (siba.groomer ?? 0);
}

export function profileDisplayNameFromContext(params: {
  isBreederView: boolean;
  kennelName?: string | null;
  sibaName?: string | null;
}): string {
  if (params.isBreederView && params.kennelName?.trim()) {
    return params.kennelName.trim();
  }
  return params.sibaName ?? "";
}

export function mapLearnedSkillsToKnownCommands(
  learnedSkillIds: string[],
  limit = SIBA_KNOWN_COMMANDS_PREVIEW_LIMIT,
): (typeof shibaSkills)[number][] {
  return learnedSkillIds
    .map((skillId) => shibaSkills.find((skill) => skill.id === skillId))
    .filter((skill): skill is (typeof shibaSkills)[number] => Boolean(skill))
    .slice(0, limit);
}

export function friendsListTitle(
  listMode: "followers" | "followings" | null,
): string {
  return listMode === "followers" ? "Подписчики" : "Подписки";
}

export function friendsListFromMode(
  listMode: "followers" | "followings" | null,
  followersList: ShibaType[],
  followingsList: ShibaType[],
): ShibaType[] {
  if (listMode === "followers") return followersList;
  if (listMode === "followings") return followingsList;
  return [];
}

export function getSibaStatusStyleClasses(
  stls: SassModule,
  status: SibaStatus | null,
): {
  statusToneClass: string | undefined;
  statusCapsuleToneClass: string | undefined;
  statusDotToneClass: string | undefined;
} {
  if (!status) {
    return {
      statusToneClass: undefined,
      statusCapsuleToneClass: undefined,
      statusDotToneClass: undefined,
    };
  }
  const suffix = SIBA_STATUS_CLASS_SUFFIX[status];
  return {
    statusToneClass: stls[`status${suffix}`],
    statusCapsuleToneClass: stls[`statusCapsule${suffix}`],
    statusDotToneClass: stls[`statusDot${suffix}`],
  };
}
