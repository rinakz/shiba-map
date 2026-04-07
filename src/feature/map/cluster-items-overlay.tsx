import { Dialog, SwipeableDrawer, useMediaQuery } from "@mui/material";
import type { Place } from "./place-types";
import type { ShibaType } from "../../shared/types";
import type { ClusterItem } from "./general-map.utils";
import { IconCafe } from "../../shared/icons/IconCafe";
import { IconPark } from "../../shared/icons/IconPark";
import { IconGroomer } from "../../shared/icons/IconGroomer";
import { CommunityBadge } from "../../shared/ui";
import stls from "./cluster-items-overlay.module.sass";
import {
  getSibaStatus,
  getSibaStatusColor,
  SHIBA_STATUSES,
} from "../../shared/utils/siba-status";

type ClusterItemsOverlayProps = {
  open: boolean;
  items: ClusterItem[];
  sibaIns: ShibaType[];
  cafes: Place[];
  parks: Place[];
  groomers: Place[];
  onClose: () => void;
  onOpenSiba: (sibaId: string) => void;
  onOpenPlace: (kind: "cafe" | "park" | "groomer", place: Place) => void;
};

export const ClusterItemsOverlay = ({
  open,
  items,
  sibaIns,
  cafes,
  parks,
  groomers,
  onClose,
  onOpenSiba,
  onOpenPlace,
}: ClusterItemsOverlayProps) => {
  const isMobile = useMediaQuery("(max-width:600px)");

  const content = (
    <div className={stls.container}>
      <h3 className={stls.title}>Объекты в скоплении</h3>
      {items.map((item) => {
        if (item.type === "siba") {
          const s = sibaIns.find((x) => x.id === item.id);
          if (!s) return null;
          const status = getSibaStatus(s);
          return (
            <div
              key={`siba-${item.id}`}
              className={stls.row}
              onClick={() => onOpenSiba(item.id)}
            >
              <div
                className={`${stls.thumb} ${
                  s.want_to_walk ? stls.thumbWalk : ""
                }`}
              >
                <img
                  alt={s.siba_name}
                  src={s.photos ?? `/${s.siba_icon}.png`}
                  className={stls.thumbImage}
                />
              </div>
              <div className={stls.meta}>
                <span className={stls.name}>{s.siba_name}</span>
                <CommunityBadge
                  title={s.community_title}
                  avatarUrl={s.community_avatar_url}
                  tgLink={s.community_tg_link}
                />
                {status && (
                  <span className={stls.sub} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ width: 8, height: 8, borderRadius: "50%", background: getSibaStatusColor(status), display: "inline-block" }} />
                    {SHIBA_STATUSES.find((x) => x.id === status)?.label}
                  </span>
                )}
              </div>
            </div>
          );
        }

        const place =
          item.kind === "cafe"
            ? cafes.find((p) => p.id === item.id)
            : item.kind === "park"
            ? parks.find((p) => p.id === item.id)
            : groomers.find((p) => p.id === item.id);
        if (!place) return null;

        return (
          <div
            key={`place-${item.kind}-${item.id}`}
            className={stls.row}
            onClick={() => onOpenPlace(item.kind, place)}
          >
            <div className={stls.thumb}>
              {item.kind === "cafe" ? (
                <IconCafe />
              ) : item.kind === "park" ? (
                <IconPark />
              ) : (
                <IconGroomer />
              )}
            </div>
            <div className={stls.meta}>
              <span className={stls.name}>{place.name}</span>
              <span className={stls.sub}>Нажмите, чтобы открыть</span>
            </div>
          </div>
        );
      })}
    </div>
  );

  return isMobile ? (
    <SwipeableDrawer
      anchor="bottom"
      open={open}
      onClose={onClose}
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
      {content}
    </SwipeableDrawer>
  ) : (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="xs"
      PaperProps={{
        sx: {
          borderRadius: 2,
        },
      }}
    >
      {content}
    </Dialog>
  );
};

