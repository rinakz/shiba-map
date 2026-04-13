import Skeleton from "@mui/material/Skeleton";
import { OpenableCommunityBadge } from "../../shared/ui";
import {
  NEWS_LIKES_EMPTY,
  NEWS_LIKES_SHEET_TITLE,
} from "./news-page.constants";
import type { NewsLikesListRow } from "./news-page.types";
import pageStls from "./news-page.module.sass";

type Props = {
  isLoading: boolean;
  list: NewsLikesListRow[];
  onPickSiba: (sibaId: string) => void;
};

export const NewsLikesListBody = ({ isLoading, list, onPickSiba }: Props) => {
  return (
    <div className={pageStls.likesSheetContent}>
      <h3 className={pageStls.likesSheetTitle}>{NEWS_LIKES_SHEET_TITLE}</h3>
      {isLoading && (
        <>
          <Skeleton variant="rounded" height={42} sx={{ mb: 1 }} />
          <Skeleton variant="rounded" height={42} sx={{ mb: 1 }} />
          <Skeleton variant="rounded" height={42} />
        </>
      )}
      {list.map((s) => (
        <button
          key={s.siba_user_id}
          type="button"
          className={pageStls.likesRow}
          onClick={() => onPickSiba(s.id)}
        >
          <img
            src={s.photos ?? `/${s.siba_icon}.png`}
            alt={s.siba_name}
            className={pageStls.likesAvatar}
          />
          <div className={pageStls.likesMeta}>
            <span>{s.siba_name}</span>
            {s.community_title ? (
              <OpenableCommunityBadge
                title={s.community_title}
                avatarUrl={s.community_avatar_url}
                tgLink={s.community_tg_link}
                communityId={s.community_id}
              />
            ) : null}
          </div>
        </button>
      ))}
      {!isLoading && !list.length && (
        <div className={pageStls.mutedText}>{NEWS_LIKES_EMPTY}</div>
      )}
    </div>
  );
};
