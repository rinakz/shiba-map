import { Siba } from "../../feature/siba/siba";
import {
  NEWS_DIALOG_SX_SIBA_PLACE,
  NEWS_DRAWER_SX_SIBA,
} from "./news-page.constants";
import { NewsResponsiveSheet } from "./news-responsive-sheet";

type Props = {
  isMobile: boolean;
  sibaId: string | null;
  onClose: () => void;
};

export const NewsSibaDetailSheet = ({
  isMobile,
  sibaId,
  onClose,
}: Props) => (
  <NewsResponsiveSheet
    isMobile={isMobile}
    open={Boolean(sibaId)}
    onClose={onClose}
    drawerSx={NEWS_DRAWER_SX_SIBA}
    dialogSx={NEWS_DIALOG_SX_SIBA_PLACE}
  >
    {sibaId ? <Siba id={sibaId} /> : null}
  </NewsResponsiveSheet>
);
