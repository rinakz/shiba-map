import {
  NEWS_DIALOG_SX_COMPACT,
  NEWS_DRAWER_SX_STANDARD,
} from "./news-page.constants";
import type { NewsLikesListRow } from "./news-page.types";
import { NewsLikesListBody } from "./news-likes-list-body";
import { NewsResponsiveSheet } from "./news-responsive-sheet";

type Props = {
  isMobile: boolean;
  open: boolean;
  onClose: () => void;
  isLoading: boolean;
  list: NewsLikesListRow[];
  onPickSiba: (sibaId: string) => void;
};

export const NewsLikesSheet = ({
  isMobile,
  open,
  onClose,
  isLoading,
  list,
  onPickSiba,
}: Props) => {
  return (
    <NewsResponsiveSheet
      isMobile={isMobile}
      open={open}
      onClose={onClose}
      drawerSx={NEWS_DRAWER_SX_STANDARD}
      dialogSx={NEWS_DIALOG_SX_COMPACT}
    >
      <NewsLikesListBody
        isLoading={isLoading}
        list={list}
        onPickSiba={onPickSiba}
      />
    </NewsResponsiveSheet>
  );
};
