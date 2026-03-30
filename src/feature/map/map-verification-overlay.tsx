import type { ChangeEvent, RefObject } from "react";
import { Button } from "../../shared/ui";
import stls from "./map.module.sass";

type MapVerificationOverlayProps = {
  isVerifyLoading: boolean;
  verifyError: string | null;
  verifyFileInputRef: RefObject<HTMLInputElement | null>;
  onVerifyClick: () => void;
  onVerifyFileChange: (event: ChangeEvent<HTMLInputElement>) => void;
};

export const MapVerificationOverlay = ({
  isVerifyLoading,
  verifyError,
  verifyFileInputRef,
  onVerifyClick,
  onVerifyFileChange,
}: MapVerificationOverlayProps) => {
  return (
    <div className={stls.verifyOverlay}>
      <div className={stls.verifyCard}>
        <h3>Карта скрыта до верификации</h3>
        <p>Чтобы видеть пользователей на карте, сначала сделайте фото сибы.</p>
        <Button size="large" loading={isVerifyLoading} onClick={onVerifyClick}>
          Пройти верификацию
        </Button>
        {verifyError && <span className={stls.verifyError}>{verifyError}</span>}
        <input
          ref={verifyFileInputRef}
          className={stls.hiddenFileInput}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={onVerifyFileChange}
        />
      </div>
    </div>
  );
};
