import { IconCafe, IconGroomer, IconPark } from "../../shared/icons";
import { ProgressBar } from "../../shared/ui/progress-bar";
import type { ShibaType } from "../../shared/types";
import stls from "./profile.module.sass";

type ProfileAchievementsProps = {
  mySiba?: ShibaType;
};

export const ProfileAchievements = ({ mySiba }: ProfileAchievementsProps) => {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        width: "100%",
        gap: "12px",
      }}
    >
      Достижения
      <div className={stls.progressContainer}>
        <div className={stls.progressTitle}>
          <IconCafe />
          <p>Кафе</p>
        </div>
        <ProgressBar value={mySiba?.cafe ?? 0} color="#7A7B7B" />
        <span>{((mySiba?.cafe ?? 0) / 20) * 100}%</span>
      </div>
      <div className={stls.progressContainer}>
        <div className={stls.progressTitle}>
          <IconPark />
          <p>Парки </p>
        </div>{" "}
        <ProgressBar value={mySiba?.park ?? 0} color="#2BB26E" />
        <span>{((mySiba?.park ?? 0) / 20) * 100}%</span>
      </div>
      <div className={stls.progressContainer}>
        <div className={stls.progressTitle}>
          <IconGroomer />
          <p>Грумер </p>
        </div>
        <ProgressBar value={mySiba?.groomer ?? 0} color="#333944" />
        <span>{((mySiba?.groomer ?? 0) / 20) * 100}%</span>
      </div>
    </div>
  );
};
