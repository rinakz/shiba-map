import { useContext, useMemo, useState } from "react";
import { AppContext } from "../../shared/context/app-context";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Skeleton from "@mui/material/Skeleton";
import { fetchNewsFeed } from "../../shared/header/news-panel/news-panel.utils";
import type { FeedItem } from "../../shared/header/news-panel/news-panel.types";
import stls from "../../feature/map/map.module.sass";
import { IconButton, SibaToast } from "../../shared/ui";
import { IconFox } from "../../shared/icons/IconFox";
import { IconMap } from "../../shared/icons/IconMap";
import { IconLayers } from "../../shared/icons/IconLayers";
import { IconUser } from "../../shared/icons/IconUser";
import { IconCalendar as IconFillCalendar } from "../../shared/icons/IconFillCalendar";
import { IconLike } from "../../shared/icons/IconLike";
import { useNavigate } from "react-router-dom";
import { PATH } from "../../shared/constants/path";
import { EventCalendar } from "../../shared/header/event-calendar";
import { Dialog, SwipeableDrawer, useMediaQuery } from "@mui/material";
import { Siba } from "../../feature/siba/siba";
import { useEffect } from "react";
import { fetchAllSibas, profileQueryKeys } from "../profile-page/profile.utils";
import { supabase } from "../../shared/api/supabase-сlient";

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
      if (!likesOpenItemId) return [] as Array<{ siba_user_id: string; siba_name: string; siba_icon: string; photos: string | null }>;
      const { data, error } = await supabase
        .from("news_likes")
        .select("user_id")
        .eq("item_id", likesOpenItemId);
      if (error) return [];
      const userIds = (data ?? []).map((x: { user_id: string }) => x.user_id);
      if (!userIds.length) return [];
      const { data: sibas, error: sibErr } = await supabase
        .from("sibains")
        .select("siba_user_id,siba_name,siba_icon,photos")
        .in("siba_user_id", userIds);
      if (sibErr) return [];
      return (sibas ?? []) as Array<{
        siba_user_id: string;
        siba_name: string;
        siba_icon: string;
        photos: string | null;
      }>;
    },
  });
  const likesList = likesListQuery.data ?? [];

  const content = useMemo(
    () => (
      <div style={{ padding: 12 }}>
        {newsQuery.isLoading && (
          <>
            <Skeleton variant="rounded" height={52} sx={{ mb: 1 }} />
            <Skeleton variant="rounded" height={52} sx={{ mb: 1 }} />
            <Skeleton variant="rounded" height={52} />
          </>
        )}
        {!newsQuery.isLoading && !(newsQuery.data ?? []).length && (
          <div style={{ color: "#74736E" }}>Пока нет новостей</div>
        )}
        {(newsQuery.data ?? []).map((item) => {
          const count = likesByItemCount.get(item.id) ?? 0;
          return (
            <div key={item.id} style={{ padding: "8px 0" }}>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <img
                  src={item.actorSibaAvatar}
                  alt={item.actorSibaName}
                  style={{ width: 32, height: 32, borderRadius: 16, cursor: "pointer" }}
                  onClick={() => setSelectedSibaId(item.actorSibaId)}
                />
                <div style={{ color: "#333944", lineHeight: 1.3 }}>
                  <span
                    style={{ fontWeight: 600, cursor: "pointer" }}
                    onClick={() => setSelectedSibaId(item.actorSibaId)}
                  >
                    {item.actorSibaName}
                  </span>{" "}
                  <span>{item.verb}</span>{" "}
                  {item.targetSiba && (
                    <span
                      style={{ fontWeight: 600, cursor: "pointer" }}
                      onClick={() => setSelectedSibaId(item.targetSiba!.id)}
                    >
                      {item.targetSiba.name}
                    </span>
                  )}{" "}
                  {item.place && (
                    <span style={{ textDecoration: "underline" }}>{item.place.place.name}</span>
                  )}
                  {item.commandName && <span style={{ fontWeight: 600 }}>{item.commandName}</span>}
                  <div style={{ color: "#74736E", fontSize: 12 }}>
                    {new Date(item.date).toLocaleString()}
                  </div>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginLeft: 40, marginTop: 6 }}>
                <span
                  onClick={() => toggleLikeMutation.mutate(item.id)}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: 20,
                    height: 20,
                    cursor: "pointer",
                  }}
                  title={myLikesSet.has(item.id) ? "Убрать лайк" : "Нравится"}
                >
                  <IconLike color={myLikesSet.has(item.id) ? "#E95B47" : "#74736E"} size={18} />
                </span>
                {count > 0 && (
                  <span
                    style={{ color: "#74736E", fontSize: 12, cursor: "pointer" }}
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
    [newsQuery.data, newsQuery.isLoading, likesByItemCount, myLikesSet, toggleLikeMutation],
  );

  if (!authUserId) return null;
  return (
    <div className={stls.mapContainer} style={{ minHeight: "calc(100vh - 112px)" }}>
      <div className={stls.mapWrapper} style={{ paddingTop: 8, minHeight: "calc(100vh - 112px)" }}>
        {content}
      </div>
      <div className={stls.coordinateButton}>
        <IconButton onClick={() => navigate(PATH.Home)} size="large" icon={<IconFox />} />
        <IconButton onClick={() => navigate(PATH.Map)} size="large" icon={<IconMap />} />
        <IconButton onClick={() => navigate(`${PATH.Map}?add=1`)} size="large" icon={<IconLayers />} />
        <IconButton onClick={() => setIsCalendarOpen(true)} size="large" icon={<IconFillCalendar />} />
        <IconButton onClick={() => navigate(PATH.Profile)} size="large" icon={<IconUser />} />
      </div>
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
          <div style={{ padding: 12 }}>
            <h3 style={{ marginTop: 0 }}>Лайкнули</h3>
            {likesList.map((s) => (
              <div key={s.siba_user_id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 0" }}>
                <img
                  src={s.photos ?? `/${s.siba_icon}.png`}
                  alt={s.siba_name}
                  style={{ width: 28, height: 28, borderRadius: 14, objectFit: "cover" }}
                />
                <span>{s.siba_name}</span>
              </div>
            ))}
            {!likesList.length && <div style={{ color: "#74736E" }}>Пока нет лайков</div>}
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
          <div style={{ padding: 12 }}>
            <h3 style={{ marginTop: 0 }}>Лайкнули</h3>
            {likesList.map((s) => (
              <div key={s.siba_user_id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 0" }}>
                <img
                  src={s.photos ?? `/${s.siba_icon}.png`}
                  alt={s.siba_name}
                  style={{ width: 28, height: 28, borderRadius: 14, objectFit: "cover" }}
                />
                <span>{s.siba_name}</span>
              </div>
            ))}
            {!likesList.length && <div style={{ color: "#74736E" }}>Пока нет лайков</div>}
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
