import { Dialog, SwipeableDrawer } from "@mui/material";
import { Siba } from "../../feature/siba/siba";
import {
  LEADERBOARD_SIBA_DIALOG_PAPER_SX,
  LEADERBOARD_SIBA_DRAWER_PAPER_SX,
} from "./leaderboard-page.constants";

type Props = {
  isMobile: boolean;
  selectedSibaId: string | null;
  onClose: () => void;
};

export const LeaderboardSibaSheet = ({
  isMobile,
  selectedSibaId,
  onClose,
}: Props) => {
  if (isMobile) {
    return (
      <SwipeableDrawer
        anchor="bottom"
        open={Boolean(selectedSibaId)}
        onClose={onClose}
        onOpen={() => {}}
        PaperProps={{
          sx: { ...LEADERBOARD_SIBA_DRAWER_PAPER_SX },
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
        sx: { ...LEADERBOARD_SIBA_DIALOG_PAPER_SX },
      }}
    >
      {selectedSibaId && <Siba id={selectedSibaId} />}
    </Dialog>
  );
};
