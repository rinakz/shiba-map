import type { ShibaType } from "../../shared/types";
import stls from "./profile.module.sass";
import visitStls from "./visit-stats-summary.module.sass";
import { IconCrown, IconPeople } from "../../shared/icons";
import { getXpBarSegment } from "./profile-xp.utils";

type ProfileStatsGridProps = {
  mySiba?: ShibaType;
  subscriptionsCount: number;
  subscribersCount: number;
  onSubscriptionsClick?: () => void;
  onSubscribersClick?: () => void;
};

export const ProfileStatsGrid = ({
  mySiba,
  subscriptionsCount,
  subscribersCount,
  onSubscriptionsClick,
  onSubscribersClick,
}: ProfileStatsGridProps) => {
  const xp = Math.max(0, Math.trunc(Number(mySiba?.experience_points) || 0));
  const segment = getXpBarSegment(xp);
  const displayLevel = mySiba?.level ?? 0;
  const currentXp = segment.xpInStep;
  const xpToNext = segment.xpStepSize;
  const progress = Math.max(
    0,
    Math.min((currentXp / Math.max(xpToNext, 1)) * 100, 100),
  );

  return (
    <div className={stls.profileStatsSection}>
      <div className={visitStls.visitStatsRoot} style={{ gap: 0 }}>
        <div className={visitStls.visitStatsGrid}>
          <div
            className={`${visitStls.visitStatCard} ${visitStls.visitStatCardStatic}`}
          >
            <span className={visitStls.visitStatCardIcon}>
              <IconCrown size={22} color="#FEAE11" />
            </span>
            <span className={visitStls.visitStatCardCount}>{displayLevel}</span>
            <span className={visitStls.visitStatCardLabel}>Level</span>
          </div>
          {onSubscriptionsClick ? (
            <button
              type="button"
              className={visitStls.visitStatCard}
              onClick={onSubscriptionsClick}
            >
              <span className={visitStls.visitStatCardIcon}>
                <IconPeople />
              </span>
              <span className={visitStls.visitStatCardCount}>
                {subscriptionsCount}
              </span>
              <span className={visitStls.visitStatCardLabel}>Подписки</span>
            </button>
          ) : (
            <div
              className={`${visitStls.visitStatCard} ${visitStls.visitStatCardStatic}`}
            >
              <span className={visitStls.visitStatCardIcon}>
                <IconPeople />
              </span>
              <span className={visitStls.visitStatCardCount}>
                {subscriptionsCount}
              </span>
              <span className={visitStls.visitStatCardLabel}>Подписки</span>
            </div>
          )}
          {onSubscribersClick ? (
            <button
              type="button"
              className={visitStls.visitStatCard}
              onClick={onSubscribersClick}
            >
              <span className={visitStls.visitStatCardIcon}>
                <IconPeople />
              </span>
              <span className={visitStls.visitStatCardCount}>
                {subscribersCount}
              </span>
              <span className={visitStls.visitStatCardLabel}>Подписчики</span>
            </button>
          ) : (
            <div
              className={`${visitStls.visitStatCard} ${visitStls.visitStatCardStatic}`}
            >
              <span className={visitStls.visitStatCardIcon}>
                <IconPeople />
              </span>
              <span className={visitStls.visitStatCardCount}>
                {subscribersCount}
              </span>
              <span className={visitStls.visitStatCardLabel}>Подписчики</span>
            </div>
          )}
        </div>
      </div>
      <div className={stls.levelLineSection}>
        <div className={stls.levelLineTrack}>
          <div className={stls.levelLineFill} style={{ width: `${progress}%` }} />
        </div>
        <div className={stls.levelLineBottom}>
          <span className={stls.levelLineProgress}>
            {currentXp}/{xpToNext} XP до следующего уровня
          </span>
        </div>
      </div>
    </div>
  );
};
