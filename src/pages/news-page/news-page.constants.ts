/** Совпадает с $breeder-feed-accent в news-page.module.sass */
export const NEWS_BREEDER_FEED_ACCENT = "#5E7C8C";

export const NEWS_PAGE_SIZE = 20;

export const NEWS_MEDIA_MOBILE = "(max-width:600px)";

export const NEWS_FEED_INTERSECTION_ROOT_MARGIN = "320px";

export const NEWS_TOAST_MS = 1800;

export const NEWS_HEADER_TITLE = "События стаи";

export const NEWS_STORIES_ADD_LABEL = "Моя история";
export const NEWS_STORIES_EMPTY_TEXT =
  "За последние сутки никто не выложил сторис";
export const NEWS_STORIES_SKELETON_COUNT = 6;

/** Максимум публикаций за последние 24 ч на одну сибу (сторис). */
export const NEWS_STORIES_MAX_PER_24H = 5;

export const NEWS_STORIES_LIMIT_HINT =
  "За сутки можно опубликовать не больше 5 сторис.";

export const NEWS_PUBLICATIONS_SKELETON_COUNT = 6;

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

/**
 * Выше дровера/диалога анкеты сибы (MUI modal/drawer обычно ~1200–1300),
 * чтобы сторис из «Публикаций» открывались поверх.
 */
export const NEWS_Z_INDEX_STORY_VIEWER = 1600;

/** Подтверждение удаления публикации — поверх просмотра сторис. */
export const NEWS_Z_INDEX_PUBLICATION_DELETE = 1750;

/** Список лайкнувших — поверх сторис (NewsResponsiveSheet). */
export const NEWS_Z_INDEX_LIKES_SHEET = 2000;

/** Полноразмерный просмотр сторис: ~90% высоты экрана, без вертикального скролла у Paper. */
export const NEWS_DIALOG_SX_STORY_VIEWER = {
  /** Строка: в `sx` число умножается на `theme.shape.borderRadius`, не пиксели. */
  borderRadius: "24px",
  width: "min(100vw - 24px, 480px)",
  height: "90dvh",
  maxHeight: "90dvh",
  display: "flex",
  flexDirection: "column",
  overflow: "hidden",
  padding: 0,
  margin: "10px auto",
  boxSizing: "border-box",
  border: "1px solid rgba(231, 225, 210, 0.75)",
  boxShadow: "0 12px 40px rgba(46, 45, 48, 0.12), 0 0 0 1px rgba(255, 252, 245, 0.4) inset",
} as const;

export const NEWS_DIALOG_SX_COMPACT = {
  borderRadius: 2,
} as const;
