import Skeleton from "@mui/material/Skeleton";
import { buildSafeAvatarSrc } from "../../shared/header/news-panel/news-panel.utils";
import type { ShibaType } from "../../shared/types";
import {
  NEWS_WALKING_SKELETON_COUNT,
  NEWS_WALKING_EMPTY_TEXT,
  NEWS_WALKING_TITLE,
} from "./news-page.constants";
import pageStls from "./news-page.module.sass";

type Props = {
  isLoading: boolean;
  walkingSibas: ShibaType[];
  onSelectSiba: (id: string) => void;
};

export const NewsWalkingStrip = ({
  isLoading,
  walkingSibas,
  onSelectSiba,
}: Props) => {
  return (
    <div
      className={pageStls.walkingSection}
      aria-busy={isLoading}
    >
      <div className={pageStls.walkingTitle}>{NEWS_WALKING_TITLE}</div>
      <div className={pageStls.walkingStories}>
        {isLoading ? (
          <>
            {Array.from({ length: NEWS_WALKING_SKELETON_COUNT }).map((_, i) => (
              <div
                key={i}
                className={pageStls.walkingSkeletonItem}
                aria-hidden
              >
                <Skeleton
                  variant="circular"
                  className={pageStls.walkingSkeletonAvatar}
                  width={56}
                  height={56}
                  sx={{
                    boxShadow: "0 0 0 6px rgba(74, 222, 128, 0.06)",
                  }}
                />
                <Skeleton
                  variant="rounded"
                  className={pageStls.walkingSkeletonName}
                />
              </div>
            ))}
          </>
        ) : (
          <>
            {walkingSibas.map((siba) => (
              <button
                key={siba.id}
                type="button"
                className={pageStls.storyCard}
                onClick={() => onSelectSiba(siba.id)}
              >
                <img
                  className={pageStls.storyAvatar}
                  src={buildSafeAvatarSrc(
                    siba.photos ?? null,
                    siba.siba_icon,
                  )}
                  alt={siba.siba_name}
                />
                <span className={pageStls.storyName}>{siba.siba_name}</span>
              </button>
            ))}
            {!walkingSibas.length && (
              <div className={pageStls.walkingEmpty}>
                {NEWS_WALKING_EMPTY_TEXT}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
