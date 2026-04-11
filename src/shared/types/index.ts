export type SibaStatus =
  | "walk"
  | "training"
  | "angry"
  | "heat"
  | "sick"
  | "girls_only"
  | "boys_only";

export type ShibaType = {
  id: string;
  siba_user_id: string;
  siba_name: string;
  siba_icon: string;
  siba_gender: string;
  coordinates: number[] | string[];
  photos?: string | null;
  want_to_walk?: boolean | null;
  status?: SibaStatus | null;
  cafe?: number | null;
  park?: number | null;
  groomer?: number | null;
  followers?: number | null;
  followings?: number | null;
  level?: number | null;
  community_id?: string | null;
  community_title?: string | null;
  community_avatar_url?: string | null;
  community_tg_link?: string | null;
  // Computed on the server in `public.siba_map_markers` (photo OR invited_by_code).
  is_verified?: boolean | null;
  /** Из users.account_type; для маркера заводчика на карте — иконка питомника. */
  account_type?: "owner" | "breeder" | string | null;
};

export type Community = {
  id: string;
  title: string;
  tg_link: string;
  avatar_url?: string | null;
  created_by?: string | null;
  created_at?: string;
  updated_at?: string;
  member_count?: number;
  energy?: number;
};

export type ShibaUser = {
  user_id: string;
  email: string;
  nickname: string;
  tgname: string;
  is_show_tgname: boolean;
  promo_code?: string;
  invited_by_code?: string | null;
  account_type?: "owner" | "breeder" | null;
  kennel_name?: string | null;
  kennel_city?: string | null;
  kennel_prefix?: string | null;
  community_id?: string | null;
  community_title?: string | null;
  community_avatar_url?: string | null;
  community_tg_link?: string | null;
};
