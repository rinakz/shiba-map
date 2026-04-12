import {
  LEADERBOARD_LOAD_ERROR,
  LEADERBOARD_RETRY_LABEL,
} from "./leaderboard-page.constants";
import stls from "./leaderboard-page.module.sass";

type Props = {
  onRetry: () => void;
};

export const LeaderboardErrorBanner = ({ onRetry }: Props) => {
  return (
    <div className={stls.errorBanner}>
      {LEADERBOARD_LOAD_ERROR}
      <div>
        <button type="button" className={stls.errorRetry} onClick={onRetry}>
          {LEADERBOARD_RETRY_LABEL}
        </button>
      </div>
    </div>
  );
};
