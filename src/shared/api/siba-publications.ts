import { supabase } from "./supabase-сlient";
import type { ShibaType } from "../types";
import {
  isLikelyImageFile,
  resizeImageFileToJpeg,
} from "../utils/image-avatar-prep";
import { uploadImageFileLikePlaceForm } from "../utils/places-bucket-upload";

export type SibaPublicationRow = {
  id: string;
  siba_id: string;
  created_by: string;
  image_url: string;
  created_at: string;
};

const DAY_MS = 24 * 60 * 60 * 1000;

export function publicationsSinceIso(): string {
  return new Date(Date.now() - DAY_MS).toISOString();
}

export async function fetchSibaPublications(sibaId: string): Promise<SibaPublicationRow[]> {
  const { data, error } = await supabase
    .from("siba_publications")
    .select("id,siba_id,created_by,image_url,created_at")
    .eq("siba_id", sibaId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as SibaPublicationRow[];
}

export async function fetchPublicationsForStoriesStrip(): Promise<
  Pick<SibaPublicationRow, "siba_id" | "image_url" | "created_at">[]
> {
  const { data, error } = await supabase
    .from("siba_publications")
    .select("siba_id,image_url,created_at")
    .gte("created_at", publicationsSinceIso())
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as Pick<SibaPublicationRow, "siba_id" | "image_url" | "created_at">[];
}

/** Одна карточка на сибу: последняя публикация за сутки (для кружка в ленте). */
export function latestPublicationBySiba(
  rows: Pick<SibaPublicationRow, "siba_id" | "image_url" | "created_at">[],
): Map<string, { image_url: string; created_at: string }> {
  const map = new Map<string, { image_url: string; created_at: string }>();
  for (const row of rows) {
    if (!map.has(row.siba_id)) {
      map.set(row.siba_id, { image_url: row.image_url, created_at: row.created_at });
    }
  }
  return map;
}

export async function insertSibaPublication(params: {
  sibaId: string;
  authUserId: string;
  imageUrl: string;
}): Promise<SibaPublicationRow> {
  const { data, error } = await supabase
    .from("siba_publications")
    .insert({
      siba_id: params.sibaId,
      created_by: params.authUserId,
      image_url: params.imageUrl.trim(),
    })
    .select("id,siba_id,created_by,image_url,created_at")
    .single();
  if (error) throw error;
  return data as SibaPublicationRow;
}

export async function publishSibaStoryFromFile(params: {
  file: File;
  authUserId: string;
  sibaId: string;
}): Promise<void> {
  if (!isLikelyImageFile(params.file)) {
    throw new Error("Нужен файл изображения.");
  }
  const jpeg = await resizeImageFileToJpeg(params.file, {
    maxEdge: 1080,
    quality: 0.88,
    filename: "publication.jpg",
  });
  const url = await uploadImageFileLikePlaceForm(params.authUserId, jpeg);
  await insertSibaPublication({
    sibaId: params.sibaId,
    authUserId: params.authUserId,
    imageUrl: url,
  });
}

export type StoryRingItem = {
  sibaId: string;
  previewUrl: string;
  siba: Pick<ShibaType, "id" | "siba_name" | "siba_icon" | "photos">;
};

export async function fetchStoryRingsForNews(): Promise<StoryRingItem[]> {
  const rows = await fetchPublicationsForStoriesStrip();
  const bySiba = latestPublicationBySiba(rows);
  const sibaIds = [...bySiba.keys()];
  if (!sibaIds.length) return [];

  const { data: sibas, error } = await supabase
    .from("siba_map_markers")
    .select("id,siba_name,siba_icon,photos")
    .in("id", sibaIds);
  if (error) throw error;
  const list = (sibas ?? []) as Pick<ShibaType, "id" | "siba_name" | "siba_icon" | "photos">[];
  const byId = new Map(list.map((s) => [s.id, s]));

  const out: StoryRingItem[] = [];
  for (const sibaId of sibaIds) {
    const siba = byId.get(sibaId);
    const pub = bySiba.get(sibaId);
    if (siba && pub) {
      out.push({ sibaId, previewUrl: pub.image_url, siba });
    }
  }
  return out;
}

/** Удалить публикацию (лайки с тем же item_id в news_likes убираем отдельно). */
export async function deleteSibaPublicationById(publicationId: string): Promise<void> {
  await supabase.from("news_likes").delete().eq("item_id", publicationId);
  const { error } = await supabase
    .from("siba_publications")
    .delete()
    .eq("id", publicationId);
  if (error) throw error;
}

export async function fetchSibaPublicationsLast24h(
  sibaId: string,
): Promise<SibaPublicationRow[]> {
  const { data, error } = await supabase
    .from("siba_publications")
    .select("id,siba_id,created_by,image_url,created_at")
    .eq("siba_id", sibaId)
    .gte("created_at", publicationsSinceIso())
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as SibaPublicationRow[];
}
