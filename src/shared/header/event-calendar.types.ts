export type EventCalendarProps = {
  open: boolean;
  onClose: () => void;
  authUserId: string;
};

export type EventRow = {
  id: string;
  title: string;
  event_at: string;
  address: string;
  description: string | null;
  organizer_user_id: string;
  coordinates: number[] | string[];
};

export type ParticipantRow = {
  event_id: string;
  user_id: string;
};

export type SibaMini = {
  siba_user_id: string;
  siba_name: string;
  siba_icon: string;
  photos: string | null;
};

export type CalendarMapProjection = {
  fromGlobalPixels: (px: [number, number], z: number) => [number, number];
};

export type CalendarMapActionTickEvent = {
  get: (key: "target" | "tick") =>
    | { options: { get: () => CalendarMapProjection } }
    | { globalPixelCenter: [number, number]; zoom: number };
};
