import { Skeleton } from "@mui/material";
import {
  LEADERBOARD_SKELETON_ROW_COUNT,
  LEADERBOARD_SKELETON_ROW_HEIGHT_PX,
} from "./leaderboard-page.constants";
import stls from "./leaderboard-page.module.sass";

export const LeaderboardListSkeleton = () => {
  return (
    <div className={stls.skeletonList} aria-busy="true">
      {Array.from({ length: LEADERBOARD_SKELETON_ROW_COUNT }).map((_, i) => (
        <Skeleton
          key={`lb-sk-${i}`}
          variant="rounded"
          height={LEADERBOARD_SKELETON_ROW_HEIGHT_PX}
        />
      ))}
    </div>
  );
};
