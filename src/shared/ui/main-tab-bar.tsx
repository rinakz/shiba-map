import cn from "classnames";
import { useNavigate } from "react-router-dom";
import { PATH } from "../constants/path";
import { IconFox } from "../icons/IconFox";
import { IconMap } from "../icons/IconMap";
import { IconUser } from "../icons/IconUser";
import stls from "./main-tab-bar.module.sass";

type TabId = "news" | "map" | "profile";

type Props = {
  active: TabId;
};

export const MainTabBar = ({ active }: Props) => {
  const navigate = useNavigate();

  return (
    <div className={stls.tabBar}>
      <button
        type="button"
        className={cn(stls.tabButton, active === "news" && stls.tabButtonActive)}
        onClick={() => navigate(PATH.Home)}
      >
        <span className={stls.tabIconSmall}>
          <IconFox />
        </span>
        <span className={stls.tabLabel}>News</span>
      </button>
      <button
        type="button"
        className={cn(
          stls.tabButton,
          stls.tabButtonCenter,
          active === "map" && stls.tabButtonCenterActive,
        )}
        onClick={() => navigate(PATH.Map)}
      >
        <span className={stls.tabButtonCenterWrap}>
          <IconMap />
        </span>
        <span className={stls.tabLabel}>Map</span>
      </button>
      <button
        type="button"
        className={cn(stls.tabButton, active === "profile" && stls.tabButtonActive)}
        onClick={() => navigate(PATH.Profile)}
      >
        <span className={stls.tabIconSmall}>
          <IconUser />
        </span>
        <span className={stls.tabLabel}>Profile</span>
      </button>
    </div>
  );
};
