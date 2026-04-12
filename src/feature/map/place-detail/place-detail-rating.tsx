import { IconStar } from "../../../shared/icons/IconStar";
import stls from "../place-sheet.module.sass";

type Props = {
  previewRating: number;
  effectiveMyRating: number | null;
  myRating: number | null;
  rating: number | null;
  totalRatings: number;
  ratingQueryLoading: boolean;
  ratePending: boolean;
  ratingError: string | null;
  onRate: (value: number) => void;
  onHover: (value: number | null) => void;
};

export const PlaceDetailRating = ({
  previewRating,
  effectiveMyRating,
  myRating,
  rating,
  totalRatings,
  ratingQueryLoading,
  ratePending,
  ratingError,
  onRate,
  onHover,
}: Props) => {
  return (
    <div className={stls.section}>
      <h4 className={stls.sectionTitle}>Оценка сибика</h4>
      <div className={stls.ratingPanel}>
        <div className={stls.ratingStars}>
          {[1, 2, 3, 4, 5].map((value) => {
            const active = previewRating >= value;
            return (
              <button
                key={`rate-${value}`}
                type="button"
                className={`${stls.ratingStarButton} ${active ? stls.ratingStarButtonActive : ""}`}
                onClick={() => onRate(value)}
                onMouseEnter={() => onHover(value)}
                onMouseLeave={() => onHover(null)}
                onFocus={() => onHover(value)}
                onBlur={() => onHover(null)}
                disabled={ratePending}
                aria-pressed={Boolean(myRating && myRating >= value)}
                aria-label={`Поставить оценку ${value} из 5`}
              >
                <IconStar />
              </button>
            );
          })}
        </div>
        <div className={stls.ratingMeta}>
          {ratePending
            ? "Сохраняем вашу оценку..."
            : ratingQueryLoading
              ? "Считаем оценки..."
              : totalRatings
                ? `${rating?.toFixed(1) ?? "—"} из 5 • ${totalRatings} оценок`
                : "Пока нет оценок"}
        </div>
        <div className={stls.ratingHint}>
          {ratePending
            ? "Подождите, сохраняем ваш выбор"
            : effectiveMyRating
              ? `Ваша оценка: ${effectiveMyRating} из 5`
              : "Нажми на звездочку, чтобы поставить свою оценку"}
        </div>
        {ratingError && <div className={stls.error}>{ratingError}</div>}
      </div>
    </div>
  );
};
