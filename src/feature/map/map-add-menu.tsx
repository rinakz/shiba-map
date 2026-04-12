import { IconLayers } from "../../shared/icons/IconLayers";
import { IconWarning } from "../../shared/icons/IconWarning";
import stls from "./map.module.sass";

type Props = {
  onAddPlace: () => void;
  onAddHazard: () => void;
};

export const MapAddMenu = ({ onAddPlace, onAddHazard }: Props) => {
  return (
    <div className={stls.mapAddFabStack}>
      <button
        type="button"
        className={stls.fabAddPlace}
        onClick={onAddPlace}
        aria-label="Добавить место"
      >
        <IconLayers />
      </button>
      <button
        type="button"
        className={stls.fabAddHazard}
        onClick={onAddHazard}
        aria-label="Сообщить об опасности"
      >
        <IconWarning />
      </button>
    </div>
  );
};
