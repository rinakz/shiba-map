export const SIBA_PHOTOS_BUCKET =
  (import.meta.env.VITE_SUPABASE_BUCKET as string | undefined) || "sibinator";

export const PLACES_PHOTOS_BUCKET =
  (import.meta.env.VITE_SUPABASE_PLACES_BUCKET as string | undefined) ||
  "places";

