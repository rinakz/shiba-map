import { useRef, useState, type FC } from "react";
import { Dialog } from "@mui/material";
import type { BreederKennelRow } from "../../shared/api/breeder";
import {
  uploadBreederProfileDocument,
  type BreederDocKind,
} from "../../shared/api/breeder";
import { Button } from "../../shared/ui";
import stls from "./breeder-documents-section.module.sass";

type Props = {
  authUserId: string;
  kennel: BreederKennelRow | null;
  onUpdated: () => void;
};

export const BreederDocumentsSection: FC<Props> = ({
  authUserId,
  kennel,
  onUpdated,
}) => {
  const [viewerUrl, setViewerUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loadingKind, setLoadingKind] = useState<BreederDocKind | null>(null);
  const regRef = useRef<HTMLInputElement>(null);
  const vetRef = useRef<HTMLInputElement>(null);
  const awardRef = useRef<HTMLInputElement>(null);

  if (!kennel?.id) return null;

  const upload = async (kind: BreederDocKind, file: File | null) => {
    if (!file) return;
    setError(null);
    setLoadingKind(kind);
    try {
      const { error: err } = await uploadBreederProfileDocument(
        authUserId,
        kennel.id,
        kind,
        file,
      );
      if (err) setError(err);
      else onUpdated();
    } finally {
      setLoadingKind(null);
    }
  };

  const awards = kennel.doc_awards_urls ?? [];

  return (
    <section className={stls.section}>
      <h2 className={stls.title}>Документы питомника</h2>
      <p className={stls.sub}>
        Свидетельство о регистрации аффикса, ветпаспорт заводчика, награды с
        выставок.
      </p>
      <div className={stls.grid}>
        <button
          type="button"
          className={stls.tile}
          onClick={() =>
            kennel.doc_kennel_registration_url
              ? setViewerUrl(kennel.doc_kennel_registration_url)
              : regRef.current?.click()
          }
        >
          <span className={stls.tileLabel}>Свидетельство</span>
          {kennel.doc_kennel_registration_url ? (
            <img
              src={kennel.doc_kennel_registration_url}
              alt=""
              className={stls.thumb}
            />
          ) : (
            <span className={stls.tileEmpty}>Загрузить</span>
          )}
        </button>
        <input
          ref={regRef}
          type="file"
          accept="image/*"
          className={stls.hiddenInput}
          onChange={(e) => {
            void upload("registration", e.target.files?.[0] ?? null);
            e.target.value = "";
          }}
        />

        <button
          type="button"
          className={stls.tile}
          onClick={() =>
            kennel.doc_vet_passport_url
              ? setViewerUrl(kennel.doc_vet_passport_url)
              : vetRef.current?.click()
          }
        >
          <span className={stls.tileLabel}>Ветпаспорт</span>
          {kennel.doc_vet_passport_url ? (
            <img
              src={kennel.doc_vet_passport_url}
              alt=""
              className={stls.thumb}
            />
          ) : (
            <span className={stls.tileEmpty}>Загрузить</span>
          )}
        </button>
        <input
          ref={vetRef}
          type="file"
          accept="image/*"
          className={stls.hiddenInput}
          onChange={(e) => {
            void upload("vet_passport", e.target.files?.[0] ?? null);
            e.target.value = "";
          }}
        />

        <div className={stls.awardsBlock}>
          <span className={stls.tileLabel}>Награды</span>
          <div className={stls.awardsRow}>
            {awards.map((url) => (
              <button
                key={url}
                type="button"
                className={stls.awardThumb}
                onClick={() => setViewerUrl(url)}
              >
                <img src={url} alt="" />
              </button>
            ))}
            <Button
              type="button"
              size="small"
              variant="secondary"
              loading={loadingKind === "awards"}
              onClick={() => awardRef.current?.click()}
            >
              + Добавить
            </Button>
          </div>
          <input
            ref={awardRef}
            type="file"
            accept="image/*"
            className={stls.hiddenInput}
            onChange={(e) => {
              void upload("awards", e.target.files?.[0] ?? null);
              e.target.value = "";
            }}
          />
        </div>
      </div>
      {error && <p className={stls.err}>{error}</p>}

      <Dialog
        open={Boolean(viewerUrl)}
        onClose={() => setViewerUrl(null)}
        fullWidth
        maxWidth="md"
        PaperProps={{ sx: { borderRadius: 2, bgcolor: "#111" } }}
      >
        {viewerUrl && (
          <img src={viewerUrl} alt="" className={stls.fullscreenImg} />
        )}
      </Dialog>
    </section>
  );
};
