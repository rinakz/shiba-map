export type PlaceKind = "cafe" | "park" | "groomer";

export type Place = {
  id: string;
  name: string;
  address: string;
  coordinates: number[] | string[];
  photo?: string | null;
  created_by?: string | null;
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
