import { IconPeople, IconTg } from "../../shared/icons";
import cn from "classnames";
import type { ShibaUser } from "../../shared/types";
import stls from "./profile.module.sass";

type ProfileOwnerCardProps = {
  user?: Partial<ShibaUser>;
  isPromoRevealed: boolean;
  onPromoClick: () => void;
};

export const ProfileOwnerCard = ({
  user,
  isPromoRevealed,
  onPromoClick,
}: ProfileOwnerCardProps) => {
  return (
    <div className={stls.ownerCard}>
      <div className={stls.ownerMain}>
        <IconPeople /> {user?.nickname}
      </div>
      {user?.is_show_tgname && user?.tgname?.trim() ? (
        <div className={stls.ownerInfo}>
          <IconTg />
          {user.tgname.trim()}
        </div>
      ) : null}
      <div className={stls.promoRow}>
        Мой промокод:
        <span
          className={cn(stls.promoValue, { [stls.promoBlur]: !isPromoRevealed })}
          onClick={onPromoClick}
          title="Скопировать"
        >
          {user?.promo_code ?? "—"}
        </span>
      </div>
    </div>
  );
};
