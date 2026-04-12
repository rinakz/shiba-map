import type { Place, PlaceKind } from "../../feature/map/place-types";
import {
  NEWS_DIALOG_SX_COMPACT,
  NEWS_DRAWER_SX_STANDARD,
} from "./news-page.constants";
import type { NewsFeedGroupSheetState } from "./news-page.types";
import { NewsFeedGroupSheetBody } from "./news-feed-group-sheet-body";
import { NewsResponsiveSheet } from "./news-responsive-sheet";
import pageStls from "./news-page.module.sass";

type Props = {
  isMobile: boolean;
  sheet: NewsFeedGroupSheetState | null;
  onClose: () => void;
  onSelectTargetSiba: (sibaId: string) => void;
  onSelectPlace: (kind: PlaceKind, place: Place) => void;
};

export const NewsFeedGroupSheet = ({
  isMobile,
  sheet,
  onClose,
  onSelectTargetSiba,
  onSelectPlace,
}: Props) => {
  return (
    <NewsResponsiveSheet
      isMobile={isMobile}
      open={Boolean(sheet)}
      onClose={onClose}
      drawerSx={NEWS_DRAWER_SX_STANDARD}
      dialogSx={NEWS_DIALOG_SX_COMPACT}
    >
      <div className={pageStls.likesSheetContent}>
        {sheet ? (
          <NewsFeedGroupSheetBody
            sheet={sheet}
            onSelectTargetSiba={onSelectTargetSiba}
            onSelectPlace={onSelectPlace}
          />
        ) : null}
      </div>
    </NewsResponsiveSheet>
  );
};
