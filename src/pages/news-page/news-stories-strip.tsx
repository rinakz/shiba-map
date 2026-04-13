import Skeleton from "@mui/material/Skeleton";
import type { StoryRingItem } from "../../shared/api/siba-publications";
import type { NewsStoryViewerOpenPayload } from "./news-page.types";
import { IconAddStories } from "../../shared/icons";
import {
  NEWS_STORIES_ADD_LABEL,
  NEWS_STORIES_EMPTY_TEXT,
  NEWS_STORIES_LIMIT_HINT,
  NEWS_STORIES_SKELETON_COUNT,
} from "./news-page.constants";
import pageStls from "./news-page.module.sass";

type Props = {
  isLoading: boolean;
  rings: StoryRingItem[];
  onOpenStory: (payload: NewsStoryViewerOpenPayload) => void;
  showAddStory?: boolean;
  addStoryBusy?: boolean;
  addStoryDisabled?: boolean;
  onAddStory?: () => void;
};

export const NewsStoriesStrip = ({
  isLoading,
  rings,
  onOpenStory,
  showAddStory,
  addStoryBusy,
  addStoryDisabled,
  onAddStory,
}: Props) => {
  const addBlocked = Boolean(addStoryDisabled);
  const addStoryCard =
    showAddStory && onAddStory ? (
      <button
        type="button"
        className={pageStls.storyCard}
        onClick={onAddStory}
        disabled={addStoryBusy || addBlocked}
        aria-label="Добавить сторис"
        title={addBlocked ? NEWS_STORIES_LIMIT_HINT : undefined}
      >
        <span className={pageStls.storiesAddIconWrap}>
          <IconAddStories className={pageStls.storiesAddIcon} size={22} />
        </span>
        <span className={pageStls.storyName}>{NEWS_STORIES_ADD_LABEL}</span>
      </button>
    ) : null;

  const skeletonCount =
    NEWS_STORIES_SKELETON_COUNT + (showAddStory && isLoading ? 1 : 0);

  return (
    <div className={pageStls.walkingSection} aria-busy={isLoading}>
      <div className={pageStls.walkingStories}>
        {!isLoading ? addStoryCard : null}
        {isLoading ? (
          <>
            {Array.from({ length: skeletonCount }).map((_, i) => (
              <div key={i} className={pageStls.walkingSkeletonItem} aria-hidden>
                <Skeleton
                  variant="circular"
                  className={pageStls.walkingSkeletonAvatar}
                  width={56}
                  height={56}
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
            {rings.map((ring) => (
              <button
                key={ring.sibaId}
                type="button"
                className={pageStls.storyCard}
                onClick={() =>
                  onOpenStory({
                    sibaId: ring.sibaId,
                    sibaName: ring.siba.siba_name,
                    photos: ring.siba.photos ?? null,
                    siba_icon: ring.siba.siba_icon,
                  })
                }
              >
                <span className={pageStls.storiesRingOuter}>
                  <span className={pageStls.storiesRingInner}>
                    <img
                      className={pageStls.storiesRingPhoto}
                      src={ring.previewUrl}
                      alt=""
                      decoding="async"
                      referrerPolicy="no-referrer"
                    />
                  </span>
                </span>
                <span className={pageStls.storyName}>
                  {ring.siba.siba_name}
                </span>
              </button>
            ))}
            {!rings.length ? (
              <div className={pageStls.walkingEmpty}>
                {NEWS_STORIES_EMPTY_TEXT}
              </div>
            ) : null}
          </>
        )}
      </div>
    </div>
  );
};
