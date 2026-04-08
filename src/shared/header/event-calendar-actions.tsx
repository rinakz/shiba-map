import Skeleton from "@mui/material/Skeleton";
import { YMaps, Map, Placemark, SearchControl } from "@pbe/react-yandex-maps";
import { Button, Input } from "../ui";
import { CommunityBadge } from "../ui";
import { IconCalendar, IconPawButton } from "../icons";
import stls from "./event-calendar.module.sass";
import type {
  CalendarMapActionTickEvent,
  EventRow,
  ParticipantRow,
  SibaMini,
} from "./event-calendar.types";
import {
  formatDateTime,
  normalizeCoords,
  parseCoordsFromAddress,
} from "./event-calendar.utils";

type EventCalendarActionsProps = {
  selectedEvents: EventRow[];
  isEventsLoading: boolean;
  isParticipantsLoading: boolean;
  sibaByUser: Map<string, SibaMini>;
  participants: ParticipantRow[];
  authUserId: string;
  togglingEventId: string | null;
  onToggleGoing: (eventId: string) => void;
  onOpenParticipants: (eventId: string) => void;
  isCreateOpen: boolean;
  setIsCreateOpen: (open: boolean) => void;
  isPublishing: boolean;
  title: string;
  setTitle: (value: string) => void;
  dateTime: string;
  setDateTime: (value: string) => void;
  description: string;
  setDescription: (value: string) => void;
  ymapsApiKey?: string;
  coords: [number, number];
  setCoords: (coords: [number, number]) => void;
  getAddressFromCoords: (coords: [number, number]) => Promise<string>;
  isResolvingAddress: boolean;
  address: string;
  setAddress: (value: string) => void;
  resolvedAddressByEvent: Record<string, string>;
  onCreate: () => void;
};

export const EventCalendarActions = ({
  selectedEvents,
  isEventsLoading,
  isParticipantsLoading,
  sibaByUser,
  participants,
  authUserId,
  togglingEventId,
  onToggleGoing,
  onOpenParticipants,
  isCreateOpen,
  setIsCreateOpen,
  isPublishing,
  title,
  setTitle,
  dateTime,
  setDateTime,
  description,
  setDescription,
  ymapsApiKey,
  coords,
  setCoords,
  getAddressFromCoords,
  isResolvingAddress,
  address,
  setAddress,
  resolvedAddressByEvent,
  onCreate,
}: EventCalendarActionsProps) => {
  return (
    <>
      {isEventsLoading ? (
        <>
          <Skeleton variant="rounded" height={120} sx={{ mb: 1 }} />
          <Skeleton variant="rounded" height={120} sx={{ mb: 1 }} />
        </>
      ) : !selectedEvents.length ? (
        <div className={stls.empty}>Сегодня пока никто не гуляет. Стань первым!</div>
      ) : (
        selectedEvents.map((e) => {
          const organizer = sibaByUser.get(e.organizer_user_id);
          const eventParticipants = participants.filter((p) => p.event_id === e.id);
          const participantSibas = eventParticipants
            .map((p) => sibaByUser.get(p.user_id))
            .filter(Boolean) as SibaMini[];
          const isGoing = eventParticipants.some((p) => p.user_id === authUserId);
          const norm = normalizeCoords(e.coordinates);
          const previewParticipants = participantSibas.slice(0, 5);
          const coordsFromAddress = parseCoordsFromAddress(e.address);
          const displayCoords = coordsFromAddress ?? norm;
          const displayAddress =
            resolvedAddressByEvent[e.id] ||
            (coordsFromAddress
              ? displayCoords
                ? `${displayCoords[0].toFixed(5)}, ${displayCoords[1].toFixed(5)}`
                : "Адрес не определен"
              : e.address ||
                (displayCoords
                  ? `${displayCoords[0].toFixed(5)}, ${displayCoords[1].toFixed(5)}`
                  : "Локация не указана"));
          return (
            <div key={e.id} className={stls.eventCard}>
              <div className={stls.eventTop}>
                <img
                  className={stls.avatar}
                  src={organizer?.photos ?? `/${organizer?.siba_icon ?? "default"}.png`}
                  alt={organizer?.siba_name ?? "Организатор"}
                />
                <div>
                  <div className={stls.eventName}>{e.title}</div>
                  <div className={stls.eventMeta}>{formatDateTime(e.event_at)}</div>
                  <CommunityBadge
                    title={organizer?.community_title}
                    avatarUrl={organizer?.community_avatar_url}
                    tgLink={organizer?.community_tg_link}
                  />
                </div>
              </div>
              <div className={stls.eventMeta}>{displayAddress}</div>
              {e.description && <div className={stls.eventMeta}>{e.description}</div>}
              <Button
                size="small"
                onClick={() => onToggleGoing(e.id)}
                iconRight={<IconPawButton />}
                loading={togglingEventId === e.id}
                disabled={togglingEventId === e.id}
              >
                {isGoing ? "Я пойду (выбрано)" : "Я пойду"} • {eventParticipants.length}
              </Button>
              {isParticipantsLoading ? (
                <div className={stls.participantsSkeleton} aria-hidden="true">
                  <div className={stls.avatarsStack}>
                    <Skeleton variant="circular" width={24} height={24} />
                    <Skeleton variant="circular" width={24} height={24} />
                    <Skeleton variant="circular" width={24} height={24} />
                  </div>
                  <Skeleton variant="text" width={110} height={20} />
                </div>
              ) : (
                <button
                  type="button"
                  className={stls.participantsRow}
                  onClick={() => onOpenParticipants(e.id)}
                >
                  <div className={stls.avatarsStack}>
                    {previewParticipants.length ? (
                      previewParticipants.map((s) => (
                        <img
                          key={`${e.id}-${s.siba_user_id}`}
                          className={stls.stackAvatar}
                          src={s.photos ?? `/${s.siba_icon}.png`}
                          alt={s.siba_name}
                        />
                      ))
                    ) : (
                      <img
                        className={stls.stackAvatar}
                        src="/default.png"
                        alt="Пока участников нет"
                      />
                    )}
                  </div>
                  <span className={stls.eventMeta}>
                    Участники: {eventParticipants.length}
                  </span>
                  {participantSibas.length > previewParticipants.length && (
                    <span className={stls.stackMore}>
                      +{participantSibas.length - previewParticipants.length}
                    </span>
                  )}
                </button>
              )}
            </div>
          );
        })
      )}

      <div className={stls.fab}>
        <Button
          size="small"
          iconRight={<span className={stls.smallIcon}><IconCalendar /></span>}
          onClick={() => setIsCreateOpen(!isCreateOpen)}
          disabled={isPublishing}
        >
          {isCreateOpen ? "Скрыть форму" : "Добавить событие"}
        </Button>
      </div>

      {isCreateOpen && (
        <div className={stls.form}>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Название (например, Мега-забег рыжих)"
          />
          <Input
            type="datetime-local"
            value={dateTime}
            onChange={(e) => setDateTime(e.target.value)}
          />
          {ymapsApiKey && (
            <div className={stls.miniMap}>
              <YMaps query={{ apikey: ymapsApiKey }}>
                <Map
                  width="100%"
                  height={180}
                  defaultState={{ center: coords, zoom: 12 }}
                  onActionTickComplete={(evt: CalendarMapActionTickEvent) => {
                    const projection = (
                      evt.get("target") as {
                        options: {
                          get: () => {
                            fromGlobalPixels: (
                              px: [number, number],
                              z: number,
                            ) => [number, number];
                          };
                        };
                      }
                    ).options.get();
                    const tick = evt.get("tick") as {
                      globalPixelCenter: [number, number];
                      zoom: number;
                    };
                    const next = projection.fromGlobalPixels(
                      tick.globalPixelCenter,
                      tick.zoom,
                    );
                    setCoords(next);
                    getAddressFromCoords(next).then((a) => a && setAddress(a));
                  }}
                >
                  <SearchControl options={{ float: "right", noPlacemark: true }} />
                  <Placemark geometry={coords} options={{ preset: "islands#redIcon" }} />
                </Map>
              </YMaps>
            </div>
          )}
          <div className={stls.eventMeta}>
            {isResolvingAddress
              ? "Определяем адрес..."
              : address || `${coords[0].toFixed(5)}, ${coords[1].toFixed(5)}`}
          </div>
          <Input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Описание (что взять с собой)"
          />
          <Button
            onClick={onCreate}
            loading={isPublishing}
            disabled={isPublishing}
            iconRight={<span className={stls.smallIcon}><IconCalendar /></span>}
          >
            Опубликовать
          </Button>
        </div>
      )}
    </>
  );
};
