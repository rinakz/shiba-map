import {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { AppContext } from "../../shared/context/app-context";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchNewsFeed } from "../../shared/header/news-panel/news-panel.utils";
import type { FeedItem } from "../../shared/header/news-panel/news-panel.types";
import stls from "../../feature/map/map.module.sass";
import pageStls from "./news-page.module.sass";
import { MainTabBar, SibaToast } from "../../shared/ui";
import { EventCalendar } from "../../shared/header/event-calendar";
import { useMediaQuery } from "@mui/material";
import {
  fetchAllSibas,
  fetchUserById,
  profileQueryKeys,
} from "../profile-page/profile.utils";
import { publishExpertPost } from "../../shared/api/breeder";
import { supabase } from "../../shared/api/supabase-сlient";
import { useNavigate } from "react-router-dom";
import { PATH } from "../../shared/constants/path";
import { getSibaStatus } from "../../shared/utils/siba-status";
import type { ShibaType } from "../../shared/types";
import type { Place, PlaceKind } from "../../feature/map/place-types";
import {
  buildGroupedFeedEntries,
  newsLikesMainQueryKey,
} from "./news-page-feed.utils";
import {
  NEWS_EMPTY_FEED,
  NEWS_FEED_INTERSECTION_ROOT_MARGIN,
  NEWS_MEDIA_MOBILE,
  NEWS_PAGE_SIZE,
  NEWS_TOAST_MS,
  NEWS_WALKING_MAX_STORIES,
} from "./news-page.constants";
import type { NewsFeedGroupSheetState } from "./news-page.types";
import { NewsPageHeader } from "./news-page-header";
import { NewsWalkingStrip } from "./news-walking-strip";
import { NewsLeaderboardCta } from "./news-leaderboard-cta";
import { NewsExpertComposer } from "./news-expert-composer";
import { NewsFeedLoading } from "./news-feed-loading";
import { NewsFeedEntries } from "./news-feed-entries";
import { NewsLikesSheet } from "./news-likes-sheet";
import { NewsFeedGroupSheet } from "./news-feed-group-sheet";
import { NewsSibaDetailSheet } from "./news-siba-detail-sheet";
import { NewsPlaceDetailSheet } from "./news-place-detail-sheet";

export const NewsPage = () => {
  const { authUserId, setSibaIns } = useContext(AppContext);
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const isMobile = useMediaQuery(NEWS_MEDIA_MOBILE);
  const [selectedSibaId, setSelectedSibaId] = useState<string | null>(null);
  const [likesOpenItemIds, setLikesOpenItemIds] = useState<string[] | null>(
    null,
  );
  const [feedGroupSheet, setFeedGroupSheet] =
    useState<NewsFeedGroupSheetState | null>(null);
  const [newsToast, setNewsToast] = useState<string | null>(null);
  const [expertDraft, setExpertDraft] = useState("");
  const [expertErr, setExpertErr] = useState<string | null>(null);
  const [expertPosting, setExpertPosting] = useState(false);
  const [visibleCount, setVisibleCount] = useState(NEWS_PAGE_SIZE);
  const [selectedPlace, setSelectedPlace] = useState<{
    kind: PlaceKind;
    place: Place;
  } | null>(null);
  const feedSentinelRef = useRef<HTMLDivElement>(null);
  const [prevAuthUserId, setPrevAuthUserId] = useState(authUserId);
  if (prevAuthUserId !== authUserId) {
    setPrevAuthUserId(authUserId);
    setVisibleCount(NEWS_PAGE_SIZE);
  }

  const userFeedQuery = useQuery({
    queryKey: authUserId ? profileQueryKeys.user(authUserId) : ["user", "guest"],
    queryFn: () => fetchUserById(authUserId as string),
    enabled: Boolean(authUserId),
  });

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

  const allFeedItems = newsQuery.data ?? [];
  const groupedFeedEntries = useMemo(
    () => buildGroupedFeedEntries(allFeedItems),
    [allFeedItems],
  );
  const visibleFeedEntries = useMemo(
    () => groupedFeedEntries.slice(0, visibleCount),
    [groupedFeedEntries, visibleCount],
  );

  const loadMoreFeed = useCallback(() => {
    setVisibleCount((c) =>
      Math.min(c + NEWS_PAGE_SIZE, groupedFeedEntries.length),
    );
  }, [groupedFeedEntries.length]);

  useEffect(() => {
    const node = feedSentinelRef.current;
    if (!node || groupedFeedEntries.length <= visibleCount) return;
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) loadMoreFeed();
      },
      {
        root: null,
        rootMargin: NEWS_FEED_INTERSECTION_ROOT_MARGIN,
        threshold: 0,
      },
    );
    obs.observe(node);
    return () => obs.disconnect();
  }, [groupedFeedEntries.length, visibleCount, loadMoreFeed]);

  const likesMainKey = newsLikesMainQueryKey(allFeedItems);

  const likesQuery = useQuery({
    queryKey: likesMainKey,
    enabled: Boolean(authUserId && allFeedItems.length),
    queryFn: async () => {
      const ids = allFeedItems.map((i) => i.id);
      if (!ids.length) return [] as Array<{ item_id: string; user_id: string }>;
      const { data, error } = await supabase
        .from("news_likes")
        .select("item_id,user_id")
        .in("item_id", ids);
      if (error) return [];
      return (data ?? []) as Array<{ item_id: string; user_id: string }>;
    },
  });
  const myLikesSet = useMemo(() => {
    const set = new Set<string>();
    (likesQuery.data ?? []).forEach((r) => {
      if (r.user_id === authUserId) set.add(r.item_id);
    });
    return set;
  }, [likesQuery.data, authUserId]);

  const toggleLikeMutation = useMutation({
    mutationFn: async (itemIds: string[]) => {
      if (!authUserId || !itemIds.length) return;
      const primary = itemIds[0];
      const likedAny = itemIds.some((id) => myLikesSet.has(id));
      if (likedAny) {
        for (const itemId of itemIds) {
          if (!myLikesSet.has(itemId)) continue;
          await supabase
            .from("news_likes")
            .delete()
            .eq("item_id", itemId)
            .eq("user_id", authUserId);
        }
      } else {
        await supabase
          .from("news_likes")
          .insert([{ item_id: primary, user_id: authUserId }]);
      }
    },
    onMutate: async (itemIds: string[]) => {
      await queryClient.cancelQueries({ queryKey: ["news-likes"] });
      const wasLiked = itemIds.some((id) => myLikesSet.has(id));
      const prev = queryClient.getQueryData<
        { item_id: string; user_id: string }[] | undefined
      >(likesMainKey);
      const next = prev?.slice() ?? [];
      if (wasLiked) {
        for (let i = next.length - 1; i >= 0; i--) {
          if (
            itemIds.includes(next[i].item_id) &&
            next[i].user_id === authUserId
          ) {
            next.splice(i, 1);
          }
        }
      } else {
        next.push({ item_id: itemIds[0], user_id: authUserId as string });
      }
      queryClient.setQueryData(likesMainKey, next);
      return { prev, wasLiked };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) {
        queryClient.setQueryData(likesMainKey, ctx.prev);
      }
    },
    onSuccess: (_data, _vars, ctx) => {
      setNewsToast(ctx?.wasLiked ? "Лайк убран." : "Добавили лайк.");
      window.setTimeout(() => setNewsToast(null), NEWS_TOAST_MS);
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: ["news-likes"] });
    },
  });

  const likesListQueryKey =
    likesOpenItemIds?.length && likesOpenItemIds.length > 0
      ? [...likesOpenItemIds].sort().join("|")
      : "";

  const likesListQuery = useQuery({
    queryKey: ["news-likes-list", likesListQueryKey],
    enabled: Boolean(likesOpenItemIds?.length),
    queryFn: async () => {
      if (!likesOpenItemIds?.length) {
        return [] as Array<{
          id: string;
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
        .in("item_id", likesOpenItemIds);
      if (error) return [];
      const userIds = [
        ...new Set(
          (data ?? []).map((x: { user_id: string }) => x.user_id),
        ),
      ];
      if (!userIds.length) return [];
      const { data: sibas, error: sibErr } = await supabase
        .from("siba_map_markers")
        .select(
          "id,siba_user_id,siba_name,siba_icon,photos,community_title,community_avatar_url,community_tg_link",
        )
        .in("siba_user_id", userIds);
      if (sibErr) return [];
      const rows = (sibas ?? []) as Array<{
        id: string;
        siba_user_id: string;
        siba_name: string;
        siba_icon: string;
        photos: string | null;
        community_title?: string | null;
        community_avatar_url?: string | null;
        community_tg_link?: string | null;
      }>;
      const byUser = new Map<string, (typeof rows)[0]>();
      for (const row of rows) {
        if (!byUser.has(row.siba_user_id)) byUser.set(row.siba_user_id, row);
      }
      return userIds
        .map((uid) => byUser.get(uid))
        .filter(Boolean) as typeof rows;
    },
  });
  const likesList = likesListQuery.data ?? [];

  const walkingSibas = useMemo(
    () =>
      ((sibasQuery.data ?? []) as ShibaType[])
        .filter((item) => getSibaStatus(item) === "walk")
        .slice(0, NEWS_WALKING_MAX_STORIES),
    [sibasQuery.data],
  );

  if (!authUserId) return null;
  return (
    <div className={`${pageStls.newsRoot} ${pageStls.page}`}>
      <div className={`${stls.mapWrapper} ${pageStls.pageInner}`}>
        <div className={pageStls.newsTop}>
          <NewsPageHeader onOpenCalendar={() => setIsCalendarOpen(true)} />
          <NewsWalkingStrip
            isLoading={sibasQuery.isLoading}
            walkingSibas={walkingSibas}
            onSelectSiba={setSelectedSibaId}
          />
          <NewsLeaderboardCta onClick={() => navigate(PATH.Leaderboard)} />
        </div>
        <div className={pageStls.content}>
          {userFeedQuery.data?.account_type === "breeder" && (
            <NewsExpertComposer
              draft={expertDraft}
              error={expertErr}
              posting={expertPosting}
              onDraftChange={setExpertDraft}
              onPublish={async () => {
                setExpertErr(null);
                setExpertPosting(true);
                const { error } = await publishExpertPost(expertDraft);
                setExpertPosting(false);
                if (error) {
                  setExpertErr(error);
                } else {
                  setExpertDraft("");
                  setVisibleCount(NEWS_PAGE_SIZE);
                  await queryClient.invalidateQueries({
                    queryKey: ["news-feed"],
                  });
                  setNewsToast("Пост опубликован.");
                  window.setTimeout(() => setNewsToast(null), NEWS_TOAST_MS);
                }
              }}
            />
          )}
          {newsQuery.isLoading && <NewsFeedLoading />}
          {!newsQuery.isLoading && !(newsQuery.data ?? []).length && (
            <div className={pageStls.mutedText}>{NEWS_EMPTY_FEED}</div>
          )}
          <NewsFeedEntries
            entries={visibleFeedEntries}
            likesRows={likesQuery.data}
            myLikesSet={myLikesSet}
            onToggleLike={(ids) => {
              setFeedGroupSheet(null);
              void toggleLikeMutation.mutate(ids);
            }}
            onOpenLikesSheet={(ids) => {
              setFeedGroupSheet(null);
              setLikesOpenItemIds(ids);
            }}
            onOpenSubscriptionGroup={(entry) => {
              setLikesOpenItemIds(null);
              setFeedGroupSheet({
                variant: "subscriptions",
                title: `Все подписки (${entry.items.length})`,
                items: entry.items.slice(1),
              });
            }}
            onOpenVisitGroup={(entry) => {
              setLikesOpenItemIds(null);
              setFeedGroupSheet({
                variant: "visits",
                title: `Все визиты (${entry.items.length})`,
                items: entry.items.slice(1),
              });
            }}
            onSelectActorSiba={setSelectedSibaId}
            onSelectTargetSiba={setSelectedSibaId}
            onSelectPlace={(kind, place) =>
              setSelectedPlace({ kind, place })
            }
          />
          {!newsQuery.isLoading &&
          groupedFeedEntries.length > visibleCount ? (
            <div
              ref={feedSentinelRef}
              className={pageStls.feedSentinel}
              aria-hidden
            />
          ) : null}
        </div>
      </div>
      <MainTabBar active="news" />
      <EventCalendar
        authUserId={authUserId as string}
        open={isCalendarOpen}
        onClose={() => setIsCalendarOpen(false)}
      />
      <NewsLikesSheet
        isMobile={isMobile}
        open={Boolean(likesOpenItemIds?.length)}
        onClose={() => setLikesOpenItemIds(null)}
        isLoading={likesListQuery.isLoading}
        list={likesList}
        onPickSiba={(id) => {
          setLikesOpenItemIds(null);
          setSelectedSibaId(id);
        }}
      />
      <NewsFeedGroupSheet
        isMobile={isMobile}
        sheet={feedGroupSheet}
        onClose={() => setFeedGroupSheet(null)}
        onSelectTargetSiba={(id) => {
          setFeedGroupSheet(null);
          setSelectedSibaId(id);
        }}
        onSelectPlace={(kind, place) => {
          setFeedGroupSheet(null);
          setSelectedPlace({ kind, place });
        }}
      />
      <SibaToast text={newsToast} />
      <NewsSibaDetailSheet
        isMobile={isMobile}
        sibaId={selectedSibaId}
        onClose={() => setSelectedSibaId(null)}
      />
      <NewsPlaceDetailSheet
        isMobile={isMobile}
        selected={selectedPlace}
        onClose={() => setSelectedPlace(null)}
      />
    </div>
  );
};
