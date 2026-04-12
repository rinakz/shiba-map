import { Button } from "../../../shared/ui";
import type { Place } from "../place-types";
import stls from "../place-sheet.module.sass";

type Props = {
  place: Place;
  onCopyPromo: () => void;
};

export const PlaceDetailPromo = ({ place, onCopyPromo }: Props) => {
  if (!place.promo_code) return null;
  return (
    <div className={stls.section}>
      <h4 className={stls.sectionTitle}>Промокод для сибиков</h4>
      <div className={stls.ticket}>
        <div className={stls.ticketContent}>
          <span className={stls.ticketLabel}>
            Покажи нос официанту и назови код
          </span>
          <span className={stls.ticketCode}>{place.promo_code}</span>
        </div>
        <Button size="small" className={stls.copyButton} onClick={onCopyPromo}>
          Копировать
        </Button>
      </div>
    </div>
  );
};
