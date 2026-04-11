import { supabase } from "./supabase-сlient";
import {
  generatePromoCode,
  linkUsersByInviteCode,
  normalizePromoCode,
} from "./referrals";

function accountTypeFromMetadata(v: unknown): "owner" | "breeder" {
  if (
    v === "breeder" ||
    (typeof v === "string" && v.toLowerCase() === "breeder")
  ) {
    return "breeder";
  }
  return "owner";
}

export async function syncPublicUserFromAuthMetadata(): Promise<void> {
  const { data: authData, error: authErr } = await supabase.auth.getUser();
  if (authErr || !authData.user?.id) return;

  const user = authData.user;
  const meta = (user.user_metadata ?? {}) as Record<string, unknown>;
  const account_type = accountTypeFromMetadata(meta.account_type);

  const inviteRaw = meta.invite_code;
  const inviteCode =
    typeof inviteRaw === "string" && inviteRaw.trim()
      ? normalizePromoCode(inviteRaw)
      : "";

  const { data: existing, error: selErr } = await supabase
    .from("users")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  if (selErr) {
    console.warn("syncPublicUserFromAuthMetadata:", selErr.message);
    return;
  }

  if (!existing) {
    const promoRaw = meta.promo_code;
    const promo_code =
      typeof promoRaw === "string" && promoRaw.trim()
        ? promoRaw.trim()
        : generatePromoCode();

    const { error: upErr } = await supabase.from("users").upsert(
      [
        {
          user_id: user.id,
          email: user.email ?? "",
          nickname: String(meta.nickname ?? ""),
          tgname: String(meta.tgname ?? ""),
          is_show_tgname: Boolean(meta.is_show_tgname),
          promo_code,
          invited_by_code: inviteCode || null,
          account_type,
          kennel_city:
            account_type === "breeder"
              ? String(meta.kennel_city ?? "").trim() || null
              : null,
          kennel_prefix:
            account_type === "breeder"
              ? String(meta.kennel_prefix ?? "").trim() || null
              : null,
        },
      ],
      { onConflict: "user_id" },
    );

    if (upErr) {
      console.warn("syncPublicUserFromAuthMetadata upsert:", upErr.message);
      return;
    }
    await linkUsersByInviteCode(user.id, inviteCode);
    return;
  }

  if (account_type === "breeder" && existing.account_type !== "breeder") {
    const { error: updErr } = await supabase
      .from("users")
      .update({
        account_type: "breeder",
        kennel_city: String(meta.kennel_city ?? "").trim() || null,
        kennel_prefix: String(meta.kennel_prefix ?? "").trim() || null,
      })
      .eq("user_id", user.id);

    if (updErr) {
      console.warn("syncPublicUserFromAuthMetadata update:", updErr.message);
    }
  }

  await linkUsersByInviteCode(user.id, inviteCode);
}
