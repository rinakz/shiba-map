import { supabase } from "../api/supabase-сlient";
import { PLACES_PHOTOS_BUCKET } from "../constants/storage";

/**
 * Точная копия загрузки из `place-form.tsx` / `cafe-form.tsx`:
 * тот же бакет, путь и опции, что при сохранении места.
 */
export async function uploadImageFileLikePlaceForm(
  authUserId: string | null | undefined,
  file: File,
): Promise<string> {
  const { data: up, error: upErr } = await supabase.storage
    .from(PLACES_PHOTOS_BUCKET)
    .upload(
      `places/${authUserId ?? "anon"}/${Date.now()}_${file.name}`,
      file,
      { contentType: file.type || "image/jpeg", upsert: true },
    );
  if (upErr) {
    throw new Error(upErr.message);
  }
  if (!up?.path) {
    throw new Error("Не удалось получить путь загруженного файла.");
  }
  const { data } = supabase.storage.from(PLACES_PHOTOS_BUCKET).getPublicUrl(up.path);
  if (!data?.publicUrl) {
    throw new Error("Не удалось получить публичный URL.");
  }
  return data.publicUrl;
}
