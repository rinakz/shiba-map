import { PlaceDetail } from "../../feature/map/place-detail";
import type { Place, PlaceKind } from "../../feature/map/place-types";
import {
  NEWS_DIALOG_SX_SIBA_PLACE,
  NEWS_DRAWER_SX_PLACE,
} from "./news-page.constants";
import { NewsResponsiveSheet } from "./news-responsive-sheet";

type Props = {
  isMobile: boolean;
  selected: { kind: PlaceKind; place: Place } | null;
  onClose: () => void;
};

export const NewsPlaceDetailSheet = ({
  isMobile,
  selected,
  onClose,
}: Props) => (
  <NewsResponsiveSheet
    isMobile={isMobile}
    open={Boolean(selected)}
    onClose={onClose}
    drawerSx={NEWS_DRAWER_SX_PLACE}
    dialogSx={NEWS_DIALOG_SX_SIBA_PLACE}
  >
    {selected ? (
      <PlaceDetail kind={selected.kind} place={selected.place} />
    ) : null}
  </NewsResponsiveSheet>
);
