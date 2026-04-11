import { IconGlobe, IconHouse, IconTg } from "../../shared/icons";
import type { LeaderboardTab } from "./leaderboard-page.types";

/** Формула баллов: level * PER_LEVEL + followers * PER_FOLLOWER */
export const LEADERBOARD_POINTS_PER_LEVEL = 100;
export const LEADERBOARD_POINTS_PER_FOLLOWER = 5;

export const LEADERBOARD_PAGE_TITLE = "Лидеры Сиба-мира";
export const LEADERBOARD_PAGE_SUBTITLE = "Топ сиб, питомников и сообществ";
export const LEADERBOARD_BREEDERS_EMPTY_HINT =
  "Пока нет заводчиков в рейтинге — как только они появятся в приложении, список заполнится.";

export const LEADERBOARD_QUERY_KEYS = {
  sibas: ["leaderboard", "sibas"] as const,
  communities: ["leaderboard", "communities"] as const,
  memberships: ["leaderboard", "community-memberships"] as const,
};

export const LEADERBOARD_TABS: Array<{
  key: LeaderboardTab;
  label: string;
  Icon: typeof IconGlobe | typeof IconHouse | typeof IconTg;
}> = [
  { key: "world", label: "Весь мир", Icon: IconGlobe },
  { key: "breeders", label: "Заводчики", Icon: IconHouse },
  { key: "chats", label: "Чаты", Icon: IconTg },
];
