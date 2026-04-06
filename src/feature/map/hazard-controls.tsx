import stls from "./map.module.sass";
import { hazardEmojiByKind, type HazardKind } from "./general-map.utils";

type Props = {
  isMenuOpen: boolean;
  addingKind: HazardKind | null;
  onOpenMenu: () => void;
  onCloseMenu: () => void;
  onPickKind: (kind: HazardKind) => void;
};

export const HazardControls = ({ isMenuOpen, addingKind, onOpenMenu, onCloseMenu, onPickKind }: Props) => {
  return (
    <div className={stls.hazardFabWrapper}>
      {addingKind && <div className={stls.hazardHint}>Нажми на карту, чтобы поставить метку опасности</div>}
      {isMenuOpen ? (
        <div className={stls.hazardMenu}>
          <button
            type="button"
            className={stls.hazardMenuItem}
            onClick={() => onPickKind("doghunters")}
            title="Догхантеры"
          >
            <span className={`${stls.hazardBtn} ${stls.hazardBtnRed}`}>
              {hazardEmojiByKind.doghunters}
            </span>
            <span className={stls.hazardMenuLabel}>Догхантеры</span>
          </button>
          <button
            type="button"
            className={stls.hazardMenuItem}
            onClick={() => onPickKind("reagents")}
            title="Реагенты"
          >
            <span className={`${stls.hazardBtn} ${stls.hazardBtnBlue}`}>
              {hazardEmojiByKind.reagents}
            </span>
            <span className={stls.hazardMenuLabel}>Реагенты</span>
          </button>
          <button
            type="button"
            className={stls.hazardMenuItem}
            onClick={() => onPickKind("salute")}
            title="Салют"
          >
            <span className={`${stls.hazardBtn} ${stls.hazardBtnOrange}`}>
              {hazardEmojiByKind.salute}
            </span>
            <span className={stls.hazardMenuLabel}>Салют</span>
          </button>
          <button
            type="button"
            className={stls.hazardMenuItem}
            onClick={onCloseMenu}
            title="Закрыть"
          >
            <span className={`${stls.hazardBtn} ${stls.hazardCloseBtn}`}>×</span>
            <span className={stls.hazardMenuLabel}>Закрыть</span>
          </button>
        </div>
      ) : (
        <button type="button" className={stls.fabAdd} onClick={onOpenMenu} aria-label="Добавить опасность">+</button>
      )}
    </div>
  );
};

