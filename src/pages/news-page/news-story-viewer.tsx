import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, IconButton } from "@mui/material";
import {
  deleteSibaPublicationById,
  fetchSibaPublications,
  fetchSibaPublicationsLast24h,
  type SibaPublicationRow,
} from "../../shared/api/siba-publications";
import { supabase } from "../../shared/api/supabase-сlient";
import {
  buildSafeAvatarSrc,
  formatStoryTimeAgoRu,
} from "../../shared/header/news-panel/news-panel.utils";
import { IconDelete, IconPaw } from "../../shared/icons";
import { countLikesForFeedEntry } from "./news-page-feed.utils";
import { fetchNewsLikeRowsForItemIds } from "./news-likes.repository";
import {
  NEWS_DIALOG_SX_STORY_VIEWER,
  NEWS_Z_INDEX_STORY_VIEWER,
} from "./news-page.constants";
import { PublicationDeleteDrawer } from "./publication-delete-drawer";
import pageStls from "./news-page.module.sass";

export type NewsStoryPublicationsScope = "last24h" | "all";

type Props = {
  open: boolean;
  authUserId: string | null;
  sibaId: string | null;
  sibaName: string;
  sibaPhotos: string | null;
  sibaIcon: string;
  onClose: () => void;
  onOpenSiba: (sibaMarkerId: string) => void;
  onOpenPublicationLikes: (publicationId: string) => void;
  publicationsScope?: NewsStoryPublicationsScope;
  initialPublicationId?: string | null;
  canDeletePublications?: boolean;
};

export const NewsStoryViewer = ({
  open,
  authUserId,
  sibaId,
  sibaName,
  sibaPhotos,
  sibaIcon,
  onClose,
  onOpenSiba,
  onOpenPublicationLikes,
  publicationsScope = "last24h",
  initialPublicationId = null,
  canDeletePublications = false,
}: Props) => {
  const [index, setIndex] = useState(0);
  const [deleteDrawerOpen, setDeleteDrawerOpen] = useState(false);
  const queryClient = useQueryClient();
  const initialAppliedKeyRef = useRef<string | null>(null);

  const viewerQueryKey = useMemo(
    () => ["siba-publications-viewer", publicationsScope, sibaId] as const,
    [publicationsScope, sibaId],
  );

  const { data: items = [], isLoading } = useQuery<SibaPublicationRow[]>({
    queryKey: viewerQueryKey,
    enabled: open && Boolean(sibaId),
    queryFn: () =>
      publicationsScope === "all"
        ? fetchSibaPublications(sibaId as string)
        : fetchSibaPublicationsLast24h(sibaId as string),
  });

  const publicationIdsKey = useMemo(
    () => [...items.map((i) => i.id)].sort().join(","),
    [items],
  );

  const likesQuery = useQuery({
    queryKey: ["news-likes", "publications", publicationIdsKey],
    enabled: open && Boolean(publicationIdsKey),
    queryFn: () => fetchNewsLikeRowsForItemIds(items.map((i) => i.id)),
  });

  const toggleLikeMutation = useMutation({
    mutationFn: async ({
      publicationId,
      remove,
    }: {
      publicationId: string;
      remove: boolean;
    }) => {
      if (!authUserId) return;
      if (remove) {
        await supabase
          .from("news_likes")
          .delete()
          .eq("item_id", publicationId)
          .eq("user_id", authUserId);
      } else {
        await supabase
          .from("news_likes")
          .insert({ item_id: publicationId, user_id: authUserId });
      }
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["news-likes", "publications"],
      });
      await queryClient.invalidateQueries({ queryKey: ["news-likes-list"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (publicationId: string) => deleteSibaPublicationById(publicationId),
  });

  useEffect(() => {
    if (!open || !sibaId || !items.length) return;

    const key = initialPublicationId
      ? `${sibaId}:${initialPublicationId}`
      : `${sibaId}:head`;

    if (initialAppliedKeyRef.current === key) return;

    queueMicrotask(() => {
      if (initialPublicationId) {
        const idx = items.findIndex((i) => i.id === initialPublicationId);
        setIndex(idx >= 0 ? idx : 0);
      } else {
        setIndex(0);
      }
      initialAppliedKeyRef.current = key;
    });
  }, [open, sibaId, items, initialPublicationId]);

  useEffect(() => {
    if (!items.length || index < items.length) return;
    queueMicrotask(() => {
      setIndex(Math.max(0, items.length - 1));
    });
  }, [items.length, index]);

  useEffect(() => {
    if (open) return;
    queueMicrotask(() => {
      initialAppliedKeyRef.current = null;
      setDeleteDrawerOpen(false);
    });
  }, [open]);

  const current = items[index] ?? null;
  const canPrev = index > 0;
  const canNext = index < items.length - 1;

  const likeRows = likesQuery.data ?? [];
  const currentPubId = current?.id;
  const liked = Boolean(
    authUserId &&
      currentPubId &&
      likeRows.some(
        (r) => r.item_id === currentPubId && r.user_id === authUserId,
      ),
  );
  const likeCount = currentPubId
    ? countLikesForFeedEntry([currentPubId], likeRows)
    : 0;

  const avatarSrc = buildSafeAvatarSrc(sibaPhotos, sibaIcon);

  const openSibaFromHeader = () => {
    if (sibaId) onOpenSiba(sibaId);
  };

  const emptyText =
    publicationsScope === "all"
      ? "Нет публикаций"
      : "За сутки нет сторис";

  const runDeleteConfirmed = () => {
    if (!currentPubId || deleteMutation.isPending) return;
    deleteMutation.mutate(currentPubId, {
      onSuccess: async () => {
        setDeleteDrawerOpen(false);
        await queryClient.invalidateQueries({ queryKey: viewerQueryKey });
        await queryClient.invalidateQueries({ queryKey: ["siba-publications"] });
        await queryClient.invalidateQueries({
          queryKey: ["siba-publications-24h"],
        });
        if (sibaId) {
          await queryClient.invalidateQueries({
            queryKey: ["siba-publications-24h-for-limit", sibaId],
          });
        }
        await queryClient.invalidateQueries({ queryKey: ["news-stories-rings"] });
        await queryClient.invalidateQueries({
          queryKey: ["news-likes", "publications"],
        });
        await queryClient.invalidateQueries({ queryKey: ["news-likes-list"] });
        await queryClient.refetchQueries({ queryKey: viewerQueryKey });
        const next = queryClient.getQueryData<SibaPublicationRow[]>(viewerQueryKey);
        if (!next?.length) onClose();
      },
    });
  };

  return (
    <Fragment>
      <Dialog
        open={open}
        onClose={onClose}
        fullWidth={false}
        maxWidth={false}
        sx={{ zIndex: NEWS_Z_INDEX_STORY_VIEWER }}
        PaperProps={{ sx: NEWS_DIALOG_SX_STORY_VIEWER }}
      >
        <DialogContent
          sx={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            minHeight: 0,
            overflow: "hidden",
            padding: "12px",
          }}
        >
          <div className={pageStls.storyViewer}>
            <div className={pageStls.storyViewerHead}>
              <div className={pageStls.storyViewerHeadMain}>
                <button
                  type="button"
                  className={pageStls.feedAvatarButton}
                  onClick={openSibaFromHeader}
                  aria-label={`Профиль: ${sibaName}`}
                >
                  <img
                    className={pageStls.feedAvatar}
                    src={avatarSrc}
                    alt={sibaName}
                    decoding="async"
                    referrerPolicy="no-referrer"
                  />
                </button>
                <div className={pageStls.feedBody}>
                  <button
                    type="button"
                    className={pageStls.storyViewerNameClick}
                    onClick={openSibaFromHeader}
                  >
                    {sibaName}
                  </button>
                  {current ? (
                    <div className={pageStls.feedTimeBelow}>
                      {formatStoryTimeAgoRu(current.created_at)}
                    </div>
                  ) : isLoading ? (
                    <div className={pageStls.feedTimeBelow}>…</div>
                  ) : null}
                </div>
              </div>
              <IconButton
                type="button"
                size="small"
                onClick={onClose}
                aria-label="Закрыть"
              >
                ✕
              </IconButton>
            </div>

            {isLoading ? (
              <div className={pageStls.storyViewerBody}>Загрузка…</div>
            ) : !current ? (
              <div className={pageStls.storyViewerBody}>{emptyText}</div>
            ) : (
              <>
                <div className={pageStls.storyViewerStage}>
                  {items.length > 1 ? (
                    <>
                      <button
                        type="button"
                        className={`${pageStls.storyViewerTapZone} ${pageStls.storyViewerTapPrev} ${
                          !canPrev ? pageStls.storyViewerTapZoneInactive : ""
                        }`}
                        aria-label="Предыдущая публикация"
                        aria-disabled={!canPrev}
                        onClick={() => {
                          if (!canPrev) return;
                          setIndex((i) => Math.max(0, i - 1));
                        }}
                      />
                      <button
                        type="button"
                        className={`${pageStls.storyViewerTapZone} ${pageStls.storyViewerTapNext} ${
                          !canNext ? pageStls.storyViewerTapZoneInactive : ""
                        }`}
                        aria-label="Следующая публикация"
                        aria-disabled={!canNext}
                        onClick={() => {
                          if (!canNext) return;
                          setIndex((i) => Math.min(items.length - 1, i + 1));
                        }}
                      />
                      <div className={pageStls.storyViewerSlideHint} aria-hidden>
                        {index + 1} / {items.length}
                      </div>
                    </>
                  ) : null}
                  <div className={pageStls.storyViewerImageFrame}>
                    <img
                      className={pageStls.storyViewerImage}
                      src={current.image_url}
                      alt=""
                      decoding="async"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                </div>
                <div className={pageStls.storyViewerActions}>
                  <div className={pageStls.storyViewerActionsLeft}>
                    <button
                      type="button"
                      onClick={() => {
                        if (
                          !currentPubId ||
                          !authUserId ||
                          toggleLikeMutation.isPending
                        )
                          return;
                        toggleLikeMutation.mutate({
                          publicationId: currentPubId,
                          remove: liked,
                        });
                      }}
                      disabled={
                        !authUserId ||
                        !currentPubId ||
                        toggleLikeMutation.isPending
                      }
                      className={`${pageStls.likeButton} ${
                        liked ? pageStls.likeButtonActive : ""
                      }`}
                      title={liked ? "Убрать лайк" : "Нравится"}
                    >
                      <IconPaw size={22} color={liked ? "#E95B47" : "#A3A19E"} />
                    </button>
                    <button
                      type="button"
                      className={`${pageStls.likesCount} ${
                        liked ? pageStls.likesCountActive : ""
                      }`}
                      disabled={!currentPubId || toggleLikeMutation.isPending}
                      onClick={() => {
                        if (!currentPubId || toggleLikeMutation.isPending) return;
                        onOpenPublicationLikes(currentPubId);
                      }}
                      title="Кто лайкнул"
                    >
                      {likeCount}
                    </button>
                  </div>
                  {canDeletePublications ? (
                    <button
                      type="button"
                      className={pageStls.storyViewerDeleteBtn}
                      onClick={() => setDeleteDrawerOpen(true)}
                      disabled={deleteMutation.isPending}
                      aria-label="Удалить публикацию"
                      title="Удалить публикацию"
                    >
                      <IconDelete className={pageStls.storyViewerDeleteIcon} />
                    </button>
                  ) : null}
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
      <PublicationDeleteDrawer
        open={deleteDrawerOpen}
        isDeleting={deleteMutation.isPending}
        onClose={() => setDeleteDrawerOpen(false)}
        onConfirm={runDeleteConfirmed}
      />
    </Fragment>
  );
};
