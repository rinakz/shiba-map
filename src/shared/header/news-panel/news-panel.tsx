import { useMemo, useState } from "react";
import { Dialog, SwipeableDrawer, useMediaQuery } from "@mui/material";
import Skeleton from "@mui/material/Skeleton";
import { useQuery } from "@tanstack/react-query";
import { Siba } from "../../../feature/siba/siba";
import { PlaceDetail } from "../../../feature/map/place-detail";
import type { Place, PlaceKind } from "../../../feature/map/place-types";
import type { FeedItem, NewsPanelProps } from "./news-panel.types";
import { fetchNewsFeed, formatFeedTimeAgo } from "./news-panel.utils";
import {
  placeIconHrefByKind,
  placeMarkerAccentByKind,
} from "../../../feature/map/general-map.utils";
import { IconGraduationCap } from "../../../shared/icons/IconGraduationCap";

const COMMAND_ICON_BG = "#5E7C8C";
const COMMAND_ICON_FG = "#FFFCF5";

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
    queryFn: () => fetchNewsFeed(authUserId),
  });

  const content = useMemo(
    () => (
      <div style={{ padding: 12 }}>
        <h3 style={{ marginTop: 0 }}>News</h3>
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
        {(newsQuery.data ?? []).map((item) => (
          <div
            key={item.id}
            style={{ display: "flex", gap: 8, alignItems: "flex-start", padding: "8px 0" }}
          >
            <img
              src={item.actorSibaAvatar}
              alt={item.actorSibaName}
              style={{ width: 32, height: 32, borderRadius: 16, cursor: "pointer" }}
              onClick={() => setSelectedSibaId(item.actorSibaId)}
            />
            <div
              style={{
                color: "#333944",
                lineHeight: 1.3,
                display: "flex",
                gap: 8,
                alignItems: "flex-start",
                minWidth: 0,
                flex: 1,
              }}
            >
              {item.place ? (
                <img
                  src={placeIconHrefByKind[item.place.kind]}
                  alt=""
                  width={28}
                  height={28}
                  style={{ flexShrink: 0, objectFit: "contain" }}
                />
              ) : item.commandName ? (
                <span
                  style={{
                    width: 28,
                    height: 28,
                    minWidth: 28,
                    borderRadius: 999,
                    background: COMMAND_ICON_BG,
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <IconGraduationCap size={16} color={COMMAND_ICON_FG} />
                </span>
              ) : null}
              <div style={{ minWidth: 0 }}>
              <span
                style={{ cursor: "pointer", fontWeight: 800, fontSize: 15 }}
                onClick={() => setSelectedSibaId(item.actorSibaId)}
              >
                {item.actorSibaName}
              </span>{" "}
              <span style={{ fontSize: 15 }}>{item.verb}</span>{" "}
              {item.targetSiba && (
                <span
                  style={{ cursor: "pointer", fontWeight: 800, fontSize: 15 }}
                  onClick={() => setSelectedSibaId(item.targetSiba!.id)}
                >
                  {item.targetSiba!.name}
                </span>
              )}{" "}
              {item.place && (
                <span
                  role="button"
                  tabIndex={0}
                  style={{
                    cursor: "pointer",
                    fontWeight: 800,
                    fontSize: 15,
                    color: placeMarkerAccentByKind[item.place!.kind],
                  }}
                  onClick={() => setSelectedPlace(item.place!)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setSelectedPlace(item.place!);
                    }
                  }}
                >
                  {item.place!.place.name}
                </span>
              )}
              {item.commandName && (
                <span
                  style={{ fontWeight: 800, fontSize: 15, color: COMMAND_ICON_BG }}
                >
                  {item.commandName}
                </span>
              )}
              <div style={{ color: "#74736E", fontSize: 12 }}>{formatFeedTimeAgo(item.date)}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    ),
    [newsQuery.data, newsQuery.isLoading],
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
            sx: {
              height: "auto",
              maxHeight: "90dvh",
              padding: "12px",
              overflowY: "auto",
              overscrollBehavior: "contain",
              borderTopLeftRadius: 16,
              borderTopRightRadius: 16,
            },
          }}
        >
          {content}
        </SwipeableDrawer>
      ) : (
        <Dialog
          open={open}
          onClose={onClose}
          fullWidth
          maxWidth="sm"
          PaperProps={{ sx: { borderRadius: 2 } }}
        >
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
            sx: {
              height: "auto",
              maxHeight: "90dvh",
              padding: "12px",
              overflowY: "auto",
              overscrollBehavior: "contain",
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
          PaperProps={{
            sx: { borderRadius: 2, maxHeight: "90dvh", overflowY: "auto", padding: "12px" },
          }}
        >
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
            sx: {
              height: "auto",
              maxHeight: "85vh",
              borderTopLeftRadius: 16,
              borderTopRightRadius: 16,
            },
          }}
        >
          {selectedPlace && <PlaceDetail kind={selectedPlace.kind} place={selectedPlace.place} />}
        </SwipeableDrawer>
      ) : (
        <Dialog open={Boolean(selectedPlace)} onClose={() => setSelectedPlace(null)} fullWidth maxWidth="xs">
          {selectedPlace && <PlaceDetail kind={selectedPlace.kind} place={selectedPlace.place} />}
        </Dialog>
      )}
    </>
  );
};
