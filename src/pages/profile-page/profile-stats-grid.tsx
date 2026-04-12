import stls from "./profile.module.sass";
import { IconCrown } from "../../shared/icons";

type ProfileStatsGridProps = {
  level?: number | null;
  subscriptionsCount: number;
  subscribersCount: number;
  onSubscriptionsClick?: () => void;
  onSubscribersClick?: () => void;
};

export const ProfileStatsGrid = ({
  level,
  subscriptionsCount,
  subscribersCount,
  onSubscriptionsClick,
  onSubscribersClick,
}: ProfileStatsGridProps) => {
  const currentLevel = level ?? 0;
  const nextLevel = currentLevel + 1;
  const currentXp = 14;
  const xpToNext = 50;
  const remainingXp = Math.max(xpToNext - currentXp, 0);
  const progress = Math.max(0, Math.min((currentXp / xpToNext) * 100, 100));

  return (
    <div className={stls.profileStatsSection}>
      <div className={stls.profileStatsGrid}>
        <div className={stls.profileStatCell}>
          <span className={stls.profileStatLabel}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
              <IconCrown size={14} color="#FEAE11" />
              Level
            </span>
          </span>
          <span className={stls.profileStatValue}>{currentLevel}</span>
        </div>
        {onSubscriptionsClick ? (
          <button
            type="button"
            className={`${stls.profileStatCell} ${stls.profileStatButton}`}
            onClick={onSubscriptionsClick}
          >
            <span className={stls.profileStatLabel}>Подписки</span>
            <span className={stls.profileStatValue}>{subscriptionsCount}</span>
          </button>
        ) : (
          <div className={stls.profileStatCell}>
            <span className={stls.profileStatLabel}>Подписки</span>
            <span className={stls.profileStatValue}>{subscriptionsCount}</span>
          </div>
        )}
        {onSubscribersClick ? (
          <button
            type="button"
            className={`${stls.profileStatCell} ${stls.profileStatButton}`}
            onClick={onSubscribersClick}
          >
            <span className={stls.profileStatLabel}>Подписчики</span>
            <span className={stls.profileStatValue}>{subscribersCount}</span>
          </button>
        ) : (
          <div className={stls.profileStatCell}>
            <span className={stls.profileStatLabel}>Подписчики</span>
            <span className={stls.profileStatValue}>{subscribersCount}</span>
          </div>
        )}
      </div>
      <div className={stls.levelLineSection}>
        <div className={stls.levelLineTrack}>
          <div className={stls.levelLineFill} style={{ width: `${progress}%` }} />
        </div>
        <div className={stls.levelLineBottom}>
          <span className={stls.levelLineProgress}>{currentXp}/{xpToNext} XP</span>
          <span className={stls.levelLineHint}>До Level {nextLevel} осталось {remainingXp} XP</span>
        </div>
      </div>
    </div>
  );
};
