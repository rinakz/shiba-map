import { IconCafe } from "../../shared/icons/IconCafe";
import { IconPark } from "../../shared/icons/IconPark";
import { IconGroomer } from "../../shared/icons/IconGroomer";
import stls from "./map.module.sass";

type Props = {
  onPick: (kind: "cafe" | "park" | "groomer") => void;
};

export const PlaceKindPicker = ({ onPick }: Props) => {
  return (
    <div className={stls.placePickerCard}>
      <button
        type="button"
        className={stls.placePickerItem}
        onClick={() => onPick("cafe")}
      >
        <span className={stls.placePickerButton}>
          <IconCafe />
        </span>
        <span className={stls.placePickerLabel}>Кафе</span>
      </button>
      <button
        type="button"
        className={stls.placePickerItem}
        onClick={() => onPick("park")}
      >
        <span className={stls.placePickerButton}>
          <IconPark />
        </span>
        <span className={stls.placePickerLabel}>Парк</span>
      </button>
      <button
        type="button"
        className={stls.placePickerItem}
        onClick={() => onPick("groomer")}
      >
        <span className={stls.placePickerButton}>
          <IconGroomer />
        </span>
        <span className={stls.placePickerLabel}>Грумер</span>
      </button>
    </div>
  );
};

