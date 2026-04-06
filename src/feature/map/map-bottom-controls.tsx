import { Button, IconButton } from "../../shared/ui";
import { IconMap } from "../../shared/icons/IconMap";
import { IconUser } from "../../shared/icons/IconUser";
import { IconFox } from "../../shared/icons/IconFox";
import { IconLayers } from "../../shared/icons/IconLayers";
import { IconCalendar as IconFillCalendar } from "../../shared/icons/IconFillCalendar";
import stls from "./map.module.sass";

type Props = {
  isShowAccept: boolean;
  onConfirmLocation: (event: React.FormEvent<HTMLElement>) => void;
  onHome: () => void;
  onMap: () => void;
  onOpenPlaces: () => void;
  onOpenCalendar: () => void;
  onProfile: () => void;
};

export const MapBottomControls = ({
  isShowAccept,
  onConfirmLocation,
  onHome,
  onMap,
  onOpenPlaces,
  onOpenCalendar,
  onProfile,
}: Props) => {
  if (!isShowAccept) {
    return (
      <>
        <div className={stls.coordinateCard}>
          <h1 className={stls.coordinateTitle}>Ваша локация</h1>
          Подтвердите ваше местоположение для быстрого поиска друзей рядом
        </div>
        <div className={stls.coordinateButton}>
          <div className={stls.coordinateButtonInner}>
            <Button onClick={onConfirmLocation} iconRight={<IconMap />} size="large">
              Подтвердить
            </Button>
          </div>
        </div>
      </>
    );
  }

  return (
    <div className={stls.coordinateButton}>
      <IconButton onClick={onHome} size="large" icon={<IconFox />} />
      <IconButton onClick={onMap} size="large" icon={<IconMap />} />
      <IconButton onClick={onOpenPlaces} size="large" icon={<IconLayers />} />
      <IconButton onClick={onOpenCalendar} size="large" icon={<IconFillCalendar />} />
      <IconButton onClick={onProfile} size="large" icon={<IconUser />} />
    </div>
  );
};

