import { useMemo, useState } from "react";
import { Dialog, SwipeableDrawer, useMediaQuery } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "../api/supabase-сlient";
import { Siba } from "../../feature/siba/siba";
import { PlaceDetail } from "../../feature/map/place-detail";
import type { Place, PlaceKind } from "../../feature/map/place-types";

type NewsPanelProps = {
  authUserId: string;
  open: boolean;
  onClose: () => void;
};

type FeedItem = {
  id: string;
  date: string;
  actorSibaId: string;
  actorSibaName: string;
  actorSibaAvatar: string;
  verb: string;
  targetSiba?: { id: string; name: string };
  place?: { kind: PlaceKind; place: Place };
};

type SibaNewsRow = {
  id: string;
  siba_user_id: string;
  siba_name: string;
  siba_icon: string;
  photos: string | null;
};

export const NewsPanel = ({ authUserId, open, onClose }: NewsPanelProps) => {
  const isMobile = useMediaQuery("(max-width:600px)");
  const [selectedSibaId, setSelectedSibaId] = useState<string | null>(null);
  const [selectedPlace, setSelectedPlace] = useState<{
    kind: PlaceKind;
    place: Place;
  } | null>(null);

  const newsQuery = useQuery<FeedItem[]>({
    queryKey: ["news-feed", authUserId],
    enabled: Boolean(authUserId && open),
    queryFn: async () => {
      const { data: followers, error: followersErr } = await supabase
        .from("user_friends")
        .select("user_id")
        .eq("friend_user_id", authUserId);
      if (followersErr) throw followersErr;
      const followerIds = (followers ?? []).map((x: { user_id: string }) => x.user_id);
      if (!followerIds.length) return [];

      const { data: sibas, error: sibasErr } = await supabase
        .from("sibains")
        .select("id,siba_user_id,siba_name,siba_icon,photos")
        .in("siba_user_id", followerIds);
      if (sibasErr) throw sibasErr;
      const typedSibas = (sibas ?? []) as SibaNewsRow[];
      const sibaById = new Map<string, SibaNewsRow>(
        typedSibas.map((s) => [s.id, s]),
      );

      const sibaIds = typedSibas.map((s) => s.id);
      if (!sibaIds.length) return [];

      const [cafes, parks, groomers] = await Promise.all([
        supabase.from("cafes").select("*"),
        supabase.from("parks").select("*"),
        supabase.from("groomers").select("*"),
      ]);
      const placeByKey = new Map<string, { kind: PlaceKind; place: Place }>();
      (cafes.data ?? []).forEach((p: Place) =>
        placeByKey.set(`cafe:${p.id}`, { kind: "cafe", place: p }),
      );
      (parks.data ?? []).forEach((p: Place) =>
        placeByKey.set(`park:${p.id}`, { kind: "park", place: p }),
      );
      (groomers.data ?? []).forEach((p: Place) =>
        placeByKey.set(`groomer:${p.id}`, { kind: "groomer", place: p }),
      );

      const [cafeVisits, parkVisits, groomerVisits] = await Promise.all([
        supabase
          .from("siba_cafe_visits")
          .select("id,cafe_id,siba_id,visited_at")
          .in("siba_id", sibaIds)
          .order("visited_at", { ascending: false })
          .limit(20),
        supabase
          .from("siba_park_visits")
          .select("id,place_id,siba_id,visited_at")
          .in("siba_id", sibaIds)
          .order("visited_at", { ascending: false })
          .limit(20),
        supabase
          .from("siba_groomer_visits")
          .select("id,place_id,siba_id,visited_at")
          .in("siba_id", sibaIds)
          .order("visited_at", { ascending: false })
          .limit(20),
      ]);

      const visitItems: FeedItem[] = [];
      (cafeVisits.data ?? []).forEach((v: { id: string; cafe_id: string; siba_id: string; visited_at: string }) => {
        const siba = sibaById.get(v.siba_id);
        const place = placeByKey.get(`cafe:${v.cafe_id}`);
        if (!siba || !place) return;
        visitItems.push({
          id: `vc-${v.id}`,
          date: v.visited_at,
          actorSibaId: siba.id,
          actorSibaName: siba.siba_name,
          actorSibaAvatar: siba.photos ?? `/${siba.siba_icon}.png`,
          verb: "сегодня посетил",
          place,
        });
      });
      (parkVisits.data ?? []).forEach((v: { id: string; place_id: string; siba_id: string; visited_at: string }) => {
        const siba = sibaById.get(v.siba_id);
        const place = placeByKey.get(`park:${v.place_id}`);
        if (!siba || !place) return;
        visitItems.push({
          id: `vp-${v.id}`,
          date: v.visited_at,
          actorSibaId: siba.id,
          actorSibaName: siba.siba_name,
          actorSibaAvatar: siba.photos ?? `/${siba.siba_icon}.png`,
          verb: "сегодня посетил",
          place,
        });
      });
      (groomerVisits.data ?? []).forEach((v: { id: string; place_id: string; siba_id: string; visited_at: string }) => {
        const siba = sibaById.get(v.siba_id);
        const place = placeByKey.get(`groomer:${v.place_id}`);
        if (!siba || !place) return;
        visitItems.push({
          id: `vg-${v.id}`,
          date: v.visited_at,
          actorSibaId: siba.id,
          actorSibaName: siba.siba_name,
          actorSibaAvatar: siba.photos ?? `/${siba.siba_icon}.png`,
          verb: "сегодня посетил",
          place,
        });
      });

      const [newCafes, newParks, newGroomers] = await Promise.all([
        supabase
          .from("cafes")
          .select("*")
          .in("created_by", followerIds)
          .order("created_at", { ascending: false })
          .limit(10),
        supabase
          .from("parks")
          .select("*")
          .in("created_by", followerIds)
          .order("created_at", { ascending: false })
          .limit(10),
        supabase
          .from("groomers")
          .select("*")
          .in("created_by", followerIds)
          .order("created_at", { ascending: false })
          .limit(10),
      ]);

      const sibaByUser = new Map<string, SibaNewsRow>(
        typedSibas.map((s) => [s.siba_user_id, s]),
      );
      const createItems: FeedItem[] = [];
      (newCafes.data ?? []).forEach((p: Place & { created_by?: string; created_at?: string }) => {
        const s = p.created_by ? sibaByUser.get(p.created_by) : null;
        if (!s) return;
        createItems.push({
          id: `ac-${p.id}`,
          date: p.created_at ?? new Date().toISOString(),
          actorSibaId: s.id,
          actorSibaName: s.siba_name,
          actorSibaAvatar: s.photos ?? `/${s.siba_icon}.png`,
          verb: "добавил кафе",
          place: { kind: "cafe", place: p },
        });
      });
      (newParks.data ?? []).forEach((p: Place & { created_by?: string; created_at?: string }) => {
        const s = p.created_by ? sibaByUser.get(p.created_by) : null;
        if (!s) return;
        createItems.push({
          id: `ap-${p.id}`,
          date: p.created_at ?? new Date().toISOString(),
          actorSibaId: s.id,
          actorSibaName: s.siba_name,
          actorSibaAvatar: s.photos ?? `/${s.siba_icon}.png`,
          verb: "добавил парк",
          place: { kind: "park", place: p },
        });
      });
      (newGroomers.data ?? []).forEach((p: Place & { created_by?: string; created_at?: string }) => {
        const s = p.created_by ? sibaByUser.get(p.created_by) : null;
        if (!s) return;
        createItems.push({
          id: `ag-${p.id}`,
          date: p.created_at ?? new Date().toISOString(),
          actorSibaId: s.id,
          actorSibaName: s.siba_name,
          actorSibaAvatar: s.photos ?? `/${s.siba_icon}.png`,
          verb: "добавил грумера",
          place: { kind: "groomer", place: p },
        });
      });

      const friendshipRows: Array<{
        user_id: string;
        friend_user_id: string;
        created_at?: string | null;
      }> = await (async () => {
        const withCreated = await supabase
          .from("user_friends")
          .select("user_id,friend_user_id,created_at")
          .or(`user_id.in.(${followerIds.join(",")}),friend_user_id.in.(${followerIds.join(",")})`)
          .limit(60);
        if (!withCreated.error) {
          return (withCreated.data ?? []) as Array<{
            user_id: string;
            friend_user_id: string;
            created_at?: string | null;
          }>;
        }
        const withoutCreated = await supabase
          .from("user_friends")
          .select("user_id,friend_user_id")
          .or(`user_id.in.(${followerIds.join(",")}),friend_user_id.in.(${followerIds.join(",")})`)
          .limit(60);
        if (withoutCreated.error) throw withoutCreated.error;
        return (withoutCreated.data ?? []) as Array<{
          user_id: string;
          friend_user_id: string;
          created_at?: string | null;
        }>;
      })();

      const usersForSubs = Array.from(
        new Set(
          friendshipRows.flatMap((r) => [r.user_id, r.friend_user_id]),
        ),
      );
      const { data: allSubsSibas, error: allSubsSibasErr } = await supabase
        .from("sibains")
        .select("id,siba_user_id,siba_name,siba_icon,photos")
        .in("siba_user_id", usersForSubs);
      if (allSubsSibasErr) throw allSubsSibasErr;
      const subByUser = new Map<string, SibaNewsRow>(
        ((allSubsSibas ?? []) as SibaNewsRow[]).map((s) => [s.siba_user_id, s]),
      );

      const subscriptionItems: FeedItem[] = [];
      friendshipRows.forEach((r, idx) => {
        const from = subByUser.get(r.user_id);
        const to = subByUser.get(r.friend_user_id);
        if (!from || !to) return;
        subscriptionItems.push({
          id: `sub-${r.user_id}-${r.friend_user_id}-${idx}`,
          date: r.created_at ?? new Date().toISOString(),
          // user_id -> friend_user_id: кто подписался -> на кого подписался
          actorSibaId: from.id,
          actorSibaName: from.siba_name,
          actorSibaAvatar: from.photos ?? `/${from.siba_icon}.png`,
          verb: "подписался на",
          targetSiba: {
            id: to.id,
            name: to.siba_name,
          },
        });
      });

      return [...visitItems, ...createItems, ...subscriptionItems]
        .sort((a, b) => +new Date(b.date) - +new Date(a.date))
        .slice(0, 40);
    },
  });

  const content = useMemo(
    () => (
      <div style={{ padding: 12 }}>
        <h3 style={{ marginTop: 0 }}>News</h3>
        {(newsQuery.data ?? []).map((item) => (
          <div
            key={item.id}
            style={{ display: "flex", gap: 8, alignItems: "center", padding: "8px 0" }}
          >
            <img
              src={item.actorSibaAvatar}
              alt={item.actorSibaName}
              style={{ width: 32, height: 32, borderRadius: 16, cursor: "pointer" }}
              onClick={() => setSelectedSibaId(item.actorSibaId)}
            />
            <div style={{ color: "#333944", lineHeight: 1.3 }}>
              <span
                style={{ cursor: "pointer", fontWeight: 600 }}
                onClick={() => setSelectedSibaId(item.actorSibaId)}
              >
                {item.actorSibaName}
              </span>{" "}
              <span>{item.verb}</span>{" "}
              {item.targetSiba && (
                <span
                  style={{ cursor: "pointer", fontWeight: 600 }}
                  onClick={() => setSelectedSibaId(item.targetSiba!.id)}
                >
                  {item.targetSiba.name}
                </span>
              )}{" "}
              {item.place && (
                <span
                  style={{ cursor: "pointer", textDecoration: "underline" }}
                  onClick={() => setSelectedPlace(item.place!)}
                >
                  {item.place.place.name}
                </span>
              )}
              <div style={{ color: "#74736E", fontSize: 12 }}>
                {new Date(item.date).toLocaleString()}
              </div>
            </div>
          </div>
        ))}
      </div>
    ),
    [newsQuery.data],
  );

  return (
    <>
      {isMobile ? (
        <SwipeableDrawer
          anchor="bottom"
          open={open}
          onClose={onClose}
          onOpen={() => {}}
          PaperProps={{
            sx: { height: "auto", maxHeight: "85vh", borderTopLeftRadius: 16, borderTopRightRadius: 16 },
          }}
        >
          {content}
        </SwipeableDrawer>
      ) : (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm" PaperProps={{ sx: { borderRadius: 2 } }}>
          {content}
        </Dialog>
      )}
      {isMobile ? (
        <SwipeableDrawer
          anchor="bottom"
          open={Boolean(selectedSibaId)}
          onClose={() => setSelectedSibaId(null)}
          onOpen={() => {}}
          PaperProps={{
            sx: { height: "auto", maxHeight: "85vh", borderTopLeftRadius: 16, borderTopRightRadius: 16 },
          }}
        >
          {selectedSibaId && <Siba id={selectedSibaId} />}
        </SwipeableDrawer>
      ) : (
        <Dialog open={Boolean(selectedSibaId)} onClose={() => setSelectedSibaId(null)} fullWidth maxWidth="xs">
          {selectedSibaId && <Siba id={selectedSibaId} />}
        </Dialog>
      )}
      {isMobile ? (
        <SwipeableDrawer
          anchor="bottom"
          open={Boolean(selectedPlace)}
          onClose={() => setSelectedPlace(null)}
          onOpen={() => {}}
          PaperProps={{
            sx: { height: "auto", maxHeight: "85vh", borderTopLeftRadius: 16, borderTopRightRadius: 16 },
          }}
        >
          {selectedPlace && (
            <PlaceDetail kind={selectedPlace.kind} place={selectedPlace.place} />
          )}
        </SwipeableDrawer>
      ) : (
        <Dialog open={Boolean(selectedPlace)} onClose={() => setSelectedPlace(null)} fullWidth maxWidth="xs">
          {selectedPlace && (
            <PlaceDetail kind={selectedPlace.kind} place={selectedPlace.place} />
          )}
        </Dialog>
      )}
    </>
  );
};

