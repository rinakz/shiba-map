import { IconButton } from "../../shared/ui";
import { IconRight, IconTrophy } from "../../shared/icons";
import {
  LEADERBOARD_PAGE_SUBTITLE,
  LEADERBOARD_PAGE_TITLE,
} from "./leaderboard-page.constants";
import stls from "./leaderboard-page.module.sass";

type Props = {
  onBack: () => void;
};

export const LeaderboardHeader = ({ onBack }: Props) => {
  return (
    <div className={stls.headerRow}>
      <IconButton
        size="medium"
        variant="secondary"
        icon={
          <span style={{ display: "flex", transform: "rotate(-180deg)" }}>
            <IconRight />
          </span>
        }
        onClick={onBack}
      />
      <div>
        <div className={stls.titleWrap}>
          <IconTrophy size={20} color="#FEAE11" />
          <h1 className={stls.title}>{LEADERBOARD_PAGE_TITLE}</h1>
        </div>
        <div className={stls.subtle}>{LEADERBOARD_PAGE_SUBTITLE}</div>
      </div>
    </div>
  );
};
