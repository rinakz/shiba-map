export type PlaceKind = "cafe" | "park" | "groomer";

export type Place = {
  id: string;
  name: string;
  address: string;
  coordinates: number[] | string[];
  photo?: string | null;
  photos?: string[] | null;
  description?: string | null;
  promo_code?: string | null;
  rating?: number | null;
  created_by?: string | null;
  created_at?: string;
};

export type PlaceVisit = {
  id: string;
  place_id: string;
  siba_id: string;
  visited_at: string;
  siba_name?: string;
  siba_icon?: string | null;
  siba_photo?: string | null;
};

export type PlaceRatingSummary = {
  average: number | null;
  total: number;
  myRating: number | null;
};
