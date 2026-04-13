import { useContext, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Skeleton from "@mui/material/Skeleton";
import { useMediaQuery } from "@mui/material";
import { useNavigate } from "react-router-dom";
import type { ShibaType } from "../../shared/types";
import { AppContext } from "../../shared/context/app-context";
import { PATH } from "../../shared/constants/path";
import { fetchSibaPublications } from "../../shared/api/siba-publications";
import {
  NEWS_MEDIA_MOBILE,
  NEWS_PUBLICATIONS_SKELETON_COUNT,
} from "../../pages/news-page/news-page.constants";
import { fetchSibasWhoLikedNewsItems } from "../../pages/news-page/news-likes.repository";
import { NewsLikesSheet } from "../../pages/news-page/news-likes-sheet";
import { NewsStoryViewer } from "../../pages/news-page/news-story-viewer";
import stls from "./siba.module.sass";

type Props = {
  siba: ShibaType;
};

export const SibaPublicationsSection = ({ siba }: Props) => {
  const navigate = useNavigate();
  const isMobile = useMediaQuery(NEWS_MEDIA_MOBILE);
  const { authUserId } = useContext(AppContext);
  const [viewerOpen, setViewerOpen] = useState<{
    initialPublicationId: string;
  } | null>(null);
  const [publicationLikesOpenId, setPublicationLikesOpenId] = useState<
    string | null
  >(null);

  const { data: publications = [], isLoading, isFetched } = useQuery({
    queryKey: ["siba-publications", siba.id],
    queryFn: async () => {
      try {
        return await fetchSibaPublications(siba.id);
      } catch {
        return [];
      }
    },
  });

  const storyPubLikesListQuery = useQuery({
    queryKey: ["news-likes-list", "publication", publicationLikesOpenId ?? ""],
    enabled: Boolean(publicationLikesOpenId),
    queryFn: () => fetchSibasWhoLikedNewsItems([publicationLikesOpenId!]),
  });

  const canDelete =
    Boolean(authUserId) && siba.siba_user_id === authUserId;

  if (isLoading) {
    return (
      <div className={stls.publicationsSection}>
        <div className={stls.sectionTitle}>Публикации</div>
        <div className={stls.publicationsGrid}>
          {Array.from({ length: NEWS_PUBLICATIONS_SKELETON_COUNT }).map((_, i) => (
            <div key={i} className={stls.publicationCell} aria-hidden>
              <Skeleton
                variant="rounded"
                className={stls.publicationSkeletonInner}
                width="100%"
                height="100%"
              />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!isFetched || !publications.length) return null;

  return (
    <div className={stls.publicationsSection}>
      <div className={stls.sectionTitle}>Публикации</div>
      <div className={stls.publicationsGrid}>
        {publications.map((p) => (
          <button
            key={p.id}
            type="button"
            className={stls.publicationCell}
            onClick={() => setViewerOpen({ initialPublicationId: p.id })}
          >
            <img
              className={stls.publicationImg}
              src={p.image_url}
              alt=""
              decoding="async"
              referrerPolicy="no-referrer"
            />
          </button>
        ))}
      </div>
      <NewsStoryViewer
        open={Boolean(viewerOpen)}
        authUserId={authUserId ?? null}
        sibaId={siba.id}
        sibaName={siba.siba_name}
        sibaPhotos={siba.photos ?? null}
        sibaIcon={siba.siba_icon}
        publicationsScope="all"
        initialPublicationId={viewerOpen?.initialPublicationId ?? null}
        canDeletePublications={canDelete}
        onClose={() => {
          setViewerOpen(null);
          setPublicationLikesOpenId(null);
        }}
        onOpenSiba={(markerId) => {
          setViewerOpen(null);
          setPublicationLikesOpenId(null);
          navigate(PATH.Siba.replace(":id", markerId));
        }}
        onOpenPublicationLikes={(publicationId) =>
          setPublicationLikesOpenId(publicationId)
        }
      />
      <NewsLikesSheet
        isMobile={isMobile}
        open={Boolean(publicationLikesOpenId)}
        onClose={() => setPublicationLikesOpenId(null)}
        isLoading={storyPubLikesListQuery.isLoading}
        list={storyPubLikesListQuery.data ?? []}
        onPickSiba={(id) => {
          setPublicationLikesOpenId(null);
          setViewerOpen(null);
          navigate(PATH.Siba.replace(":id", id));
        }}
      />
    </div>
  );
};
