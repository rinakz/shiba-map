/** Совпадает с $breeder-feed-accent в news-page.module.sass */
export const NEWS_BREEDER_FEED_ACCENT = "#5E7C8C";

export const NEWS_PAGE_SIZE = 20;

export const NEWS_MEDIA_MOBILE = "(max-width:600px)";

export const NEWS_FEED_INTERSECTION_ROOT_MARGIN = "320px";

export const NEWS_TOAST_MS = 1800;

export const NEWS_WALKING_SKELETON_COUNT = 8;
export const NEWS_WALKING_MAX_STORIES = 12;

export const NEWS_HEADER_EYEBROW = "Activity Feed";
export const NEWS_HEADER_TITLE = "События стаи";

export const NEWS_WALKING_TITLE = "Сегодня гуляют";
export const NEWS_WALKING_EMPTY_TEXT = "Пока никто не нажал «Хочу гулять»";

export const NEWS_LEADERBOARD_TITLE = "Лидеры Сиба-мира";
export const NEWS_LEADERBOARD_SUBTITLE = "Сибы, заводчики и чаты";

export const NEWS_EMPTY_FEED = "Пока нет новостей";
export const NEWS_LIKES_SHEET_TITLE = "Лайкнули";
export const NEWS_LIKES_EMPTY = "Пока нет лайков";

export const NEWS_EXPERT_COMPOSER_LABEL = "Пост питомника";
export const NEWS_EXPERT_PLACEHOLDER =
  "Совет дня, новости питомника, гордость за выпускника…";
export const NEWS_EXPERT_PUBLISH = "Опубликовать";

export const NEWS_DRAWER_SX_STANDARD = {
  height: "auto",
  maxHeight: "90dvh",
  padding: "12px",
  overflowY: "auto",
  overscrollBehavior: "contain",
  borderTopLeftRadius: 16,
  borderTopRightRadius: 16,
} as const;

export const NEWS_DRAWER_SX_SIBA = {
  height: "auto",
  maxHeight: "90dvh",
  overflowY: "auto",
  overscrollBehavior: "contain",
  borderTopLeftRadius: 16,
  borderTopRightRadius: 16,
  padding: "12px",
} as const;

export const NEWS_DRAWER_SX_PLACE = {
  height: "auto",
  maxHeight: "85dvh",
  overflowY: "auto",
  overscrollBehavior: "contain",
  borderTopLeftRadius: 16,
  borderTopRightRadius: 16,
  padding: "12px",
} as const;

export const NEWS_DIALOG_SX_SIBA_PLACE = {
  borderRadius: 2,
  maxHeight: "90dvh",
  overflowY: "auto",
  padding: "12px",
} as const;

export const NEWS_DIALOG_SX_COMPACT = {
  borderRadius: 2,
} as const;
