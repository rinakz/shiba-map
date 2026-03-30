import { supabase } from "../../shared/api/supabase-сlient";
import { SIBA_PHOTOS_BUCKET } from "../../shared/constants/storage";
import type { ShibaType } from "../../shared/types";

type ResolveCurrentSibaParams = {
  mySiba?: ShibaType;
  authUserId: string | null;
  coordinates: number[];
  setMySiba: (value: ShibaType) => void;
};

export const resolveCurrentSiba = async ({
  mySiba,
  authUserId,
  coordinates,
  setMySiba,
}: ResolveCurrentSibaParams) => {
  if (mySiba?.id && mySiba?.siba_user_id) return mySiba;

  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError) {
    throw new Error(authError.message);
  }

  const effectiveUserId = authData.user?.id ?? authUserId ?? null;
  if (!effectiveUserId) {
    return null;
  }

  const { data: sibas, error: sibasError } = await supabase
    .from("sibains")
    .select("*")
    .eq("siba_user_id", effectiveUserId)
    .limit(1);

  if (sibasError) {
    throw new Error(sibasError.message);
  }

  const existingSiba = sibas?.[0];
  if (existingSiba) {
    setMySiba(existingSiba);
    return existingSiba;
  }

  const { data: userData } = await supabase
    .from("users")
    .select("nickname")
    .eq("user_id", effectiveUserId)
    .maybeSingle();

  const fallbackSibaName = userData?.nickname
    ? `${userData.nickname}’s siba`
    : "Моя сиба";

  const { data: insertedSiba, error: createError } = await supabase
    .from("sibains")
    .insert([
      {
        siba_user_id: effectiveUserId,
        siba_name: fallbackSibaName,
        siba_icon: "default",
        siba_gender: "male",
        coordinates,
      },
    ])
    .select("*")
    .single();

  if (createError) {
    throw new Error(createError.message);
  }

  setMySiba(insertedSiba);
  return insertedSiba;
};

export const normalizeCoords = (coords: unknown): [number, number] | null => {
  if (!Array.isArray(coords) || coords.length < 2) return null;
  const lat = typeof coords[0] === "string" ? Number(coords[0]) : Number(coords[0]);
  const lng = typeof coords[1] === "string" ? Number(coords[1]) : Number(coords[1]);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  return [lat, lng];
};

export const jitterCoords = (coords: [number, number], seed: string) => {
  const [lat, lng] = coords;

  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }

  const r1 = ((h >>> 0) % 1000) / 1000;
  const r2 = (((h >>> 0) / 1000) % 1000) / 1000;

  const maxMeters = 25;
  const latDeltaDeg = (r1 - 0.5) * (maxMeters / 111_320);
  const lngDeltaDeg =
    (r2 - 0.5) * (maxMeters / (111_320 * Math.cos((lat * Math.PI) / 180)));

  return [lat + latDeltaDeg, lng + lngDeltaDeg] as [number, number];
};

export const uploadVerificationPhoto = async (
  targetSiba: ShibaType,
  file: File
) => {
  const { data: uploadData, error: uploadError } = await supabase.storage
    .from(SIBA_PHOTOS_BUCKET)
    .upload(
      `images/${targetSiba.siba_user_id}/verify_${targetSiba.id}_${Date.now()}_${file.name}`,
      file,
      {
        contentType: file.type || "image/jpeg",
        upsert: true,
      }
    );

  if (uploadError) {
    throw new Error(uploadError.message);
  }

  if (!uploadData?.path) {
    throw new Error("Не удалось получить путь загруженного фото.");
  }

  const { data: publicUrlData } = supabase.storage
    .from(SIBA_PHOTOS_BUCKET)
    .getPublicUrl(uploadData.path);

  const photoUrl = publicUrlData?.publicUrl;
  if (!photoUrl) {
    throw new Error("Не удалось получить публичную ссылку на фото.");
  }

  const { error: updateError } = await supabase
    .from("sibains")
    .update({ photos: photoUrl })
    .eq("id", targetSiba.id);

  if (updateError) {
    throw new Error(updateError.message);
  }

  return photoUrl;
};
