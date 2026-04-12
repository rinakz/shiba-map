import cn from "classnames";
import type { ShibaType } from "../../shared/types";
import sibaStls from "../../feature/siba/siba.module.sass";
import { VisitStatsSummary } from "./visit-stats-summary";

type ProfileAchievementsProps = {
  mySiba?: ShibaType;
};

export const ProfileAchievements = ({ mySiba }: ProfileAchievementsProps) => {
  const cafe = mySiba?.cafe ?? 0;
  const park = mySiba?.park ?? 0;
  const groomer = mySiba?.groomer ?? 0;

  return (
    <div className={cn(sibaStls.achievements, sibaStls.achievementsCompact)}>
      <VisitStatsSummary cafe={cafe} park={park} groomer={groomer} />
    </div>
  );
};
