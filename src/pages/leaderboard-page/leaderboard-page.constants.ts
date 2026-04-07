import { IconGlobe, IconTg } from "../../shared/icons";
import type { LeaderboardTab } from "./leaderboard-page.types";

export const LEADERBOARD_QUERY_KEYS = {
  sibas: ["leaderboard", "sibas"] as const,
  communities: ["leaderboard", "communities"] as const,
  memberships: ["leaderboard", "community-memberships"] as const,
};

export const LEADERBOARD_TABS: Array<{
  key: LeaderboardTab;
  label: string;
  Icon: typeof IconGlobe;
}> = [
  { key: "world", label: "Весь мир", Icon: IconGlobe },
  { key: "chats", label: "Чаты", Icon: IconTg },
];
