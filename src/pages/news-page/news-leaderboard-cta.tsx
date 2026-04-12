import { IconTrophy } from "../../shared/icons";
import {
  NEWS_LEADERBOARD_SUBTITLE,
  NEWS_LEADERBOARD_TITLE,
} from "./news-page.constants";
import pageStls from "./news-page.module.sass";

type Props = {
  onClick: () => void;
};

export const NewsLeaderboardCta = ({ onClick }: Props) => {
  return (
    <div className={pageStls.topRow}>
      <button
        type="button"
        onClick={onClick}
        className={pageStls.leaderboardButton}
      >
        <IconTrophy size={20} color="#FEAE11" />
        <div>
          <div className={pageStls.leaderboardTitle}>{NEWS_LEADERBOARD_TITLE}</div>
          <div className={pageStls.leaderboardSubtitle}>
            {NEWS_LEADERBOARD_SUBTITLE}
          </div>
        </div>
      </button>
    </div>
  );
};
