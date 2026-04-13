import type { FeedItem } from "../../shared/header/news-panel/news-panel.types";

/** Данные сибы при открытии сторис из ленты (аватар в просмотрщике). */
export type NewsStoryViewerOpenPayload = {
  sibaId: string;
  sibaName: string;
  photos: string | null;
  siba_icon: string;
};

export type NewsFeedGroupSheetState = {
  variant: "subscriptions" | "visits";
  title: string;
  items: FeedItem[];
};

export type NewsLikesListRow = {
  id: string;
  siba_user_id: string;
  siba_name: string;
  siba_icon: string;
  photos: string | null;
  community_id?: string | null;
  community_title?: string | null;
  community_avatar_url?: string | null;
  community_tg_link?: string | null;
};
