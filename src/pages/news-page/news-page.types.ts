import type { FeedItem } from "../../shared/header/news-panel/news-panel.types";

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
  community_title?: string | null;
  community_avatar_url?: string | null;
  community_tg_link?: string | null;
};
