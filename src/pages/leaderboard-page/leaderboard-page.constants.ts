import { IconGlobe, IconHouse, IconTg } from "../../shared/icons";
import type { LeaderboardTab } from "./leaderboard-page.types";

/** Формула баллов: level * PER_LEVEL + followers * PER_FOLLOWER */
export const LEADERBOARD_POINTS_PER_LEVEL = 100;
export const LEADERBOARD_POINTS_PER_FOLLOWER = 5;

export const LEADERBOARD_PAGE_TITLE = "Лидеры Сиба-мира";
export const LEADERBOARD_PAGE_SUBTITLE = "Топ сиб, питомников и сообществ";
export const LEADERBOARD_BREEDERS_EMPTY_HINT =
  "Пока нет заводчиков в рейтинге — как только они появятся в приложении, список заполнится.";
export const LEADERBOARD_LOAD_ERROR =
  "Не удалось загрузить данные рейтинга. Проверь сеть и попробуй ещё раз.";
export const LEADERBOARD_EMPTY_WORLD_HINT =
  "Пока никого нет в рейтинге — как только сибы появятся на карте, список обновится.";
export const LEADERBOARD_RETRY_LABEL = "Повторить";

export const LEADERBOARD_SKELETON_ROW_COUNT = 6;
export const LEADERBOARD_SKELETON_ROW_HEIGHT_PX = 88;

export const LEADERBOARD_MEDIA_MOBILE = "(max-width:600px)";

/** Фон-плейсхолдер под аватар чата без картинки */
export const LEADERBOARD_CHAT_AVATAR_FALLBACK_BG = "#FFF4DE";

export const LEADERBOARD_SIBA_DRAWER_PAPER_SX = {
  height: "auto",
  maxHeight: "90dvh",
  padding: "12px",
  overflowY: "auto",
  overscrollBehavior: "contain",
  borderTopLeftRadius: 16,
  borderTopRightRadius: 16,
} as const;

export const LEADERBOARD_SIBA_DIALOG_PAPER_SX = {
  borderRadius: 2,
  maxHeight: "90dvh",
  overflowY: "auto",
  padding: "12px",
} as const;

export const LEADERBOARD_QUERY_KEYS = {
  sibas: ["leaderboard", "sibas"] as const,
  kennelLinks: ["leaderboard", "siba-kennel-links"] as const,
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
