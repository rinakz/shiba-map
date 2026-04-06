import { IconCafe } from "../../shared/icons/IconCafe";
import { IconPark } from "../../shared/icons/IconPark";
import { IconGroomer } from "../../shared/icons/IconGroomer";
import stls from "./map.module.sass";

type Props = {
  onPick: (kind: "cafe" | "park" | "groomer") => void;
};

export const PlaceKindPicker = ({ onPick }: Props) => {
  return (
    <div className={stls.placePickerOverlay}>
      <div className={stls.placePickerCard}>
        <button
          type="button"
          className={stls.placePickerButton}
          onClick={() => onPick("cafe")}
        >
          <IconCafe />
        </button>
        <button
          type="button"
          className={stls.placePickerButton}
          onClick={() => onPick("park")}
        >
          <IconPark />
        </button>
        <button
          type="button"
          className={stls.placePickerButton}
          onClick={() => onPick("groomer")}
        >
          <IconGroomer />
        </button>
      </div>
    </div>
  );
};

