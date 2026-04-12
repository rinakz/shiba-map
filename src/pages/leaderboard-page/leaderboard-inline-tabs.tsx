import cn from "classnames";
import { LEADERBOARD_TABS } from "./leaderboard-page.constants";
import type { LeaderboardTab } from "./leaderboard-page.types";
import stls from "./leaderboard-page.module.sass";

type Props = {
  tab: LeaderboardTab;
  onTabChange: (tab: LeaderboardTab) => void;
};

export const LeaderboardInlineTabs = ({ tab, onTabChange }: Props) => {
  return (
    <div className={stls.tabs}>
      {LEADERBOARD_TABS.map(({ key, label, Icon }) => (
        <button
          key={key}
          type="button"
          className={cn(stls.tab, tab === key && stls.tabActive)}
          onClick={() => onTabChange(key)}
        >
          <Icon />
          {label}
        </button>
      ))}
    </div>
  );
};
