import stls from "./leaderboard-page.module.sass";

type Props = {
  heading: string;
  detailLine: string;
  levelValue: number;
  levelLabel: string;
};

export const LeaderboardMyPlaceBar = ({
  heading,
  detailLine,
  levelValue,
  levelLabel,
}: Props) => {
  return (
    <div className={stls.myPlaceBar}>
      <div>
        <div className={stls.myPlaceText}>{heading}</div>
        <div className={stls.myPlaceValue}>{detailLine}</div>
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
