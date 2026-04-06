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
  // Computed on the server in `public.siba_map_markers` (photo OR invited_by_code).
  is_verified?: boolean | null;
};

export type ShibaUser = {
  user_id: string;
  email: string;
  nickname: string;
  tgname: string;
  is_show_tgname: boolean;
  promo_code?: string;
  invited_by_code?: string | null;
};
