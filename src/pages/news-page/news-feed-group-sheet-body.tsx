import { formatFeedTimeAgo } from "../../shared/header/news-panel/news-panel.utils";
import type { FeedItem } from "../../shared/header/news-panel/news-panel.types";
import type { Place, PlaceKind } from "../../feature/map/place-types";
import { placeMarkerAccentByKind } from "../../feature/map/general-map.utils";
import type { NewsFeedGroupSheetState } from "./news-page.types";
import pageStls from "./news-page.module.sass";

type Props = {
  sheet: NewsFeedGroupSheetState;
  onSelectTargetSiba: (sibaId: string) => void;
  onSelectPlace: (kind: PlaceKind, place: Place) => void;
};

export const NewsFeedGroupSheetBody = ({
  sheet,
  onSelectTargetSiba,
  onSelectPlace,
}: Props) => {
  return (
    <>
      <h3 className={pageStls.likesSheetTitle}>{sheet.title}</h3>
      {sheet.variant === "subscriptions"
        ? sheet.items.map((sub) =>
            sub.targetSiba ? (
              <div key={sub.id} className={pageStls.groupSheetRow}>
                <span className={pageStls.feedVerb}>подписался на</span>{" "}
                <button
                  type="button"
                  className={pageStls.feedTarget}
                  onClick={() => onSelectTargetSiba(sub.targetSiba!.id)}
                >
                  {sub.targetSiba.name}
                </button>
                <span className={pageStls.feedGroupItemTime}>
                  {" "}
                  · {formatFeedTimeAgo(sub.date)}
                </span>
              </div>
            ) : null,
          )
        : sheet.items
            .filter(
              (v): v is FeedItem & { place: NonNullable<FeedItem["place"]> } =>
                Boolean(v.place),
            )
            .map((v) => {
              const vp = v.place;
              return (
                <div key={v.id} className={pageStls.groupSheetRow}>
                  <span className={pageStls.feedVerb}>посетил</span>
                  {": "}
                  <button
                    type="button"
                    className={pageStls.feedPlaceButton}
                    style={{
                      color: placeMarkerAccentByKind[vp.kind],
                    }}
                    onClick={() => onSelectPlace(vp.kind, vp.place)}
                  >
                    {vp.place.name}
                  </button>
                  <span className={pageStls.feedGroupItemTime}>
                    {" "}
                    · {formatFeedTimeAgo(v.date)}
                  </span>
                </div>
              );
            })}
    </>
  );
};
