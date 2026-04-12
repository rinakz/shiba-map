import Skeleton from "@mui/material/Skeleton";
import { LayoutPage } from "../../shared/ui";
import stls from "./health-pass-page.module.sass";

export const HealthPassPageSkeleton = () => {
  return (
    <LayoutPage>
      <div className={stls.page}>
        <div className={stls.skeletonHeader}>
          <Skeleton variant="rounded" width={44} height={44} />
          <Skeleton variant="rounded" className={stls.skeletonTitle} />
          <Skeleton variant="rounded" width={168} height={36} className={stls.skeletonDownload} />
        </div>

        <div className={stls.card}>
          <Skeleton variant="text" width="36%" height={26} />
          <div className={stls.row}>
            <Skeleton variant="rounded" height={40} className={stls.skeletonGrow} />
            <Skeleton variant="rounded" height={40} className={stls.skeletonGrow} />
            <Skeleton variant="rounded" width={96} height={40} />
          </div>
          <Skeleton variant="text" width="78%" height={18} />
          <Skeleton variant="text" width="52%" height={18} />
          <Skeleton variant="rounded" height={150} className={stls.skeletonChart} />
        </div>

        <div className={stls.card}>
          <Skeleton variant="text" width="48%" height={26} />
          <div className={stls.row}>
            <Skeleton variant="text" width={140} height={20} />
            <Skeleton variant="rounded" width={200} height={40} />
          </div>
          <div className={stls.grid}>
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className={stls.card}>
                <Skeleton variant="text" width="55%" height={20} />
                <Skeleton variant="text" width="70%" height={16} />
                <Skeleton variant="rounded" height={40} />
                <Skeleton variant="rounded" width="100%" height={32} />
              </div>
            ))}
          </div>
        </div>

        <div className={stls.card}>
          <Skeleton variant="text" width="28%" height={26} />
          {[0, 1, 2, 3, 4].map((i) => (
            <div className={stls.checkItem} key={i}>
              <Skeleton variant="text" width="45%" height={22} />
              <Skeleton variant="rounded" width={120} height={32} />
            </div>
          ))}
        </div>

        <div className={stls.card}>
          <Skeleton variant="text" width="32%" height={26} />
          <div className={stls.tagRow}>
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} variant="rounded" width={72 + (i % 3) * 16} height={30} />
            ))}
          </div>
          <Skeleton variant="rounded" height={40} />
          <Skeleton variant="rounded" width={140} height={36} />
        </div>
      </div>
    </LayoutPage>
  );
};
