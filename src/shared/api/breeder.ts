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

/** Подсказки из users / sibains, если запись в kennels ещё не создана (старые аккаунты, сбой при регистрации). */
export type BreederKennelRepairHint = {
  kennel_name?: string | null;
  kennel_prefix?: string | null;
  kennel_city?: string | null;
  siba_name?: string | null;
  siba_coordinates?: number[] | string[] | null;
};

function normalizeCoordsPair(
  c: number[] | string[] | null | undefined,
): [number, number] | null {
  if (!c || !Array.isArray(c) || c.length < 2) return null;
  const a = Number(c[0]);
  const b = Number(c[1]);
  if (!Number.isFinite(a) || !Number.isFinite(b)) return null;
  return [a, b];
}

function unwrapEmbeddedKennel(emb: unknown): Record<string, unknown> | null {
  if (!emb || typeof emb !== "object") return null;
  if (Array.isArray(emb)) {
    const first = emb[0];
    return first && typeof first === "object"
      ? (first as Record<string, unknown>)
      : null;
  }
  return emb as Record<string, unknown>;
}

/** siba_kennels.siba_id — text; id сибы из JS приводим к строке. */
function kennelLinkSibaId(sibaId: string | undefined): string | undefined {
  if (sibaId === undefined || sibaId === null) return undefined;
  const s = String(sibaId).trim();
  return s.length ? s : undefined;
}

function isUniqueViolation(err: { message?: string; code?: string } | null): boolean {
  if (!err) return false;
  if (err.code === "23505" || String(err.code) === "23505") return true;
  const m = (err.message ?? "").toLowerCase();
  return m.includes("duplicate") || m.includes("unique");
}

async function insertKennelForRepair(
  userId: string,
  name: string,
  address: string | null,
  coordsPayload: [number, number] | null,
  prefix: string,
): Promise<{ id: string | null; error: string | null }> {
  const extended = {
    name,
    prefix: prefix || null,
    coordinates: coordsPayload,
    address,
    created_by: userId,
    is_verified: false,
    verification_status: "none",
  };

  const first = await supabase
    .from("kennels")
    .insert([extended])
    .select("id")
    .single();

  if (!first.error && first.data?.id) {
    return { id: first.data.id as string, error: null };
  }

  const minimal = {
    name,
    coordinates: coordsPayload,
    address,
    created_by: userId,
  };
  const second = await supabase
    .from("kennels")
    .insert([minimal])
    .select("id")
    .single();

  if (second.error) {
    return {
      id: null,
      error:
        second.error.message ||
        first.error?.message ||
        "Не удалось создать питомник",
    };
  }

  const kid = second.data?.id as string | undefined;
  if (!kid) return { id: null, error: "Нет id после вставки питомника" };

  void supabase
    .from("kennels")
    .update({
      prefix: prefix || null,
      is_verified: false,
      verification_status: "none",
    })
    .eq("id", kid);

  return { id: kid, error: null };
}

/**
 * Создаёт kennels + при необходимости siba_kennels, если в профиле уже есть название, а в каталоге пусто.
 */
async function tryRepairBreederKennelRow(
  userId: string,
  breederSibaId: string | undefined,
  hint: BreederKennelRepairHint,
): Promise<{ error: string | null }> {
  const name = (
    hint.kennel_name?.trim() ||
    hint.siba_name?.trim() ||
    ""
  ).trim();
  if (!name) return { error: null };

  const prefix = hint.kennel_prefix?.trim() || "";
  const city = hint.kennel_city?.trim() || "";
  const address = [city, prefix].filter(Boolean).join(" · ") || null;
  const coordsPayload = normalizeCoordsPair(hint.siba_coordinates ?? null);
  const sibaKey = kennelLinkSibaId(breederSibaId);

  const { data: foundRows, error: findErr } = await supabase
    .from("kennels")
    .select("id")
    .eq("created_by", userId)
    .eq("name", name)
    .limit(1);

  if (findErr) return { error: findErr.message };

  let kennelId = (foundRows?.[0] as { id?: string } | undefined)?.id;

  if (!kennelId) {
    const ins = await insertKennelForRepair(
      userId,
      name,
      address,
      coordsPayload,
      prefix,
    );
    if (ins.error) return { error: ins.error };
    kennelId = ins.id ?? undefined;
  }

  if (!kennelId) return { error: "Не удалось создать запись питомника" };

  if (sibaKey) {
    const { error: linkErr } = await supabase.from("siba_kennels").insert({
      siba_id: sibaKey,
      kennel_id: kennelId,
    });
    if (linkErr && !isUniqueViolation(linkErr)) {
      return { error: linkErr.message };
    }
  }

  return { error: null };
}

/** Питомник по анкете заводчика (публичный просмотр с карты / чужой профиль): без created_by текущего пользователя. */
export async function fetchPublicKennelForBreederSiba(
  breederSibaId: string | undefined,
): Promise<BreederKennelRow | null> {
  const sibaKey = kennelLinkSibaId(breederSibaId);
  if (!sibaKey) return null;
  const { data, error } = await supabase
    .from("siba_kennels")
    .select("kennels(*)")
    .eq("siba_id", sibaKey)
    .limit(1)
    .maybeSingle();
  if (error) {
    console.warn("fetchPublicKennelForBreederSiba:", error.message);
    return null;
  }
  const row = data as unknown as { kennels?: unknown };
  const k = unwrapEmbeddedKennel(row?.kennels);
  return k ? kennelRowFromSupabase(k) : null;
}

/** Питомник заводчика: сначала по created_by, иначе через привязку siba_kennels к анкете сибы. */
export async function fetchKennelForBreederProfile(
  userId: string,
  breederSibaId: string | undefined,
  repairHint?: BreederKennelRepairHint,
): Promise<BreederKennelRow | null> {
  const sibaKey = kennelLinkSibaId(breederSibaId);

  const byCreator = await fetchKennelByCreator(userId);
  if (byCreator) return byCreator;

  if (sibaKey) {
    const { data, error } = await supabase
      .from("siba_kennels")
      .select("kennels(*)")
      .eq("siba_id", sibaKey)
      .limit(1)
      .maybeSingle();
    if (error) {
      console.warn("fetchKennelForBreederProfile (siba_kennels):", error.message);
    } else {
      const row = data as unknown as { kennels?: unknown };
      const k = unwrapEmbeddedKennel(row?.kennels);
      if (k) return kennelRowFromSupabase(k);
    }
  }

  if (repairHint) {
    const { error: repairErr } = await tryRepairBreederKennelRow(
      userId,
      breederSibaId,
      repairHint,
    );
    if (repairErr) {
      console.warn("fetchKennelForBreederProfile repair:", repairErr);
      return null;
    }

    const afterCreator = await fetchKennelByCreator(userId);
    if (afterCreator) return afterCreator;

    if (sibaKey) {
      const { data: d2, error: e2 } = await supabase
        .from("siba_kennels")
        .select("kennels(*)")
        .eq("siba_id", sibaKey)
        .limit(1)
        .maybeSingle();
      if (!e2 && d2) {
        const row2 = d2 as unknown as { kennels?: unknown };
        const k2 = unwrapEmbeddedKennel(row2?.kennels);
        if (k2) return kennelRowFromSupabase(k2);
      }
    }
  }

  return null;
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

/** Имя файла без путей; RLS Storage обычно разрешает только images/{auth.uid()}/… */
function storageSafeFileName(file: File): string {
  const base = file.name.replace(/^.*[/\\]/, "").replace(/[/\\]/g, "_");
  return (base || "file").slice(0, 200);
}

export async function uploadBreederVerificationDocument(
  userId: string,
  kennelId: string,
  file: File,
): Promise<{ error: string | null }> {
  const path = `images/${userId}/breeder-verify/${kennelId}_${Date.now()}_${storageSafeFileName(file)}`;
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

  const { data: updated, error: updErr } = await supabase
    .from("kennels")
    .update({
      verification_doc_url: url,
      is_verified: true,
      verification_status: "verified",
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
  const path = `images/${userId}/breeder-docs/${kennelId}/${kind}_${Date.now()}_${storageSafeFileName(file)}`;
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
