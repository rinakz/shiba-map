import type { Community, ShibaType } from "../../shared/types";

export type LeaderboardTab = "world" | "breeders" | "chats";

/** Строка лидерборда сибы / питомника (вкладки «Весь мир» и «Заводчики»). */
export type LeaderboardSibaRow = ShibaType & {
  place: number;
};

export type SibaLeaderboardSubtitle = "owner" | "breeder";

export type CommunityMembershipRow = {
  user_id: string;
  community_id: string;
  joined_at: string;
};

export type CommunityRow = {
  id: string;
  title: string;
  avatarUrl: string | null;
  tgLink: string;
  participants: number;
  energy: number;
  gapToLeader: number;
  isLeader: boolean;
};

export type LeaderboardDataParams = {
  sibas: ShibaType[];
  communities: Community[];
  memberships: CommunityMembershipRow[];
};
