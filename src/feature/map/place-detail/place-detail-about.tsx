import type { Place, PlaceKind } from "../place-types";
import { placeDescriptionFallback } from "./place-detail.utils";
import stls from "../place-sheet.module.sass";

type Props = {
  kind: PlaceKind;
  place: Place;
};

export const PlaceDetailAbout = ({ kind, place }: Props) => {
  return (
    <div className={stls.section}>
      <h4 className={stls.sectionTitle}>О месте</h4>
      <p className={stls.sectionText}>
        {place.description ?? placeDescriptionFallback(kind)}
      </p>
    </div>
  );
};
