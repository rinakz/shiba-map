import { useRef, useState, type ChangeEvent, type FC } from "react";
import { Button } from "../../shared/ui";
import stls from "./breeder-map-gate.module.sass";
import type { BreederKennelRow } from "../../shared/api/breeder";
import { uploadBreederVerificationDocument } from "../../shared/api/breeder";

type Props = {
  authUserId: string;
  kennel: BreederKennelRow | null;
  onVerified: () => void;
};

export const BreederMapGate: FC<Props> = ({
  authUserId,
  kennel,
  onVerified,
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const status = kennel?.verification_status ?? "none";
  const hasDoc = Boolean(kennel?.verification_doc_url);
  const mapAllowed = Boolean(kennel?.is_verified);

  if (mapAllowed) {
    return null;
  }

  const statusLabel =
    status === "pending" || hasDoc ? "На проверке" : "Нужен документ";

  const handlePickClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    e.target.value = "";
    if (!file || !kennel?.id) return;
    setError(null);
    setLoading(true);
    try {
      const { error: err } = await uploadBreederVerificationDocument(
        authUserId,
        kennel.id,
        file,
      );
      if (err) {
        setError(err);
        return;
      }
      onVerified();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={stls.wrap}>
      <div className={stls.card}>
        <h1 className={stls.title}>Доступ к карте</h1>
        <p className={stls.text}>
          Загрузите файл с устройства: фото или скан свидетельства о регистрации
          питомника (РКФ/FCI), клейма/чипа — можно PDF или изображение.
        </p>
        <div className={stls.statusRow}>
          <span className={stls.statusBadge}>{statusLabel}</span>
          {hasDoc && (
            <span className={stls.statusHint}>
              После проверки модератором карта откроется автоматически.
            </span>
          )}
        </div>
        <Button
          size="large"
          loading={loading}
          disabled={!kennel?.id}
          style={{ width: "100%" }}
          onClick={handlePickClick}
        >
          Загрузить документ
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/heic,image/heif,image/webp,.pdf,application/pdf"
          className={stls.hiddenFileInput}
          aria-label="Выбрать файл документа для верификации питомника"
          onChange={handleFileChange}
        />
        {!kennel?.id && (
          <p className={stls.warn}>
            Питомник не найден в каталоге. Заполните профиль в разделе
            «Питомник» или обратитесь в поддержку.
          </p>
        )}
        {error && <p className={stls.err}>{error}</p>}
      </div>
    </div>
  );
};
