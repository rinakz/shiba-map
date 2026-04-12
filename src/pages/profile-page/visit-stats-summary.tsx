import type { CSSProperties } from "react";
import { IconCafe, IconGroomer, IconPark } from "../../shared/icons";
import { placeMarkerAccentByKind } from "../../feature/map/general-map.utils";
import stls from "./visit-stats-summary.module.sass";

type VisitStatsSummaryProps = {
  cafe: number;
  park: number;
  groomer: number;
  /** Узкая версия для анкеты сибы (меньше отступы и типографика). */
  compact?: boolean;
  onItemClick?: (kind: "cafe" | "park" | "groomer") => void;
};

export const VisitStatsSummary = ({
  cafe,
  park,
  groomer,
  compact = false,
  onItemClick,
}: VisitStatsSummaryProps) => {
  const items: {
    key: "cafe" | "park" | "groomer";
    n: number;
    cardLabel: string;
    Icon: typeof IconCafe;
    accent: string;
  }[] = [
    {
      key: "cafe",
      n: cafe,
      cardLabel: "Места",
      Icon: IconCafe,
      accent: placeMarkerAccentByKind.cafe,
    },
    {
      key: "park",
      n: park,
      cardLabel: "Прогулки",
      Icon: IconPark,
      accent: placeMarkerAccentByKind.park,
    },
    {
      key: "groomer",
      n: groomer,
      cardLabel: "Уход",
      Icon: IconGroomer,
      accent: placeMarkerAccentByKind.groomer,
    },
  ];

  const shouldRender = compact ? items.some((item) => item.n > 0) : true;
  if (!shouldRender) return null;

  return (
    <div className={stls.visitStatsRoot}>
      <div className={stls.sectionTitle}>Достижения</div>
      <div className={stls.visitStatsGrid}>
        {items.map(({ key, n, cardLabel, Icon, accent }) => (
          <button
            key={key}
            type="button"
            className={stls.visitStatCard}
            style={{ "--visit-accent": accent } as CSSProperties}
            onClick={() => onItemClick?.(key)}
          >
            <span className={stls.visitStatCardIcon}>
              <Icon />
            </span>
            <span className={stls.visitStatCardCount}>{n}</span>
            <span className={stls.visitStatCardLabel}>{cardLabel}</span>
          </button>
        ))}
      </div>
    </div>
  );
};
