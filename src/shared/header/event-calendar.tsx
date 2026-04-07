import { useEffect, useMemo, useState } from "react";
import { Dialog, SwipeableDrawer, useMediaQuery } from "@mui/material";
import Skeleton from "@mui/material/Skeleton";
import stls from "./event-calendar.module.sass";
import { supabase } from "../api/supabase-сlient";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { CommunityBadge } from "../ui";
import {
  geocodeAddressFromCoords,
  type YMapGeocodeApi,
} from "../api/ymaps-geocode";
import type {
  EventCalendarProps,
  EventRow,
  ParticipantRow,
  SibaMini,
} from "./event-calendar.types";
import {
  dayKey,
  dayStart,
  fetchSibaByUserMap,
  isSameDay,
  monthEnd,
  monthStart,
  normalizeCoords,
  parseCoordsFromAddress,
} from "./event-calendar.utils";
import { EventCalendarView } from "./event-calendar-view";
import { EventCalendarActions } from "./event-calendar-actions";

const ymapsApiKey = import.meta.env.VITE_YMAPS_API_KEY as string | undefined;

export const EventCalendar = ({ open, onClose, authUserId }: EventCalendarProps) => {
  const isMobile = useMediaQuery("(max-width:600px)");
  const queryClient = useQueryClient();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(dayStart(new Date()));
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [dateTime, setDateTime] = useState("");
  const [description, setDescription] = useState("");
  const [coords, setCoords] = useState<[number, number]>([55.75, 37.57]);
  const [address, setAddress] = useState("");
  const [isPublishing, setIsPublishing] = useState(false);
  const [isResolvingAddress, setIsResolvingAddress] = useState(false);
  const [resolvedAddressByEvent, setResolvedAddressByEvent] = useState<
    Record<string, string>
  >({});
  const [togglingEventId, setTogglingEventId] = useState<string | null>(null);
  const [participantsEventId, setParticipantsEventId] = useState<string | null>(null);

  const from = monthStart(currentMonth);
  const to = monthEnd(currentMonth);

  const eventsQuery = useQuery<EventRow[]>({
    queryKey: ["walk-events", from.toISOString(), to.toISOString()],
    enabled: open,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("walk_events")
        .select("*")
        .gte("event_at", from.toISOString())
        .lte("event_at", new Date(to.getFullYear(), to.getMonth(), to.getDate(), 23, 59, 59).toISOString())
        .order("event_at", { ascending: true });
      if (error) return [];
      return (data ?? []) as EventRow[];
    },
  });

  const participantsQuery = useQuery<ParticipantRow[]>({
    queryKey: ["walk-event-participants", from.toISOString(), to.toISOString()],
    enabled: open,
    queryFn: async () => {
      const ids = (eventsQuery.data ?? []).map((e) => e.id);
      if (!ids.length) return [];
      const { data, error } = await supabase
        .from("walk_event_participants")
        .select("event_id,user_id")
        .in("event_id", ids);
      if (error) return [];
      return (data ?? []) as ParticipantRow[];
    },
  });

  const sibaByUserQuery = useQuery<Map<string, SibaMini>>({
    queryKey: ["walk-events-sibas", from.toISOString(), to.toISOString()],
    enabled: open,
    queryFn: async () => {
      const userIds = Array.from(
        new Set([
          ...(eventsQuery.data ?? []).map((e) => e.organizer_user_id),
          ...(participantsQuery.data ?? []).map((p) => p.user_id),
        ]),
      );
      return fetchSibaByUserMap(userIds);
    },
  });

  const events = eventsQuery.data ?? [];
  const participants = participantsQuery.data ?? [];
  const sibaByUser = sibaByUserQuery.data ?? new globalThis.Map<string, SibaMini>();
  const isCalendarLoading =
    eventsQuery.isLoading ||
    participantsQuery.isLoading ||
    sibaByUserQuery.isLoading;

  const daysWithEvents = useMemo(() => {
    const keys = new Set<string>();
    events.forEach((e) => keys.add(dayKey(new Date(e.event_at))));
    return keys;
  }, [events]);

  const selectedEvents = useMemo(
    () => events.filter((e) => isSameDay(new Date(e.event_at), selectedDay)),
    [events, selectedDay],
  );

  const daysGrid = useMemo(() => {
    const start = monthStart(currentMonth);
    const end = monthEnd(currentMonth);
    const startWeekday = (start.getDay() + 6) % 7;
    const totalDays = end.getDate();
    const result: Date[] = [];

    for (let i = 0; i < startWeekday; i++) {
      result.push(new Date(start.getFullYear(), start.getMonth(), i - startWeekday + 1));
    }
    for (let d = 1; d <= totalDays; d++) {
      result.push(new Date(start.getFullYear(), start.getMonth(), d));
    }
    while (result.length % 7 !== 0) {
      const last = result[result.length - 1];
      result.push(new Date(last.getFullYear(), last.getMonth(), last.getDate() + 1));
    }
    return result;
  }, [currentMonth]);

  const getAddressFromCoords = async (next: [number, number]) => {
    const ymaps = (window as unknown as { ymaps?: YMapGeocodeApi }).ymaps;
    if (!ymaps) return "";
    setIsResolvingAddress(true);
    try {
      return (await geocodeAddressFromCoords(ymaps, next)) ?? "";
    } catch {
      return "";
    } finally {
      setIsResolvingAddress(false);
    }
  };

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      const ymaps = (
        window as unknown as {
          ymaps?: YMapGeocodeApi;
        }
      ).ymaps;
      if (!ymaps) return;
      const pending = events.filter((e) => {
        if (resolvedAddressByEvent[e.id]) return false;
        return Boolean(parseCoordsFromAddress(e.address));
      });
      for (const event of pending) {
        const coordsFromAddress = parseCoordsFromAddress(event.address);
        const coordsFromField = normalizeCoords(event.coordinates);
        const coords = coordsFromAddress ?? coordsFromField;
        if (!coords) continue;
        try {
          const resolved = await geocodeAddressFromCoords(ymaps, coords);
          if (resolved && !cancelled) {
            setResolvedAddressByEvent((prev) => ({ ...prev, [event.id]: resolved }));
            continue;
          }
        } catch {
          // keep fallback coords text
        }
      }
    };
    run();
    return () => {
      cancelled = true;
    };
  }, [events, resolvedAddressByEvent]);

  const handleCreate = async () => {
    if (!title.trim() || !dateTime) return;
    setIsPublishing(true);
    const payload = {
      title: title.trim(),
      event_at: new Date(dateTime).toISOString(),
      address: address || JSON.stringify(coords),
      description: description.trim() || null,
      organizer_user_id: authUserId,
      coordinates: coords,
    };
    const { error } = await supabase.from("walk_events").insert([payload]);
    setIsPublishing(false);
    if (error) return;
    setIsCreateOpen(false);
    setTitle("");
    setDateTime("");
    setDescription("");
    await queryClient.invalidateQueries({ queryKey: ["walk-events"] });
  };

  const handleToggleGoing = async (eventId: string) => {
    setTogglingEventId(eventId);
    const mine = participants.find(
      (p) => p.event_id === eventId && p.user_id === authUserId,
    );
    try {
      if (mine) {
        await supabase
          .from("walk_event_participants")
          .delete()
          .eq("event_id", eventId)
          .eq("user_id", authUserId);
      } else {
        await supabase
          .from("walk_event_participants")
          .insert([{ event_id: eventId, user_id: authUserId }]);
      }
      await queryClient.invalidateQueries({ queryKey: ["walk-event-participants"] });
    } finally {
      setTogglingEventId(null);
    }
  };

  const content = (
    <div className={stls.wrap}>
      <EventCalendarView
        currentMonth={currentMonth}
        selectedDay={selectedDay}
        daysGrid={daysGrid}
        daysWithEvents={daysWithEvents}
        onPrevMonth={() =>
          setCurrentMonth(
            new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1),
          )
        }
        onNextMonth={() =>
          setCurrentMonth(
            new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1),
          )
        }
        onSelectDay={setSelectedDay}
      />

      <EventCalendarActions
        selectedEvents={selectedEvents}
        isCalendarLoading={isCalendarLoading}
        sibaByUser={sibaByUser}
        participants={participants}
        authUserId={authUserId}
        togglingEventId={togglingEventId}
        onToggleGoing={handleToggleGoing}
        onOpenParticipants={setParticipantsEventId}
        isCreateOpen={isCreateOpen}
        setIsCreateOpen={setIsCreateOpen}
        isPublishing={isPublishing}
        title={title}
        setTitle={setTitle}
        dateTime={dateTime}
        setDateTime={setDateTime}
        description={description}
        setDescription={setDescription}
        ymapsApiKey={ymapsApiKey}
        coords={coords}
        setCoords={setCoords}
        getAddressFromCoords={getAddressFromCoords}
        isResolvingAddress={isResolvingAddress}
        address={address}
        setAddress={setAddress}
        resolvedAddressByEvent={resolvedAddressByEvent}
        onCreate={handleCreate}
      />
    </div>
  );

  const participantsEvent = events.find((e) => e.id === participantsEventId);
  const participantsList = participantsEvent
    ? participants
        .filter((p) => p.event_id === participantsEvent.id)
        .map((p) => sibaByUser.get(p.user_id))
        .filter(Boolean) as SibaMini[]
    : [];

  const participantsContent = (
    <div className={stls.wrap}>
      <h3 className={stls.participantsTitle}>
        Участники {participantsEvent ? `— ${participantsEvent.title}` : ""}
      </h3>
      {isCalendarLoading ? (
        <>
          <Skeleton variant="rounded" height={48} sx={{ mb: 1 }} />
          <Skeleton variant="rounded" height={48} />
        </>
      ) : participantsList.length ? (
        participantsList.map((s) => (
          <div key={`list-${s.siba_user_id}`} className={stls.participantItem}>
            <img
              className={stls.participantAvatar}
              src={s.photos ?? `/${s.siba_icon}.png`}
              alt={s.siba_name}
            />
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <span>{s.siba_name}</span>
              <CommunityBadge
                title={s.community_title}
                avatarUrl={s.community_avatar_url}
                tgLink={s.community_tg_link}
              />
            </div>
          </div>
        ))
      ) : (
        <div className={stls.eventMeta}>Пока участников нет</div>
      )}
    </div>
  );

  return isMobile ? (
    <>
      <SwipeableDrawer
        anchor="bottom"
        open={open}
        onOpen={() => {}}
        onClose={onClose}
        PaperProps={{
          sx: {
            height: "auto",
            maxHeight: "90vh",
            borderTopLeftRadius: 16,
            borderTopRightRadius: 16,
          },
        }}
      >
        {content}
      </SwipeableDrawer>
      <SwipeableDrawer
        anchor="bottom"
        open={Boolean(participantsEventId)}
        onOpen={() => {}}
        onClose={() => setParticipantsEventId(null)}
        PaperProps={{
          sx: {
            height: "auto",
            maxHeight: "85vh",
            borderTopLeftRadius: 16,
            borderTopRightRadius: 16,
          },
        }}
      >
        {participantsContent}
      </SwipeableDrawer>
    </>
  ) : (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        fullWidth
        maxWidth="md"
        PaperProps={{ sx: { borderRadius: 2 } }}
      >
        {content}
      </Dialog>
      <Dialog
        open={Boolean(participantsEventId)}
        onClose={() => setParticipantsEventId(null)}
        fullWidth
        maxWidth="xs"
        PaperProps={{ sx: { borderRadius: 2 } }}
      >
        {participantsContent}
      </Dialog>
    </>
  );
};

