import { Dialog, SwipeableDrawer } from "@mui/material";
import { Siba } from "../../siba/siba";

type Props = {
  isMobile: boolean;
  selectedSibaId: string | null;
  onClose: () => void;
};

export const PlaceDetailSibaSheet = ({
  isMobile,
  selectedSibaId,
  onClose,
}: Props) => {
  if (isMobile) {
    return (
      <SwipeableDrawer
        anchor="bottom"
        open={Boolean(selectedSibaId)}
        onOpen={() => {}}
        onClose={onClose}
        PaperProps={{
          sx: {
            height: "auto",
            maxHeight: "90dvh",
            padding: "12px",
            overflowY: "auto",
            overscrollBehavior: "contain",
            borderTopLeftRadius: 16,
            borderTopRightRadius: 16,
          },
        }}
      >
        {selectedSibaId && <Siba id={selectedSibaId} />}
      </SwipeableDrawer>
    );
  }

  return (
    <Dialog
      open={Boolean(selectedSibaId)}
      onClose={onClose}
      fullWidth
      maxWidth="xs"
      PaperProps={{
        sx: {
          borderRadius: 2,
          maxHeight: "90dvh",
          overflowY: "auto",
          padding: "12px",
        },
      }}
    >
      {selectedSibaId && <Siba id={selectedSibaId} />}
    </Dialog>
  );
};
