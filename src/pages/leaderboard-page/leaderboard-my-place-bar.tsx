import stls from "./leaderboard-page.module.sass";

type Props = {
  heading: string;
  detailLine: string;
  /** Аватар чата / сообщества (вкладка «Стаи»). */
  detailAvatarUrl?: string | null;
  levelValue: number;
  levelLabel: string;
};

export const LeaderboardMyPlaceBar = ({
  heading,
  detailLine,
  detailAvatarUrl,
  levelValue,
  levelLabel,
}: Props) => {
  return (
    <div className={stls.myPlaceBar}>
      <div className={stls.myPlaceLeft}>
        {detailAvatarUrl ? (
          <img
            src={detailAvatarUrl}
            alt=""
            className={stls.myPlaceDetailAvatar}
            decoding="async"
            referrerPolicy="no-referrer"
          />
        ) : null}
        <div className={stls.myPlaceTextBlock}>
          <div className={stls.myPlaceText}>{heading}</div>
          <div className={stls.myPlaceValue}>{detailLine}</div>
        </div>
      </div>
      <div className={stls.myPlaceMetrics}>
        <div className={stls.pointsLabelStack}>
          <div className={stls.pointsValue}>{levelValue}</div>
          <div className={stls.pointsLabel}>{levelLabel}</div>
        </div>
      </div>
    </div>
  );
};
