import { Button } from "../../shared/ui";
import { IconHouse } from "../../shared/icons/IconHouse";
import {
  NEWS_BREEDER_FEED_ACCENT,
  NEWS_EXPERT_COMPOSER_LABEL,
  NEWS_EXPERT_PLACEHOLDER,
  NEWS_EXPERT_PUBLISH,
} from "./news-page.constants";
import pageStls from "./news-page.module.sass";

type Props = {
  draft: string;
  error: string | null;
  posting: boolean;
  onDraftChange: (value: string) => void;
  onPublish: () => void;
};

export const NewsExpertComposer = ({
  draft,
  error,
  posting,
  onDraftChange,
  onPublish,
}: Props) => {
  return (
    <div className={pageStls.expertComposer}>
      <div className={pageStls.expertComposerHead}>
        <span className={pageStls.expertHouseIcon}>
          <IconHouse size={22} color={NEWS_BREEDER_FEED_ACCENT} />
        </span>
        <span>{NEWS_EXPERT_COMPOSER_LABEL}</span>
      </div>
      <textarea
        className={pageStls.expertTextarea}
        rows={3}
        placeholder={NEWS_EXPERT_PLACEHOLDER}
        value={draft}
        onChange={(e) => onDraftChange(e.target.value)}
      />
      {error ? <div className={pageStls.expertErr}>{error}</div> : null}
      <Button size="small" loading={posting} onClick={onPublish}>
        {NEWS_EXPERT_PUBLISH}
      </Button>
    </div>
  );
};
