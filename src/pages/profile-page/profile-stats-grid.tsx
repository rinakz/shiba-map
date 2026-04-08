import stls from "./profile.module.sass";

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
  return (
    <div className={stls.profileStatsSection}>
      <div className={stls.profileStatsGrid}>
        <div className={stls.profileStatCell}>
          <span className={stls.profileStatLabel}>⭐ Level</span>
          <span className={stls.profileStatValue}>{level ?? 0}</span>
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
    </div>
  );
};
