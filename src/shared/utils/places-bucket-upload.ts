import { supabase } from "../api/supabase-сlient";
import { PLACES_PHOTOS_BUCKET } from "../constants/storage";

/** Безопасное имя файла для пути в Storage (как при добавлении мест). */
export function storageSafeFileBaseName(file: File): string {
  const raw = file.name.replace(/[^\w.-]+/g, "_");
  const trimmed = raw.replace(/^\.+/, "") || "photo.jpg";
  return trimmed.slice(0, 120);
}

/**
 * Загрузка в тот же бакет и с тем же шаблоном пути, что в форме мест (`place-form` / `cafe-form`).
 */
export async function uploadImageFileLikePlaceForm(
  authUserId: string,
  file: File,
): Promise<string> {
  const uid = authUserId?.trim() || "anon";
  const path = `places/${uid}/${Date.now()}_${storageSafeFileBaseName(file)}`;
  const { data: up, error: upErr } = await supabase.storage
    .from(PLACES_PHOTOS_BUCKET)
    .upload(path, file, {
      contentType: file.type || "image/jpeg",
      upsert: true,
    });
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
