import { Dialog, SwipeableDrawer, useMediaQuery } from "@mui/material";
import Skeleton from "@mui/material/Skeleton";
import type { ShibaType } from "../types";
import stls from "./people-list-overlay.module.sass";

type PeopleListOverlayProps = {
  open: boolean;
  title: string;
  items: ShibaType[];
  isLoading?: boolean;
  emptyText?: string;
  onItemClick?: (item: ShibaType) => void;
  onClose: () => void;
};

export const PeopleListOverlay = ({
  open,
  title,
  items,
  isLoading = false,
  emptyText = "Пока никого нет",
  onItemClick,
  onClose,
}: PeopleListOverlayProps) => {
  const isMobile = useMediaQuery("(max-width:600px)");

  const content = (
    <div className={stls.peopleSheet}>
      <h3 className={stls.peopleSheetTitle}>{title}</h3>
      <div className={stls.peopleList}>
        {isLoading ? (
          <>
            <div className={stls.peopleRowSkeleton}>
              <Skeleton variant="circular" width={32} height={32} />
              <Skeleton variant="text" width="60%" height={24} />
            </div>
            <div className={stls.peopleRowSkeleton}>
              <Skeleton variant="circular" width={32} height={32} />
              <Skeleton variant="text" width="52%" height={24} />
            </div>
            <div className={stls.peopleRowSkeleton}>
              <Skeleton variant="circular" width={32} height={32} />
              <Skeleton variant="text" width="48%" height={24} />
            </div>
          </>
        ) : items.length ? (
          items.map((item) => (
            <button
              key={item.id}
              type="button"
              className={stls.peopleRow}
              onClick={() => onItemClick?.(item)}
            >
              <img
                src={item.photos ?? `/${item.siba_icon}.png`}
                alt={item.siba_name}
                className={stls.peopleAvatar}
              />
              <span className={stls.peopleName}>{item.siba_name}</span>
            </button>
          ))
        ) : (
          <div className={stls.peopleEmpty}>{emptyText}</div>
        )}
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <SwipeableDrawer
        anchor="bottom"
        open={open}
        onOpen={() => {}}
        onClose={onClose}
        PaperProps={{ className: stls.peopleOverlayPaper }}
      >
        {content}
      </SwipeableDrawer>
    );
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="xs"
      PaperProps={{ className: stls.peopleOverlayPaper }}
    >
      {content}
    </Dialog>
  );
};
