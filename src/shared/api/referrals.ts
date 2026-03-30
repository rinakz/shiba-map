import { PROMO_ALPHABET } from "../constants";
import { supabase } from "./supabase-сlient";

export const normalizePromoCode = (value: string) => value.trim().toUpperCase();

const generateSecureCodePart = (length: number) => {
  const randomBytes = new Uint8Array(length);
  crypto.getRandomValues(randomBytes);
  return Array.from(
    randomBytes,
    (byte) => PROMO_ALPHABET[byte % PROMO_ALPHABET.length],
  ).join("");
};

export const generatePromoCode = () => `SIBA-${generateSecureCodePart(6)}`;

export const linkUsersByInviteCode = async (
  newUserId: string,
  inviteCode?: string | null,
) => {
  const normalized = inviteCode ? normalizePromoCode(inviteCode) : "";
  if (!normalized) return;

  const { data: inviter, error: inviterError } = await supabase
    .from("users")
    .select("user_id, promo_code")
    .eq("promo_code", normalized)
    .maybeSingle();

  if (inviterError || !inviter?.user_id || inviter.user_id === newUserId)
    return;

  await supabase.from("user_friends").upsert(
    [
      { user_id: newUserId, friend_user_id: inviter.user_id },
      { user_id: inviter.user_id, friend_user_id: newUserId },
    ],
    { onConflict: "user_id,friend_user_id" },
  );
};
