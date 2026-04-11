import { supabase } from "./supabase-сlient";
import { SIBA_PHOTOS_BUCKET } from "../constants/storage";

export type BreederKennelRow = {
  id: string;
  name: string;
  prefix: string | null;
  coordinates: number[] | null;
  address: string | null;
  created_by: string | null;
  is_verified: boolean;
  verification_status: string;
  verification_doc_url: string | null;
  doc_kennel_registration_url: string | null;
  doc_vet_passport_url: string | null;
  doc_awards_urls: string[] | null;
};

function kennelRowFromSupabase(data: Record<string, unknown>): BreederKennelRow {
  return {
    id: data.id as string,
    name: data.name as string,
    prefix: (data.prefix as string | null) ?? null,
    coordinates: (data.coordinates as number[] | null) ?? null,
    address: (data.address as string | null) ?? null,
    created_by: (data.created_by as string | null) ?? null,
    is_verified: Boolean(data.is_verified),
    verification_status: (data.verification_status as string) ?? "none",
    verification_doc_url: (data.verification_doc_url as string | null) ?? null,
    doc_kennel_registration_url:
      (data.doc_kennel_registration_url as string | null) ?? null,
    doc_vet_passport_url: (data.doc_vet_passport_url as string | null) ?? null,
    doc_awards_urls: Array.isArray(data.doc_awards_urls)
      ? (data.doc_awards_urls as string[])
      : [],
  };
}

export async function fetchKennelByCreator(
  userId: string,
): Promise<BreederKennelRow | null> {
  const { data, error } = await supabase
    .from("kennels")
    .select("*")
    .eq("created_by", userId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.warn("fetchKennelByCreator:", error.message);
    return null;
  }
  if (!data) return null;
  return kennelRowFromSupabase(data as Record<string, unknown>);
}

/** Питомник заводчика: сначала по created_by, иначе через привязку siba_kennels к анкете сибы. */
export async function fetchKennelForBreederProfile(
  userId: string,
  breederSibaId: string | undefined,
): Promise<BreederKennelRow | null> {
  const byCreator = await fetchKennelByCreator(userId);
  if (byCreator) return byCreator;
  if (!breederSibaId) return null;
  const { data, error } = await supabase
    .from("siba_kennels")
    .select("kennels(*)")
    .eq("siba_id", breederSibaId)
    .maybeSingle();
  if (error) {
    console.warn("fetchKennelForBreederProfile (siba_kennels):", error.message);
    return null;
  }
  const emb = data as unknown as { kennels: Record<string, unknown> | null };
  const k = emb?.kennels;
  if (!k || typeof k !== "object") return null;
  return kennelRowFromSupabase(k);
}

function guessUploadContentType(file: File): string {
  if (file.type && file.type !== "") return file.type;
  const n = file.name.toLowerCase();
  if (n.endsWith(".pdf")) return "application/pdf";
  if (n.endsWith(".png")) return "image/png";
  if (n.endsWith(".webp")) return "image/webp";
  if (n.endsWith(".heic") || n.endsWith(".heif")) return "image/heic";
  return "image/jpeg";
}

export async function uploadBreederVerificationDocument(
  userId: string,
  kennelId: string,
  file: File,
): Promise<{ error: string | null }> {
  const path = `breeder-verify/${userId}/${kennelId}_${Date.now()}_${file.name}`;
  const { data: up, error: upErr } = await supabase.storage
    .from(SIBA_PHOTOS_BUCKET)
    .upload(path, file, {
      contentType: guessUploadContentType(file),
      upsert: true,
    });
  if (upErr) return { error: upErr.message };
  if (!up?.path) return { error: "Нет пути файла" };

  const { data: pub } = supabase.storage
    .from(SIBA_PHOTOS_BUCKET)
    .getPublicUrl(up.path);
  const url = pub?.publicUrl;
  if (!url) return { error: "Не удалось получить URL" };

  const autoVerify =
    (import.meta.env.VITE_BREEDER_AUTO_VERIFY as string | undefined) === "1";

  const { data: updated, error: updErr } = await supabase
    .from("kennels")
    .update({
      verification_doc_url: url,
      verification_status: "pending",
      ...(autoVerify ? { is_verified: true, verification_status: "verified" } : {}),
    })
    .eq("id", kennelId)
    .eq("created_by", userId)
    .select("id")
    .maybeSingle();

  if (updErr) return { error: updErr.message };
  if (!updated) {
    return {
      error:
        "Файл загружен, но запись питомника не обновилась: аккаунт не совпадает с создателем питомника (created_by). Обновите профиль или обратитесь в поддержку.",
    };
  }
  return { error: null };
}

export type BreederDocKind = "registration" | "vet_passport" | "awards";

export async function uploadBreederProfileDocument(
  userId: string,
  kennelId: string,
  kind: BreederDocKind,
  file: File,
): Promise<{ error: string | null }> {
  const path = `breeder-docs/${userId}/${kennelId}/${kind}_${Date.now()}_${file.name}`;
  const { data: up, error: upErr } = await supabase.storage
    .from(SIBA_PHOTOS_BUCKET)
    .upload(path, file, {
      contentType: file.type || "image/jpeg",
      upsert: true,
    });
  if (upErr) return { error: upErr.message };
  if (!up?.path) return { error: "Нет пути файла" };
  const { data: pub } = supabase.storage
    .from(SIBA_PHOTOS_BUCKET)
    .getPublicUrl(up.path);
  const url = pub?.publicUrl;
  if (!url) return { error: "Не удалось получить URL" };

  if (kind === "registration") {
    const { error } = await supabase
      .from("kennels")
      .update({ doc_kennel_registration_url: url })
      .eq("id", kennelId)
      .eq("created_by", userId);
    return { error: error?.message ?? null };
  }
  if (kind === "vet_passport") {
    const { error } = await supabase
      .from("kennels")
      .update({ doc_vet_passport_url: url })
      .eq("id", kennelId)
      .eq("created_by", userId);
    return { error: error?.message ?? null };
  }

  const { data: row, error: readErr } = await supabase
    .from("kennels")
    .select("doc_awards_urls")
    .eq("id", kennelId)
    .eq("created_by", userId)
    .single();
  if (readErr) return { error: readErr.message };
  const prev = Array.isArray(row?.doc_awards_urls)
    ? (row.doc_awards_urls as string[])
    : [];
  const { error } = await supabase
    .from("kennels")
    .update({ doc_awards_urls: [...prev, url] })
    .eq("id", kennelId)
    .eq("created_by", userId);
  return { error: error?.message ?? null };
}

export async function publishExpertPost(
  body: string,
): Promise<{ error: string | null }> {
  const text = body.trim();
  if (!text) return { error: "Введите текст поста" };

  const { data: session } = await supabase.auth.getUser();
  const uid = session.user?.id;
  if (!uid) return { error: "Нет сессии" };

  const { error } = await supabase.from("expert_posts").insert([
    {
      author_user_id: uid,
      body: text,
    },
  ]);
  return { error: error?.message ?? null };
}
