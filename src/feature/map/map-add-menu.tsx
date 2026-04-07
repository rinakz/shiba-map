import { IconLayers } from "../../shared/icons/IconLayers";
import stls from "./map.module.sass";

type Props = {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
  onAddPlace: () => void;
  onAddHazard: () => void;
};

export const MapAddMenu = ({
  isOpen,
  onOpen,
  onClose,
  onAddPlace,
  onAddHazard,
}: Props) => {
  return (
    <div className={stls.mapAddMenuWrapper}>
      {isOpen ? (
        <div className={stls.mapAddMenu}>
          <button
            type="button"
            className={stls.mapAddMenuItem}
            onClick={onAddPlace}
          >
            <span className={stls.mapAddMenuIcon}>
              <IconLayers />
            </span>
            <span className={stls.mapAddMenuText}>Добавить место</span>
          </button>
          <button
            type="button"
            className={stls.mapAddMenuItem}
            onClick={onAddHazard}
          >
            <span className={stls.mapAddMenuEmoji}>⚠️</span>
            <span className={stls.mapAddMenuText}>Сообщить об опасности</span>
          </button>
          <button
            type="button"
            className={stls.mapAddMenuClose}
            onClick={onClose}
          >
            ×
          </button>
        </div>
      ) : (
        <button
          type="button"
          className={stls.fabAdd}
          onClick={onOpen}
          aria-label="Добавить место или опасность"
        >
          +
        </button>
      )}
    </div>
  );
};
