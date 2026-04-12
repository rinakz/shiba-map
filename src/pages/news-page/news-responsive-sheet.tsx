import type { ReactNode } from "react";
import { Dialog, SwipeableDrawer } from "@mui/material";
import type { SxProps, Theme } from "@mui/material/styles";

type Props = {
  isMobile: boolean;
  open: boolean;
  onClose: () => void;
  drawerSx: SxProps<Theme>;
  dialogSx?: SxProps<Theme>;
  children: ReactNode;
};

export const NewsResponsiveSheet = ({
  isMobile,
  open,
  onClose,
  drawerSx,
  dialogSx = { borderRadius: 2 },
  children,
}: Props) => {
  if (isMobile) {
    return (
      <SwipeableDrawer
        anchor="bottom"
        open={open}
        onClose={onClose}
        onOpen={() => {}}
        PaperProps={{ sx: drawerSx }}
      >
        {children}
      </SwipeableDrawer>
    );
  }
  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="xs"
      PaperProps={{ sx: dialogSx }}
    >
      {children}
    </Dialog>
  );
};
