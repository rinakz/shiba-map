import Skeleton from "@mui/material/Skeleton";
import { LayoutPage } from "../../shared/ui";
import stls from "./profile.module.sass";

export const ProfilePageSkeleton = () => {
  return (
    <LayoutPage>
      <div className={stls.profileContainer}>
        <Skeleton variant="rounded" width={200} height={200} />
        <Skeleton variant="text" width={220} height={56} />
        <Skeleton variant="rounded" width="100%" height={92} />
        <Skeleton variant="rounded" width="100%" height={180} />
      </div>
    </LayoutPage>
  );
};
