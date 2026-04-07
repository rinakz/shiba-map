import cn from "classnames";
import { IconPeople, IconTg } from "../../shared/icons";
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
      <div className={stls.ownerInfo}>
        <IconTg />
        {user?.is_show_tgname ? user?.tgname : "Информация скрыта"}
      </div>
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
