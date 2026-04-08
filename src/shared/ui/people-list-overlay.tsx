import { Dialog, SwipeableDrawer, useMediaQuery } from "@mui/material";
import type { ShibaType } from "../types";
import stls from "./people-list-overlay.module.sass";

type PeopleListOverlayProps = {
  open: boolean;
  title: string;
  items: ShibaType[];
  onClose: () => void;
};

export const PeopleListOverlay = ({
  open,
  title,
  items,
  onClose,
}: PeopleListOverlayProps) => {
  const isMobile = useMediaQuery("(max-width:600px)");

  const content = (
    <div className={stls.peopleSheet}>
      <h3 className={stls.peopleSheetTitle}>{title}</h3>
      <div className={stls.peopleList}>
        {items.map((item) => (
          <div key={item.id} className={stls.peopleRow}>
            <img
              src={item.photos ?? `/${item.siba_icon}.png`}
              alt={item.siba_name}
              className={stls.peopleAvatar}
            />
            <span className={stls.peopleName}>{item.siba_name}</span>
          </div>
        ))}
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
