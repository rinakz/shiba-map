import { supabase } from "../../shared/api/supabase-сlient";
import { uploadImageFileLikePlaceForm } from "../../shared/utils/places-bucket-upload";
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
    const kennelTitle = formData.sibaname.trim();
    return {
      ...base,
      siba_name: kennelTitle,
      kennel_name: kennelTitle,
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
    kennel_name:
      accountType === "breeder" ? formData.sibaname.trim() || null : null,
  };
}

export function buildSibaRow(
  sessionUserId: string,
  formData: AuthFormType,
  accountType: AccountType,
  coordinates: number[],
) {
  if (accountType === "breeder") {
    const kennelTitle = formData.sibaname.trim();
    return {
      siba_user_id: sessionUserId,
      // Должно совпадать с kennels.name из ensureBreederKennelLinked (публичное имя карточки).
      siba_name: kennelTitle,
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

function isUniqueViolation(err: { message?: string; code?: string } | null) {
  if (!err) return false;
  if (err.code === "23505" || String(err.code) === "23505") return true;
  const m = (err.message ?? "").toLowerCase();
  return m.includes("duplicate") || m.includes("unique");
}

/** Каталог питомников: kennels + siba_kennels (siba_id хранится как text = sibains.id). */
export async function ensureBreederKennelLinked(
  userId: string,
  sibaId: string,
  formData: AuthFormType,
  coordinates: number[],
): Promise<{ error: string | null }> {
  const sibaKey = String(sibaId).trim();
  if (!sibaKey) return { error: "Нет id анкеты сибы для привязки питомника." };

  const { data: linkRows, error: linkSelectErr } = await supabase
    .from("siba_kennels")
    .select("kennel_id")
    .eq("siba_id", sibaKey)
    .limit(1);

  if (linkSelectErr) {
    return { error: linkSelectErr.message };
  }
  const linkedId = linkRows?.[0] as { kennel_id?: string } | undefined;
  if (linkedId?.kennel_id) {
    return { error: null };
  }

  const name = formData.sibaname.trim(); // «Название питомника» на шаге регистрации заводчика
  const city = formData.kennelCity.trim();
  const prefix = formData.kennelPrefix.trim();
  const address = [city, prefix].filter(Boolean).join(" · ") || null;

  const coordsPayload =
    coordinates.length >= 2 ? (coordinates as [number, number]) : null;

  const { data: kennelRows, error: findErr } = await supabase
    .from("kennels")
    .select("id")
    .eq("created_by", userId)
    .eq("name", name)
    .limit(1);

  if (findErr) {
    return { error: findErr.message };
  }

  let kennelId = (kennelRows?.[0] as { id?: string } | undefined)?.id;

  if (!kennelId) {
    const extended = {
      name,
      prefix: prefix || null,
      coordinates: coordsPayload,
      address,
      created_by: userId,
      is_verified: false,
      verification_status: "none",
    };
    const firstInsert = await supabase
      .from("kennels")
      .insert([extended])
      .select("id")
      .single();
    const insErr = firstInsert.error;
    let inserted = firstInsert.data;

    if (insErr) {
      const minimal = {
        name,
        coordinates: coordsPayload,
        address,
        created_by: userId,
      };
      const retry = await supabase
        .from("kennels")
        .insert([minimal])
        .select("id")
        .single();
      if (retry.error) {
        return {
          error: retry.error.message || insErr.message,
        };
      }
      inserted = retry.data;
      if (inserted?.id) {
        void supabase
          .from("kennels")
          .update({
            prefix: prefix || null,
            is_verified: false,
            verification_status: "none",
          })
          .eq("id", inserted.id);
      }
    }

    if (!inserted?.id) {
      return { error: "Не удалось создать питомник в каталоге." };
    }
    kennelId = inserted.id as string;
  }

  const { error: linkErr } = await supabase.from("siba_kennels").insert({
    siba_id: sibaKey,
    kennel_id: kennelId,
  });

  if (linkErr && !isUniqueViolation(linkErr)) {
    return { error: linkErr.message };
  }

  const { error: userKennelErr } = await supabase
    .from("users")
    .update({ kennel_name: name })
    .eq("user_id", userId);
  if (userKennelErr) {
    console.warn("ensureBreederKennelLinked: users.kennel_name", userKennelErr.message);
  }

  return { error: null };
}

export async function uploadKennelLogoToSiba(
  userId: string,
  sibaId: string,
  file: File,
): Promise<{ error: string | null }> {
  let publicUrl: string;
  try {
    publicUrl = await uploadImageFileLikePlaceForm(userId, file);
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Ошибка загрузки логотипа." };
  }

  const { error: updateError } = await supabase
    .from("sibains")
    .update({ photos: publicUrl })
    .eq("id", sibaId);

  if (updateError) {
    return { error: updateError.message };
  }
  return { error: null };
}
