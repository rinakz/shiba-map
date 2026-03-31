import type { Place, PlaceKind } from "../../../feature/map/place-types";

export type NewsPanelProps = {
  authUserId: string;
  open: boolean;
  onClose: () => void;
};

export type FeedItem = {
  id: string;
  date: string;
  actorSibaId: string;
  actorSibaName: string;
  actorSibaAvatar: string;
  verb: string;
  targetSiba?: { id: string; name: string };
  place?: { kind: PlaceKind; place: Place };
  commandName?: string;
};

export type SibaNewsRow = {
  id: string;
  siba_user_id: string;
  siba_name: string;
  siba_icon: string;
  photos: string | null;
};
