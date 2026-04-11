import { supabase } from "../../shared/api/supabase-сlient";
import { SIBA_PHOTOS_BUCKET } from "../../shared/constants/storage";
import type { AccountType, AuthFormType } from "../../pages/auth-page/types";

export function buildSignupUserMetadata(
  formData: AuthFormType,
  accountType: AccountType,
  coordinates: number[],
  inviteCode: string,
  promoCode: string,
) {
  const base = {
    nickname: formData.nickname,
    tgname: formData.tgname,
    is_show_tgname: formData.isShowTgName,
    coordinates,
    invite_code: inviteCode,
    promo_code: promoCode,
    account_type: accountType,
  };
  if (accountType === "breeder") {
    return {
      ...base,
      siba_name: formData.sibaname,
      siba_icon: "default",
      siba_gender: "male",
      kennel_city: formData.kennelCity,
      kennel_prefix: formData.kennelPrefix || null,
    };
  }
  return {
    ...base,
    siba_name: formData.sibaname,
    siba_icon: formData.icon,
    siba_gender: formData.gender,
  };
}

export function buildUsersUpsertRow(
  userId: string,
  email: string,
  formData: AuthFormType,
  accountType: AccountType,
  promoCode: string,
  inviteCode: string,
) {
  return {
    user_id: userId,
    email,
    nickname: formData.nickname,
    tgname: formData.tgname,
    is_show_tgname: formData.isShowTgName,
    promo_code: promoCode,
    invited_by_code: inviteCode || null,
    account_type: accountType,
    kennel_city:
      accountType === "breeder" ? formData.kennelCity.trim() || null : null,
    kennel_prefix:
      accountType === "breeder"
        ? formData.kennelPrefix.trim() || null
        : null,
  };
}

export function buildSibaRow(
  sessionUserId: string,
  formData: AuthFormType,
  accountType: AccountType,
  coordinates: number[],
) {
  if (accountType === "breeder") {
    return {
      siba_user_id: sessionUserId,
      siba_name: formData.sibaname,
      siba_icon: "default",
      siba_gender: "male",
      coordinates,
    };
  }
  return {
    siba_user_id: sessionUserId,
    siba_name: formData.sibaname,
    siba_icon: formData.icon,
    siba_gender: formData.gender,
    coordinates,
  };
}

/** Каталог питомников: kennels + siba_kennels (siba_id хранится как text = sibains.id). */
export async function ensureBreederKennelLinked(
  userId: string,
  sibaId: string,
  formData: AuthFormType,
  coordinates: number[],
): Promise<{ error: string | null }> {
  const { data: existingLink, error: linkSelectErr } = await supabase
    .from("siba_kennels")
    .select("kennel_id")
    .eq("siba_id", sibaId)
    .maybeSingle();

  if (linkSelectErr) {
    return { error: linkSelectErr.message };
  }
  if (existingLink?.kennel_id) {
    return { error: null };
  }

  const name = formData.sibaname.trim();
  const city = formData.kennelCity.trim();
  const prefix = formData.kennelPrefix.trim();
  const address = [city, prefix].filter(Boolean).join(" · ") || null;

  const coordsPayload =
    coordinates.length >= 2 ? (coordinates as [number, number]) : null;

  const { data: existingKennel, error: findErr } = await supabase
    .from("kennels")
    .select("id")
    .eq("created_by", userId)
    .eq("name", name)
    .maybeSingle();

  if (findErr) {
    return { error: findErr.message };
  }

  let kennelId = existingKennel?.id as string | undefined;

  if (!kennelId) {
    const { data: inserted, error: insErr } = await supabase
      .from("kennels")
      .insert([
        {
          name,
          prefix: prefix || null,
          coordinates: coordsPayload,
          address,
          created_by: userId,
          is_verified: false,
          verification_status: "none",
        },
      ])
      .select("id")
      .single();

    if (insErr) {
      return { error: insErr.message };
    }
    if (!inserted?.id) {
      return { error: "Не удалось создать питомник в каталоге." };
    }
    kennelId = inserted.id as string;
  }

  const { error: linkErr } = await supabase.from("siba_kennels").insert({
    siba_id: sibaId,
    kennel_id: kennelId,
  });

  if (linkErr) {
    return { error: linkErr.message };
  }
  return { error: null };
}

export async function uploadKennelLogoToSiba(
  userId: string,
  sibaId: string,
  file: File,
): Promise<{ error: string | null }> {
  const { data: uploadData, error: uploadError } = await supabase.storage
    .from(SIBA_PHOTOS_BUCKET)
    .upload(
      `images/${userId}/${sibaId}_kennel_${Date.now()}_${file.name}`,
      file,
      {
        contentType: file.type || "image/png",
        upsert: true,
      },
    );

  if (uploadError) {
    return { error: uploadError.message };
  }
  if (!uploadData?.path) {
    return { error: "Не удалось получить путь загруженного файла." };
  }

  const { data: urlData } = supabase.storage
    .from(SIBA_PHOTOS_BUCKET)
    .getPublicUrl(uploadData.path);

  if (!urlData?.publicUrl) {
    return { error: "Ошибка получения публичного URL логотипа." };
  }

  const { error: updateError } = await supabase
    .from("sibains")
    .update({ photos: urlData.publicUrl })
    .eq("id", sibaId);

  if (updateError) {
    return { error: updateError.message };
  }
  return { error: null };
}
