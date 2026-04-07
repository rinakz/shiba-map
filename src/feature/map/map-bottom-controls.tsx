import { MainTabBar } from "../../shared/ui";
import { IconMap } from "../../shared/icons/IconMap";
import stls from "./map.module.sass";

type Props = {
  isShowAccept: boolean;
  onLocateUser: () => void;
};

export const MapBottomControls = ({
  isShowAccept,
  onLocateUser,
}: Props) => {
  return (
    <>
      {isShowAccept && (
        <div className={stls.coordinateCard}>
          <h1 className={stls.coordinateTitle}>Ваша локация</h1>
          Нажмите на кнопку карты внизу, чтобы подтвердить геопозицию и видеть друзей рядом.
        </div>
      )}
      <div className={stls.mapLocateButton}>
        <button
          type="button"
          className={stls.mapLocateInner}
          onClick={onLocateUser}
          aria-label="Подтвердить геопозицию"
        >
          <IconMap />
        </button>
      </div>
      <MainTabBar active="map" />
    </>
  );
};

