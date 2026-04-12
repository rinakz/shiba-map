import { IconButton } from "../../shared/ui";
import { IconCalendar as IconFillCalendar } from "../../shared/icons/IconFillCalendar";
import {
  NEWS_HEADER_EYEBROW,
  NEWS_HEADER_TITLE,
} from "./news-page.constants";
import pageStls from "./news-page.module.sass";

type Props = {
  onOpenCalendar: () => void;
};

export const NewsPageHeader = ({ onOpenCalendar }: Props) => {
  return (
    <div className={pageStls.headerRow}>
      <div>
        <div className={pageStls.headerEyebrow}>{NEWS_HEADER_EYEBROW}</div>
        <h1 className={pageStls.headerTitle}>{NEWS_HEADER_TITLE}</h1>
      </div>
      <IconButton
        onClick={onOpenCalendar}
        size="medium"
        icon={<IconFillCalendar size={16} />}
      />
    </div>
  );
};
