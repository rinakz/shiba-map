import type { ChangeEvent, Dispatch, SetStateAction } from "react";
import {
  isLikelyImageFile,
  resizeImageFileToJpeg,
} from "../../shared/utils/image-avatar-prep";
import { uploadImageFileLikePlaceForm } from "../../shared/utils/places-bucket-upload";
import { supabase } from "../../shared/api/supabase-сlient";
import { PATH } from "../../shared/constants/path";
import type { BreederKennelRow } from "../../shared/api/breeder";
import type { SibaStatus, ShibaType, ShibaUser } from "../../shared/types";

type SetUser = Dispatch<SetStateAction<Partial<ShibaUser> | undefined>>;
type SetMySiba = Dispatch<SetStateAction<ShibaType | undefined>>;
export const profileQueryKeys = {
  user: (authUserId: string) => ["user", authUserId] as const,
  mySiba: (authUserId: string) => ["mySiba", authUserId] as const,
  allSibas: () => ["sibas"] as const,
};

export const openFilePicker = (fileInputRef: {
  current: HTMLInputElement | null;
}) => {
  fileInputRef.current?.click();
};

export const loadUser = async (authUserId: string, setUser: SetUser) => {
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("user_id", authUserId)
    .maybeSingle();

  if (error) {
    console.error("Ошибка при получении пользователя:", error);
    return;
  }

  if (data) setUser(data);
};

export const loadMySiba = async (authUserId: string, setMySiba: SetMySiba) => {
  const { data, error } = await supabase
    .from("sibains")
    .select("*")
    .eq("siba_user_id", authUserId)
    .maybeSingle();

  if (error) {
    console.error("Ошибка при получении сибы:", error);
    return;
  }

  setMySiba(data ?? undefined);
};

function normalizeAccountType(
  v: unknown,
): "owner" | "breeder" | undefined {
  if (v === "breeder" || (typeof v === "string" && v.toLowerCase() === "breeder")) {
    return "breeder";
  }
  if (v === "owner" || (typeof v === "string" && v.toLowerCase() === "owner")) {
    return "owner";
  }
  return undefined;
}

export const fetchUserById = async (authUserId: string) => {
  const { data: sessionData } = await supabase.auth.getSession();
  const sessionUser = sessionData.session?.user;
  const meta =
    sessionUser?.id === authUserId
      ? (sessionUser.user_metadata as Record<string, unknown> | undefined)
      : undefined;
  const metaAccountType = normalizeAccountType(meta?.account_type);

  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("user_id", authUserId)
    .maybeSingle();
  if (error) throw error;

  const row = data as ShibaUser | null;

  // JWT из signUp хранит account_type в user_metadata; в public.users поле могло не записаться.
  const account_type: "owner" | "breeder" =
    metaAccountType === "breeder"
      ? "breeder"
      : normalizeAccountType(row?.account_type) ?? metaAccountType ?? "owner";

  if (
    row &&
    account_type === "breeder" &&
    row.account_type !== "breeder"
  ) {
    void supabase
      .from("users")
      .update({ account_type: "breeder" })
      .eq("user_id", authUserId)
      .then(({ error: syncErr }) => {
        if (syncErr) {
          console.warn("Не удалось синхронизировать account_type в users:", syncErr.message);
        }
      });
  }

  if (!row) {
    if (sessionUser?.id !== authUserId) return undefined;
    const isBreeder = account_type === "breeder";
    const kennelTitleMeta =
      isBreeder &&
      (String(meta?.kennel_name ?? "").trim() ||
        String(meta?.siba_name ?? "").trim());
    return {
      user_id: authUserId,
      email: sessionUser.email ?? "",
      nickname: String(meta?.nickname ?? ""),
      tgname: String(meta?.tgname ?? ""),
      is_show_tgname: Boolean(meta?.is_show_tgname),
      account_type,
      ...(isBreeder
        ? {
            kennel_name: kennelTitleMeta || null,
            kennel_city: String(meta?.kennel_city ?? "").trim() || null,
            kennel_prefix: String(meta?.kennel_prefix ?? "").trim() || null,
          }
        : {}),
    } as ShibaUser;
  }

  const mergedKennelName =
    account_type === "breeder"
      ? (row.kennel_name?.trim() ||
          String(meta?.kennel_name ?? "").trim() ||
          String(meta?.siba_name ?? "").trim() ||
          null)
      : (row.kennel_name ?? null);

  return { ...row, account_type, kennel_name: mergedKennelName };
};

export const fetchMySibaByUserId = async (authUserId: string) => {
  const { data, error } = await supabase
    .from("siba_map_markers")
    .select("*")
    .eq("siba_user_id", authUserId)
    .maybeSingle();
  if (error) throw error;
  return (data as ShibaType | null) ?? undefined;
};

export const fetchSubscriptionsCount = async (authUserId: string) => {
  const { count, error } = await supabase
    .from("user_friends")
    .select("*", { count: "exact", head: true })
    .eq("user_id", authUserId);
  if (error) throw error;
  return count ?? 0;
};

export const fetchSubscribersCount = async (authUserId: string) => {
  const { count, error } = await supabase
    .from("user_friends")
    .select("*", { count: "exact", head: true })
    .eq("friend_user_id", authUserId);
  if (error) throw error;
  return count ?? 0;
};

export const fetchSibasByUserIds = async (userIds: string[]) => {
  const uniqueUserIds = Array.from(new Set(userIds.filter(Boolean)));
  if (!uniqueUserIds.length) return [];

  const { data, error } = await supabase
    .from("siba_map_markers")
    .select("*")
    .in("siba_user_id", uniqueUserIds);
  if (error) throw error;

  const sibasByUserId = new Map(
    ((data ?? []) as ShibaType[]).map((item) => [item.siba_user_id, item]),
  );

  return uniqueUserIds
    .map((userId) => sibasByUserId.get(userId))
    .filter((item): item is ShibaType => Boolean(item));
};

export const fetchFollowersList = async (authUserId: string) => {
  const { data: links, error: linksError } = await supabase
    .from("user_friends")
    .select("user_id")
    .eq("friend_user_id", authUserId);
  if (linksError) throw linksError;

  const userIds = (links ?? []).map((item: { user_id: string }) => item.user_id);
  return fetchSibasByUserIds(userIds);
};

export const fetchFollowingsList = async (authUserId: string) => {
  const { data: links, error: linksError } = await supabase
    .from("user_friends")
    .select("friend_user_id")
    .eq("user_id", authUserId);
  if (linksError) throw linksError;

  const userIds = (links ?? []).map(
    (item: { friend_user_id: string }) => item.friend_user_id,
  );
  return fetchSibasByUserIds(userIds);
};

export const fetchSibaAcademyProgress = async (sibaId: string) => {
  const { data, error } = await supabase
    .from("siba_academy_progress")
    .select("learned_skill_ids")
    .eq("siba_id", sibaId)
    .maybeSingle();
  if (error) return null;
  return (data as { learned_skill_ids: string[] | null } | null) ?? null;
};

export const fetchHealthAlert = async (sibaId: string) => {
  const [vacc, treat] = await Promise.all([
    supabase
      .from("siba_health_vaccination")
      .select("rabies_last_shot,complex_last_shot")
      .eq("siba_id", sibaId)
      .maybeSingle(),
    supabase
      .from("siba_health_treatments")
      .select("ticks_last_treatment,worms_last_treatment")
      .eq("siba_id", sibaId)
      .maybeSingle(),
  ]);

  const now = Date.now();
  const leftDays = (date: string | null | undefined, days: number) => {
    if (!date) return -1;
    return Math.ceil(
      (new Date(`${date}T00:00:00`).getTime() + days * 86400000 - now) /
        86400000,
    );
  };

  return [
    leftDays(vacc.data?.rabies_last_shot, 365),
    leftDays(vacc.data?.complex_last_shot, 365),
    leftDays(
      (treat.data as { ticks_last_treatment?: string | null } | null)
        ?.ticks_last_treatment,
      30,
    ),
    leftDays(
      (treat.data as { worms_last_treatment?: string | null } | null)
        ?.worms_last_treatment,
      90,
    ),
  ].some((x) => x <= 14);
};

export type SibaKennelLinkRow = {
  kennel_id: string;
  siba_id: string;
};

/** Связи питомник ↔ сиба (для рейтинга заводчиков и древа). */
export const fetchSibaKennelLinks = async (): Promise<SibaKennelLinkRow[]> => {
  const { data, error } = await supabase
    .from("siba_kennels")
    .select("kennel_id, siba_id");
  if (error) throw error;
  return (data ?? []) as SibaKennelLinkRow[];
};

export const fetchAllSibas = async () => {
  // Prefer safer public view with computed verification (photo OR promo).
  const { data: viewData, error: viewError } = await supabase
    .from("siba_map_markers")
    .select("*");

  if (!viewError) return viewData ?? [];

  // Fallback to direct table (dev / before migration).
  const { data, error } = await supabase.from("sibains").select("*");
  if (error) throw error;
  return data ?? [];
};

export const buildEditDrafts = (
  user: Partial<ShibaUser> | undefined,
  mySiba: ShibaType | undefined,
) => ({
  nickname: user?.nickname ?? "",
  tgName: user?.tgname ?? "",
  isShowTgName: Boolean(user?.is_show_tgname),
  sibaName: mySiba?.siba_name ?? "",
  sibaGender: mySiba?.siba_gender ?? "male",
  sibaIcon: mySiba?.siba_icon ?? "default",
});

export const buildBreederKennelDrafts = (
  kennel: BreederKennelRow | null | undefined,
) => ({
  kennelName: kennel?.name ?? "",
  kennelPrefix: kennel?.prefix ?? "",
  kennelAddress: kennel?.address ?? "",
});

export const processProfileFileChange = (
  event: ChangeEvent<HTMLInputElement>,
  setError: (value: string | null) => void,
  setPhotoFile: (value: File | null) => void,
  setPhotoPreviewUrl: (value: string | null) => void,
) => {
  setError(null);
  const file = event.target.files?.[0];
  if (!file) return;

  if (!file.type.startsWith("image/")) {
    setError("Можно загрузить только изображение.");
    return;
  }

  const maxSizeMb = 10;
  if (file.size > maxSizeMb * 1024 * 1024) {
    setError(`Файл слишком большой. Максимум ${maxSizeMb} МБ.`);
    return;
  }

  setPhotoFile(file);
  setPhotoPreviewUrl(URL.createObjectURL(file));
};

const extractErrorMessage = (error: unknown, fallback: string) => {
  if (error instanceof Error && error.message) return error.message;
  if (typeof error === "object" && error !== null && "message" in error) {
    const message = (error as { message?: unknown }).message;
    if (typeof message === "string" && message.trim()) return message;
  }
  return fallback;
};

export const processCommunityAvatarChange = async (
  event: ChangeEvent<HTMLInputElement>,
  setError: (value: string | null) => void,
  setCommunityAvatarFile: (value: File | null) => void,
  setCommunityAvatarPreviewUrl: (value: string | null) => void,
  previousPreviewUrl: string | null,
) => {
  const input = event.target;
  setError(null);
  const file = input.files?.[0];
  try {
    if (!file) return;

    if (!isLikelyImageFile(file)) {
      setError("Можно загрузить только изображение сообщества.");
      return;
    }

    const maxSizeMb = 25;
    if (file.size > maxSizeMb * 1024 * 1024) {
      setError(`Файл слишком большой. Максимум ${maxSizeMb} МБ до сжатия.`);
      return;
    }

    const prepared = await resizeImageFileToJpeg(file, {
      maxEdge: 512,
      quality: 0.88,
      filename: "community-avatar.jpg",
    });

    if (previousPreviewUrl?.startsWith("blob:")) {
      URL.revokeObjectURL(previousPreviewUrl);
    }

    setCommunityAvatarFile(prepared);
    setCommunityAvatarPreviewUrl(URL.createObjectURL(prepared));
  } catch (error) {
    setError(extractErrorMessage(error, "Не удалось обработать фото сообщества."));
  } finally {
    input.value = "";
  }
};

type SubmitProfileParams = {
  authUserId: string;
  mySiba: ShibaType;
  user: Partial<ShibaUser> | undefined;
  nicknameDraft: string;
  tgNameDraft: string;
  isShowTgNameDraft: boolean;
  sibaNameDraft: string;
  sibaGenderDraft: string;
  sibaIconDraft: string;
  photoFile: File | null;
  setError: (value: string | null) => void;
  setUser: SetUser;
  setMySiba: SetMySiba;
  setIsEdit: (value: boolean) => void;
  setPhotoFile: (value: File | null) => void;
  setPhotoPreviewUrl: (value: string | null) => void;
  profileKind: "owner" | "breeder";
  kennelId?: string | null;
  kennelNameDraft?: string;
  kennelPrefixDraft?: string;
  kennelAddressDraft?: string;
};

export const submitProfile = async (
  params: SubmitProfileParams,
): Promise<boolean> => {
  const {
    authUserId,
    mySiba,
    user,
    nicknameDraft,
    tgNameDraft,
    isShowTgNameDraft,
    sibaNameDraft,
    sibaGenderDraft,
    sibaIconDraft,
    photoFile,
    setError,
    setUser,
    setMySiba,
    setIsEdit,
    setPhotoFile,
    setPhotoPreviewUrl,
    profileKind,
    kennelId,
    kennelNameDraft,
    kennelPrefixDraft,
    kennelAddressDraft,
  } = params;

  let uploadedPhotoUrl: string | undefined;
  if (photoFile) {
    try {
      uploadedPhotoUrl = await uploadImageFileLikePlaceForm(authUserId, photoFile);
    } catch (e) {
      setError(
        e instanceof Error
          ? `Не удалось загрузить фото профиля: ${e.message}`
          : "Не удалось загрузить фото профиля.",
      );
      return false;
    }
  }

  const breederKennelTitle =
    profileKind === "breeder" && kennelId && (kennelNameDraft ?? "").trim()
      ? (kennelNameDraft ?? "").trim()
      : undefined;

  const { error: updateUserError } = await supabase
    .from("users")
    .update({
      nickname: nicknameDraft,
      tgname: tgNameDraft,
      is_show_tgname: isShowTgNameDraft,
      ...(breederKennelTitle ? { kennel_name: breederKennelTitle } : {}),
    })
    .eq("user_id", authUserId);

  if (updateUserError) {
    setError(updateUserError.message);
    return false;
  }

  if (profileKind === "breeder") {
    if (kennelId) {
      const name = (kennelNameDraft ?? "").trim();
      if (!name) {
        setError("Укажите название питомника.");
        return false;
      }
      const { error: kennelErr } = await supabase
        .from("kennels")
        .update({
          name,
          prefix: (kennelPrefixDraft ?? "").trim() || null,
          address: (kennelAddressDraft ?? "").trim() || null,
        })
        .eq("id", kennelId)
        .eq("created_by", authUserId);

      if (kennelErr) {
        setError(kennelErr.message);
        return false;
      }

      const { error: sibaSyncErr } = await supabase
        .from("sibains")
        .update({ siba_name: name })
        .eq("id", mySiba.id);

      if (sibaSyncErr) {
        setError(sibaSyncErr.message);
        return false;
      }
    }

    if (uploadedPhotoUrl) {
      const { error: photoErr } = await supabase
        .from("sibains")
        .update({ photos: uploadedPhotoUrl })
        .eq("id", mySiba.id);

      if (photoErr) {
        setError(photoErr.message);
        return false;
      }
    }

    setIsEdit(false);
    setPhotoFile(null);
    setPhotoPreviewUrl(null);
    setError(null);
    setUser({
      ...user,
      nickname: nicknameDraft,
      tgname: tgNameDraft,
      is_show_tgname: isShowTgNameDraft,
      ...(breederKennelTitle ? { kennel_name: breederKennelTitle } : {}),
    });
    setMySiba({
      ...mySiba,
      ...(kennelId && (kennelNameDraft ?? "").trim()
        ? { siba_name: (kennelNameDraft ?? "").trim() }
        : {}),
      ...(uploadedPhotoUrl ? { photos: uploadedPhotoUrl } : {}),
    });
    return true;
  }

  const { error: updateSibaError } = await supabase
    .from("sibains")
    .update({
      siba_name: sibaNameDraft,
      siba_gender: sibaGenderDraft,
      siba_icon: sibaIconDraft,
      ...(uploadedPhotoUrl ? { photos: uploadedPhotoUrl } : {}),
    })
    .eq("id", mySiba.id);

  if (updateSibaError) {
    setError(updateSibaError.message);
    return false;
  }

  setIsEdit(false);
  setPhotoFile(null);
  setPhotoPreviewUrl(null);
  setError(null);
  setUser({
    ...user,
    nickname: nicknameDraft,
    tgname: tgNameDraft,
    is_show_tgname: isShowTgNameDraft,
  });
  setMySiba({
    ...mySiba,
    siba_name: sibaNameDraft,
    siba_gender: sibaGenderDraft,
    siba_icon: sibaIconDraft,
    ...(uploadedPhotoUrl ? { photos: uploadedPhotoUrl } : {}),
  });
  return true;
};

export const uploadCommunityAvatar = async (
  authUserId: string,
  communityAvatarFile: File,
): Promise<string> => {
  try {
    return await uploadImageFileLikePlaceForm(authUserId, communityAvatarFile);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Неизвестная ошибка";
    throw new Error(`Не удалось загрузить фото сообщества: ${msg}`);
  }
};

export const getProfileActionErrorMessage = (
  error: unknown,
  fallback: string,
) => extractErrorMessage(error, fallback);

export const setSibaStatus = async (
  mySiba: ShibaType,
  nextStatus: SibaStatus | null,
  setError: (value: string | null) => void,
  setMySiba: SetMySiba,
) => {
  const nextValue = nextStatus === "walk";
  const { error: updateError } = await supabase
    .from("sibains")
    .update({ want_to_walk: nextValue, status: nextStatus })
    .eq("id", mySiba.id);

  if (updateError) {
    setError(updateError.message);
    return;
  }

  setError(null);
  setMySiba({ ...mySiba, want_to_walk: nextValue, status: nextStatus });
};

export const deleteAccount = async (
  setError: (value: string | null) => void,
  navigate: (to: string) => void,
) => {
  const { error: deleteError } = await supabase.rpc("delete_my_account");
  if (deleteError) {
    setError(`Ошибка удаления аккаунта: ${deleteError.message}`);
    return;
  }

  await supabase.auth.signOut();
  navigate(PATH.Login);
};

export const performSignOut = async (navigate: (to: string) => void) => {
  const { error } = await supabase.auth.signOut();
  if (error) {
    throw new Error(`Не удалось выйти: ${error.message}`);
  }
  navigate(PATH.Login);
};
