import type { BreederKennelRepairHint } from "../../shared/api/breeder";
import type { ShibaType } from "../../shared/types";

export type Kennel = {
  id: string;
  name: string;
  coordinates: number[] | null;
  address: string | null;
  prefix?: string | null;
  is_verified?: boolean | null;
};

/** Фото «лица» питомника: первая по времени привязанная сиба (обычно анкета заводчика). */
export type KennelWithAvatar = Kennel & { avatarSrc: string };

export type KennelSectionProps = {
  siba: ShibaType | undefined;
  authUserId: string | undefined;
  editable?: boolean;
  accountType?: "owner" | "breeder" | null;
  /** Если в каталоге нет kennels, создать из этих полей (заводчик). */
  breederRepairHint?: BreederKennelRepairHint | null;
};
