import { IconStar } from "../../../shared/icons/IconStar";
import type { Place, PlaceKind } from "../place-types";
import {
  placeIconHrefByKind,
  placeMarkerAccentByKind,
} from "../general-map.utils";
import stls from "../place-sheet.module.sass";

type Props = {
  kind: PlaceKind;
  place: Place;
  kindLabel: string;
  resolvedAddress: string;
  isResolvingAddress: boolean;
  rating: number | null;
  coverImage: string | null;
  placeImages: string[];
};

export const PlaceDetailHero = ({
  kind,
  place,
  kindLabel,
  resolvedAddress,
  isResolvingAddress,
  rating,
  coverImage,
  placeImages,
}: Props) => {
  return (
    <div className={stls.sheetHero}>
      <div className={stls.sheetHeader}>
        <div className={stls.sheetHeaderMain}>
          <div className={stls.kindBadgeRow}>
            <img
              src={placeIconHrefByKind[kind]}
              alt=""
              className={stls.kindBadgeMapIcon}
            />
            <span
              className={stls.kindBadgeLabel}
              style={{ color: placeMarkerAccentByKind[kind] }}
            >
              {kindLabel}
            </span>
          </div>
          <h3
            className={stls.sheetTitle}
            style={{ color: placeMarkerAccentByKind[kind] }}
          >
            {place.name}
          </h3>
          <div className={stls.sheetSubtitle}>
            {isResolvingAddress ? "Определяем адрес..." : resolvedAddress}
          </div>
        </div>
        <div className={stls.ratingBadge}>
          <span className={stls.ratingBadgeIcon}>
            <IconStar />
          </span>
          {rating ? rating.toFixed(1) : "—"}
        </div>
      </div>

      {coverImage && (
        <img className={stls.heroImage} src={coverImage} alt={place.name} />
      )}

      {placeImages.length > 1 && (
        <div className={stls.photoGrid}>
          {placeImages.slice(0, 3).map((photo) => (
            <div key={photo} className={stls.photoCard}>
              <img src={photo} alt={place.name} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
