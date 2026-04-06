import type { ChangeEvent, Dispatch, SetStateAction } from "react";
import { supabase } from "../../shared/api/supabase-сlient";
import { SIBA_PHOTOS_BUCKET } from "../../shared/constants/storage";
import { PATH } from "../../shared/constants/path";
import type { SibaStatus, ShibaType, ShibaUser } from "../../shared/types";

type SetUser = Dispatch<SetStateAction<Partial<ShibaUser> | undefined>>;
type SetMySiba = Dispatch<SetStateAction<ShibaType | undefined>>;
export const profileQueryKeys = {
  user: (authUserId: string) => ["user", authUserId] as const,
  mySiba: (authUserId: string) => ["mySiba", authUserId] as const,
  allSibas: () => ["sibas"] as const,
};

export const openFilePicker = (fileInputRef: { current: HTMLInputElement | null }) => {
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

export const fetchUserById = async (authUserId: string) => {
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("user_id", authUserId)
    .maybeSingle();
  if (error) throw error;
  return data ?? undefined;
};

export const fetchMySibaByUserId = async (authUserId: string) => {
  const { data, error } = await supabase
    .from("sibains")
    .select("*")
    .eq("siba_user_id", authUserId)
    .maybeSingle();
  if (error) throw error;
  return data ?? undefined;
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
      (new Date(`${date}T00:00:00`).getTime() + days * 86400000 - now) / 86400000,
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
  mySiba: ShibaType | undefined
) => ({
  nickname: user?.nickname ?? "",
  tgName: user?.tgname ?? "",
  isShowTgName: Boolean(user?.is_show_tgname),
  sibaName: mySiba?.siba_name ?? "",
  sibaGender: mySiba?.siba_gender ?? "male",
  sibaIcon: mySiba?.siba_icon ?? "default",
});

export const processProfileFileChange = (
  event: ChangeEvent<HTMLInputElement>,
  setError: (value: string | null) => void,
  setPhotoFile: (value: File | null) => void,
  setPhotoPreviewUrl: (value: string | null) => void
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
};

export const submitProfile = async (params: SubmitProfileParams) => {
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
  } = params;

  let uploadedPhotoUrl: string | undefined;
  if (photoFile) {
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(SIBA_PHOTOS_BUCKET)
      .upload(
        `images/${authUserId}/${mySiba.id}_${Date.now()}_${photoFile.name}`,
        photoFile,
        {
          contentType: photoFile.type ?? "image/png",
          upsert: true,
        }
      );

    if (uploadError) {
      setError(uploadError.message);
      return;
    }

    if (!uploadData?.path) {
      setError("Не удалось получить путь загруженного файла.");
      return;
    }

    const { data } = supabase.storage
      .from(SIBA_PHOTOS_BUCKET)
      .getPublicUrl(uploadData.path);

    if (!data?.publicUrl) {
      setError("Ошибка получения публичного URL фото.");
      return;
    }

    uploadedPhotoUrl = data.publicUrl;
  }

  const { error: updateUserError } = await supabase
    .from("users")
    .update({
      nickname: nicknameDraft,
      tgname: tgNameDraft,
      is_show_tgname: isShowTgNameDraft,
    })
    .eq("user_id", authUserId);

  if (updateUserError) {
    setError(updateUserError.message);
    return;
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
    return;
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
};

export const setSibaStatus = async (
  mySiba: ShibaType,
  nextStatus: SibaStatus | null,
  setError: (value: string | null) => void,
  setMySiba: SetMySiba
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
  navigate: (to: string) => void
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
  await supabase.auth.signOut();
  navigate(PATH.Login);
};
