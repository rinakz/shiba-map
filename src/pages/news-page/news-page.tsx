import { useContext, useMemo, useState } from "react";
import { AppContext } from "../../shared/context/app-context";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Skeleton from "@mui/material/Skeleton";
import { fetchNewsFeed } from "../../shared/header/news-panel/news-panel.utils";
import type { FeedItem } from "../../shared/header/news-panel/news-panel.types";
import stls from "../../feature/map/map.module.sass";
import pageStls from "./news-page.module.sass";
import { CommunityBadge, IconButton, MainTabBar, SibaToast } from "../../shared/ui";
import { IconCalendar as IconFillCalendar } from "../../shared/icons/IconFillCalendar";
import { IconLike } from "../../shared/icons/IconLike";
import { IconCrown } from "../../shared/icons/IconCrown";
import { EventCalendar } from "../../shared/header/event-calendar";
import { Dialog, SwipeableDrawer, useMediaQuery } from "@mui/material";
import { Siba } from "../../feature/siba/siba";
import { useEffect } from "react";
import { fetchAllSibas, profileQueryKeys } from "../profile-page/profile.utils";
import { supabase } from "../../shared/api/supabase-сlient";
import { useNavigate } from "react-router-dom";
import { PATH } from "../../shared/constants/path";

export const NewsPage = () => {
  const { authUserId, setSibaIns } = useContext(AppContext);
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const isMobile = useMediaQuery("(max-width:600px)");
  const [selectedSibaId, setSelectedSibaId] = useState<string | null>(null);
  const [likesOpenItemId, setLikesOpenItemId] = useState<string | null>(null);
  const [newsToast, setNewsToast] = useState<string | null>(null);

  const newsQuery = useQuery<FeedItem[]>({
    queryKey: ["news-feed", authUserId],
    enabled: Boolean(authUserId),
    queryFn: () => fetchNewsFeed(authUserId as string),
  });
  const sibasQuery = useQuery({
    queryKey: profileQueryKeys.allSibas(),
    queryFn: fetchAllSibas,
    enabled: Boolean(authUserId),
  });
  useEffect(() => {
    if (sibasQuery.data) setSibaIns(sibasQuery.data);
  }, [sibasQuery.data, setSibaIns]);

  const likesQuery = useQuery({
    queryKey: ["news-likes", (newsQuery.data ?? []).map((i) => i.id).join(",")],
    enabled: Boolean(authUserId && (newsQuery.data ?? []).length),
    queryFn: async () => {
      const ids = (newsQuery.data ?? []).map((i) => i.id);
      if (!ids.length) return [] as Array<{ item_id: string; user_id: string }>;
      const { data, error } = await supabase
        .from("news_likes")
        .select("item_id,user_id")
        .in("item_id", ids);
      if (error) return [];
      return (data ?? []) as Array<{ item_id: string; user_id: string }>;
    },
  });
  const likesByItemCount = useMemo(() => {
    const map = new Map<string, number>();
    (likesQuery.data ?? []).forEach((r) => {
      map.set(r.item_id, (map.get(r.item_id) ?? 0) + 1);
    });
    return map;
  }, [likesQuery.data]);
  const myLikesSet = useMemo(() => {
    const set = new Set<string>();
    (likesQuery.data ?? []).forEach((r) => {
      if (r.user_id === authUserId) set.add(r.item_id);
    });
    return set;
  }, [likesQuery.data, authUserId]);

  const toggleLikeMutation = useMutation({
    mutationFn: async (itemId: string) => {
      if (!authUserId) return;
      const liked = myLikesSet.has(itemId);
      if (liked) {
        await supabase.from("news_likes").delete().eq("item_id", itemId).eq("user_id", authUserId);
      } else {
        await supabase.from("news_likes").insert([{ item_id: itemId, user_id: authUserId }]);
      }
    },
    onMutate: async (itemId: string) => {
      await queryClient.cancelQueries({ queryKey: ["news-likes"] });
      const wasLiked = myLikesSet.has(itemId);
      const prev = queryClient.getQueryData<{ item_id: string; user_id: string }[] | undefined>([
        "news-likes",
        (newsQuery.data ?? []).map((i) => i.id).join(","),
      ]);
      const next =
        prev?.slice() ?? [];
      if (myLikesSet.has(itemId)) {
        // optimistic remove
        for (let i = next.length - 1; i >= 0; i--) {
          if (next[i].item_id === itemId && next[i].user_id === authUserId) {
            next.splice(i, 1);
          }
        }
      } else {
        // optimistic add
        next.push({ item_id: itemId, user_id: authUserId as string });
      }
      queryClient.setQueryData(["news-likes", (newsQuery.data ?? []).map((i) => i.id).join(",")], next);
      return { prev, wasLiked };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) {
        queryClient.setQueryData(["news-likes", (newsQuery.data ?? []).map((i) => i.id).join(",")], ctx.prev);
      }
    },
    onSuccess: (_data, _vars, ctx) => {
      setNewsToast(ctx?.wasLiked ? "Лайк убран." : "Добавили лайк.");
      window.setTimeout(() => setNewsToast(null), 1800);
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: ["news-likes"] });
    },
  });

  const likesListQuery = useQuery({
    queryKey: ["news-likes-list", likesOpenItemId],
    enabled: Boolean(likesOpenItemId),
    queryFn: async () => {
      if (!likesOpenItemId) {
        return [] as Array<{
          siba_user_id: string;
          siba_name: string;
          siba_icon: string;
          photos: string | null;
          community_title?: string | null;
          community_avatar_url?: string | null;
          community_tg_link?: string | null;
        }>;
      }
      const { data, error } = await supabase
        .from("news_likes")
        .select("user_id")
        .eq("item_id", likesOpenItemId);
      if (error) return [];
      const userIds = (data ?? []).map((x: { user_id: string }) => x.user_id);
      if (!userIds.length) return [];
      const { data: sibas, error: sibErr } = await supabase
        .from("sibains")
        .select(
          "siba_user_id,siba_name,siba_icon,photos,community_title,community_avatar_url,community_tg_link",
        )
        .in("siba_user_id", userIds);
      if (sibErr) return [];
      return (sibas ?? []) as Array<{
        siba_user_id: string;
        siba_name: string;
        siba_icon: string;
        photos: string | null;
        community_title?: string | null;
        community_avatar_url?: string | null;
        community_tg_link?: string | null;
      }>;
    },
  });
  const likesList = likesListQuery.data ?? [];
  const content = useMemo(
    () => (
      <div className={pageStls.content}>
        <div className={pageStls.topRow}>
          <button
            type="button"
            onClick={() => navigate(PATH.Leaderboard)}
            className={pageStls.leaderboardButton}
          >
            <IconCrown />
            <div>
              <div className={pageStls.leaderboardTitle}>Лидеры Сиба-мира</div>
              <div className={pageStls.leaderboardSubtitle}>
                Весь мир и Битва Чатов
              </div>
            </div>
          </button>
          <IconButton
            onClick={() => setIsCalendarOpen(true)}
            size="large"
            icon={<IconFillCalendar />}
          />
        </div>
        {newsQuery.isLoading && (
          <>
            <Skeleton variant="rounded" height={52} sx={{ mb: 1 }} />
            <Skeleton variant="rounded" height={52} sx={{ mb: 1 }} />
            <Skeleton variant="rounded" height={52} />
          </>
        )}
        {!newsQuery.isLoading && !(newsQuery.data ?? []).length && (
          <div className={pageStls.mutedText}>Пока нет новостей</div>
        )}
        {(newsQuery.data ?? []).map((item) => {
          const count = likesByItemCount.get(item.id) ?? 0;
          return (
            <div key={item.id} className={pageStls.feedItem}>
              <div className={pageStls.feedItemRow}>
                <img
                  src={item.actorSibaAvatar}
                  alt={item.actorSibaName}
                  className={pageStls.feedAvatar}
                  onClick={() => setSelectedSibaId(item.actorSibaId)}
                />
                <div className={pageStls.feedText}>
                  <span
                    className={pageStls.feedActor}
                    onClick={() => setSelectedSibaId(item.actorSibaId)}
                  >
                    {item.actorSibaName}
                  </span>{" "}
                  <div className={pageStls.feedCommunity}>
                    <CommunityBadge
                      title={item.actorCommunityTitle}
                      avatarUrl={item.actorCommunityAvatarUrl}
                      tgLink={item.actorCommunityTgLink}
                    />
                  </div>
                  <span>{item.verb}</span>{" "}
                  {item.targetSiba && (
                    <span
                      className={pageStls.feedTarget}
                      onClick={() => setSelectedSibaId(item.targetSiba!.id)}
                    >
                      {item.targetSiba.name}
                    </span>
                  )}{" "}
                  {item.place && (
                    <span className={pageStls.feedPlace}>{item.place.place.name}</span>
                  )}
                  {item.commandName && <span className={pageStls.feedCommand}>{item.commandName}</span>}
                  <div className={pageStls.feedDate}>
                    {new Date(item.date).toLocaleString()}
                  </div>
                </div>
              </div>
              <div className={pageStls.feedActions}>
                <span
                  onClick={() => toggleLikeMutation.mutate(item.id)}
                  className={pageStls.likeButton}
                  title={myLikesSet.has(item.id) ? "Убрать лайк" : "Нравится"}
                >
                  <IconLike color={myLikesSet.has(item.id) ? "#E95B47" : "#74736E"} size={18} />
                </span>
                {count > 0 && (
                  <span
                    className={pageStls.likesCount}
                    onClick={() => setLikesOpenItemId(item.id)}
                    title="Кто лайкнул"
                  >
                    нравится • {count}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    ),
    [
      navigate,
      newsQuery.data,
      newsQuery.isLoading,
      likesByItemCount,
      myLikesSet,
      toggleLikeMutation,
    ],
  );

  if (!authUserId) return null;
  return (
    <div className={`${stls.mapContainer} ${pageStls.page}`}>
      <div className={`${stls.mapWrapper} ${pageStls.pageInner}`}>
        {content}
      </div>
      <MainTabBar active="news" />
      <EventCalendar
        authUserId={authUserId as string}
        open={isCalendarOpen}
        onClose={() => setIsCalendarOpen(false)}
      />
      {isMobile ? (
        <SwipeableDrawer
          anchor="bottom"
          open={Boolean(likesOpenItemId)}
          onClose={() => setLikesOpenItemId(null)}
          onOpen={() => {}}
          PaperProps={{
            sx: {
              height: "auto",
              maxHeight: "85vh",
              borderTopLeftRadius: 16,
              borderTopRightRadius: 16,
            },
          }}
        >
          <div className={pageStls.likesSheetContent}>
            <h3 className={pageStls.likesSheetTitle}>Лайкнули</h3>
            {likesList.map((s) => (
              <div key={s.siba_user_id} className={pageStls.likesRow}>
                <img
                  src={s.photos ?? `/${s.siba_icon}.png`}
                  alt={s.siba_name}
                  className={pageStls.likesAvatar}
                />
                <div className={pageStls.likesMeta}>
                  <span>{s.siba_name}</span>
                  <CommunityBadge
                    title={s.community_title}
                    avatarUrl={s.community_avatar_url}
                    tgLink={s.community_tg_link}
                  />
                </div>
              </div>
            ))}
            {!likesList.length && <div className={pageStls.mutedText}>Пока нет лайков</div>}
          </div>
        </SwipeableDrawer>
      ) : (
        <Dialog
          open={Boolean(likesOpenItemId)}
          onClose={() => setLikesOpenItemId(null)}
          fullWidth
          maxWidth="xs"
          PaperProps={{ sx: { borderRadius: 2 } }}
        >
          <div className={pageStls.likesSheetContent}>
            <h3 className={pageStls.likesSheetTitle}>Лайкнули</h3>
            {likesList.map((s) => (
              <div key={s.siba_user_id} className={pageStls.likesRow}>
                <img
                  src={s.photos ?? `/${s.siba_icon}.png`}
                  alt={s.siba_name}
                  className={pageStls.likesAvatar}
                />
                <div className={pageStls.likesMeta}>
                  <span>{s.siba_name}</span>
                  <CommunityBadge
                    title={s.community_title}
                    avatarUrl={s.community_avatar_url}
                    tgLink={s.community_tg_link}
                  />
                </div>
              </div>
            ))}
            {!likesList.length && <div className={pageStls.mutedText}>Пока нет лайков</div>}
          </div>
        </Dialog>
      )}
      <SibaToast text={newsToast} />
      {isMobile ? (
        <SwipeableDrawer
          anchor="bottom"
          open={Boolean(selectedSibaId)}
          onClose={() => setSelectedSibaId(null)}
          onOpen={() => {}}
          PaperProps={{
            sx: {
              height: "auto",
              maxHeight: "85vh",
              borderTopLeftRadius: 16,
              borderTopRightRadius: 16,
            },
          }}
        >
          {selectedSibaId && <Siba id={selectedSibaId} />}
        </SwipeableDrawer>
      ) : (
        <Dialog
          open={Boolean(selectedSibaId)}
          onClose={() => setSelectedSibaId(null)}
          fullWidth
          maxWidth="xs"
          PaperProps={{ sx: { borderRadius: 2 } }}
        >
          {selectedSibaId && <Siba id={selectedSibaId} />}
        </Dialog>
      )}
    </div>
  );
};
