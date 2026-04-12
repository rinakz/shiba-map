import stls from "./leaderboard-page.module.sass";

type Props = {
  heading: string;
  detailLine: string;
  metricValue: number;
  metricLabel: string;
};

export const LeaderboardMyPlaceBar = ({
  heading,
  detailLine,
  metricValue,
  metricLabel,
}: Props) => {
  return (
    <div className={stls.myPlaceBar}>
      <div>
        <div className={stls.myPlaceText}>{heading}</div>
        <div className={stls.myPlaceValue}>{detailLine}</div>
      </div>
      <div className={stls.points}>
        <div className={stls.pointsValue}>{metricValue}</div>
        <div className={stls.pointsLabel}>{metricLabel}</div>
      </div>
    </div>
  );
};
