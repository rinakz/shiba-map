import {
  YMaps,
  Map,
  Clusterer,
  Placemark,
  SearchControl,
} from "@pbe/react-yandex-maps";
import {
  useContext,
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";
import { AppContext } from "../../shared/context/app-context";
import stls from "./map.module.sass";
import { Button, IconButton } from "../../shared/ui";
import type { ShibaType } from "../../shared/types";
import { useLocation, useNavigate } from "react-router-dom";
import { PATH } from "../../shared/constants/path";
import { Dialog, Modal, SwipeableDrawer, useMediaQuery } from "@mui/material";
import { Siba } from "..";
import { IconMap } from "../../shared/icons/IconMap";
import { IconUser } from "../../shared/icons/IconUser";
import { IconFox } from "../../shared/icons/IconFox";
import { IconLayers } from "../../shared/icons/IconLayers";
import { IconCalendar as IconFillCalendar } from "../../shared/icons/IconFillCalendar";
import { EventCalendar } from "../../shared/header/event-calendar";
import { IconCafe } from "../../shared/icons/IconCafe";
import { IconPark } from "../../shared/icons/IconPark";
import { IconGroomer } from "../../shared/icons/IconGroomer";
import { MapVerificationOverlay } from "./map-verification-overlay";
import {
  extractClusterItems,
  jitterCoords,
  normalizeCoords,
  onMapActionTickComplete,
  requestBrowserLocation,
  type ClusterItem,
  type MapActionTickEvent,
  type ClusterEventUnknown,
  verifyFileToSibaPhoto,
} from "./general-map.utils";
import { PlaceForm } from "./place-form";
import { fetchPlaces } from "./general-map.utils";
import type { Place } from "./place-types";
import { useQuery } from "@tanstack/react-query";
import { PlaceDetail } from "./place-detail";
import { renderToStaticMarkup } from "react-dom/server";
import { ClusterItemsOverlay } from "./cluster-items-overlay";

const ymapsApiKey = import.meta.env.VITE_YMAPS_API_KEY as string | undefined;

const placeIconHrefByKind = {
  cafe: `data:image/svg+xml;charset=utf-8,${encodeURIComponent(
    renderToStaticMarkup(<IconCafe />),
  )}`,
  park: `data:image/svg+xml;charset=utf-8,${encodeURIComponent(
    renderToStaticMarkup(<IconPark />),
  )}`,
  groomer: `data:image/svg+xml;charset=utf-8,${encodeURIComponent(
    renderToStaticMarkup(<IconGroomer />),
  )}`,
} as const;

export const GeneralMap = () => {
  const { sibaIns, mySiba, setMySiba, authUserId, user } =
    useContext(AppContext);
  const mapRef = useRef<ymaps.Map | undefined>(undefined);
  const verifyFileInputRef = useRef<HTMLInputElement | null>(null);
  const [clusterItems, setClusterItems] = useState<ClusterItem[] | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  const [coordinates, setCoordinates] = useState([55.75, 37.57]); // Начальные координаты
  const [isShowAccept, setIsShowAccept] = useState(true);
  const [isOpenSiba, setIsOpenSiba] = useState(false);
  const [selectedSibaId, setSelectedSibaId] = useState<string | null>(null);
  const [verifyError, setVerifyError] = useState<string | null>(null);
  const [isVerifyLoading, setIsVerifyLoading] = useState(false);
  const [isMapLoading, setIsMapLoading] = useState(true);
  const isVerified = Boolean(mySiba?.photos || user?.invited_by_code);
  const isMobile = useMediaQuery("(max-width:600px)");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isPlaceFormOpen, setIsPlaceFormOpen] = useState<null | "cafe" | "park" | "groomer">(null);
  const [selectedPlace, setSelectedPlace] = useState<{ kind: "cafe" | "park" | "groomer"; place: Place } | null>(null);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  const clusterEventsAttachedRef = useRef(false);

  const handleClusterClick = (e: unknown) => {
    const items = extractClusterItems({
      event: e as ClusterEventUnknown,
      sibaIns,
      cafes: cafesQuery.data ?? [],
      parks: parksQuery.data ?? [],
      groomers: groomersQuery.data ?? [],
    });
    if (items.length) setClusterItems(items);
  };

  const getLocation = (event: FormEvent<HTMLElement>) => {
    event.preventDefault();
    requestBrowserLocation({ mapRef, setIsShowAccept, setCoordinates });
  };

  const onActionTickComplete = (e: MapActionTickEvent) =>
    onMapActionTickComplete(e, setCoordinates);

  useEffect(() => {
    if (mySiba?.coordinates) {
      const normalized = normalizeCoords(mySiba.coordinates);
      if (normalized) setCoordinates(normalized);
    }
  }, [mySiba?.coordinates]);

  useEffect(() => {
    const search = new URLSearchParams(location.search);
    const sibaId = search.get("siba");
    if (!sibaId) return;
    setSelectedSibaId(sibaId);
    setIsOpenSiba(true);
  }, [location.search]);

  useEffect(() => {
    const search = new URLSearchParams(location.search);
    const add = search.get("add");
    if (add === "1") {
      setIsFilterOpen(true);
    }
  }, [location.search]);
  const cafesQuery = useQuery({
    queryKey: ["places", "cafe"],
    queryFn: () => fetchPlaces("cafe"),
    enabled: isVerified,
  });
  const parksQuery = useQuery({
    queryKey: ["places", "park"],
    queryFn: () => fetchPlaces("park"),
    enabled: isVerified,
  });
  const groomersQuery = useQuery({
    queryKey: ["places", "groomer"],
    queryFn: () => fetchPlaces("groomer"),
    enabled: isVerified,
  });

  const handleVerifyClick = () => {
    setVerifyError(null);
    verifyFileInputRef.current?.click();
  };

  const handleVerifyFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    setIsVerifyLoading(true);
    setVerifyError(null);
    try {
      await verifyFileToSibaPhoto({
        event,
        authUserId,
        coordinates: coordinates as [number, number],
        mySiba,
        setMySiba: (next) => setMySiba(next),
        setVerifyError,
      });
    } catch (error) {
      console.error("Ошибка верификации сибы:", error);
      setVerifyError(
        error instanceof Error
          ? `Не удалось пройти верификацию: ${error.message}`
          : "Не удалось пройти верификацию. Попробуйте еще раз.",
      );
    } finally {
      setIsVerifyLoading(false);
      event.target.value = "";
    }
  };

  return (
    <div className={stls.mapContainer}>
      {!isShowAccept ? (
        <>
          <div className={stls.coordinateCard}>
            <h1 style={{ fontSize: "28px" }}>Ваша локация</h1>
            Подтвердите ваше местоположение для быстрого поиска друзей рядом
          </div>
          <div className={stls.coordinateButton}>
            <Button
              style={{ width: "100%" }}
              onClick={getLocation}
              iconRight={<IconMap />}
              size="large"
            >
              Подтвердить
            </Button>
          </div>
        </>
      ) : (
        <div className={stls.coordinateButton}>
          <IconButton
            onClick={() => navigate(PATH.Home)}
            size="large"
            icon={<IconFox />}
          />
          <IconButton
            onClick={() => navigate(PATH.Map)}
            size="large"
            icon={<IconMap />}
          />
          <IconButton
            onClick={() => setIsFilterOpen(true)}
            size="large"
            icon={<IconLayers />}
          />
          <IconButton onClick={() => setIsCalendarOpen(true)} size="large" icon={<IconFillCalendar />} />
          <IconButton
            onClick={() => navigate(PATH.Profile)}
            size="large"
            icon={<IconUser />}
          />
        </div>
      )}
      <div
        className={
          isVerified ? stls.mapWrapper : `${stls.mapWrapper} ${stls.mapBlocked}`
        }
      >
        {ymapsApiKey ? (
          <YMaps query={{ apikey: ymapsApiKey }}>
            <Map
              height="88vh"
              width="100%"
              instanceRef={mapRef}
              onLoad={() => setIsMapLoading(false)}
              onActionTickComplete={onActionTickComplete}
              modules={["control.ZoomControl"]}
              defaultState={{
                center: coordinates,
                zoom: 10,
                controls: ["zoomControl"],
              }}
            >
              <SearchControl options={{ float: "right", noPlacemark: true }} />
              {isVerified && (
                  <Clusterer
                    options={{ clusterDisableClickZoom: true }}
                    instanceRef={(inst: { events?: { add: (name: string, cb: (e: unknown) => void) => void } } | null) => {
                      if (!inst || clusterEventsAttachedRef.current) return;
                      clusterEventsAttachedRef.current = true;
                      inst.events?.add("click", handleClusterClick);
                    }}
                  >
                  {sibaIns
                    // Показываем сиб на карте, если он прошёл верификацию:
                    // фото ИЛИ приглашение по промокоду (computed `is_verified` из view).
                    .filter((el: ShibaType) => {
                      if (!el.coordinates) return false;
                      return Boolean(el.photos) || Boolean(el.is_verified);
                    })
                    .map((el: ShibaType) => {
                      const normalized = normalizeCoords(el.coordinates);
                      if (!normalized) return null;

                      const displayCoords = jitterCoords(
                        normalized,
                        // стабильный seed на конкретную сибу
                        el.siba_user_id ?? el.id,
                      );

                      return (
                        <Placemark
                          onClick={() => {
                            setIsOpenSiba(true);
                            setSelectedSibaId(el.id);
                          }}
                          key={el.id}
                          options={{
                            iconLayout: "default#image",
                            iconImageHref: `/${el?.siba_icon}.png`,
                            // Визуально выделяем "хочу гулять" увеличенным маркером.
                            iconImageSize: el.want_to_walk
                              ? [52, 52]
                              : [42, 42],
                          }}
                          properties={{
                            hintContent: el.want_to_walk
                              ? "Хочу гулять"
                              : undefined,
                            siba_id: el.id,
                            item_type: "siba",
                          }}
                          geometry={displayCoords}
                        />
                      );
                    })}
                  {(cafesQuery.data ?? []).map((p) => {
                    const norm = normalizeCoords(p.coordinates);
                    if (!norm) return null;
                    return (
                      <Placemark
                        key={`cafe-${p.id}`}
                        geometry={norm}
                      properties={{ hintContent: p.name, item_type: "place", place_kind: "cafe", place_id: p.id }}
                      options={{
                        iconLayout: "default#image",
                        iconImageHref: placeIconHrefByKind.cafe,
                        iconImageSize: [40, 40],
                      }}
                        onClick={() => setSelectedPlace({ kind: "cafe", place: p })}
                      />
                    );
                  })}
                  {(parksQuery.data ?? []).map((p) => {
                    const norm = normalizeCoords(p.coordinates);
                    if (!norm) return null;
                    return (
                      <Placemark
                        key={`park-${p.id}`}
                        geometry={norm}
                        properties={{ hintContent: p.name, item_type: "place", place_kind: "park", place_id: p.id }}
                        options={{
                          iconLayout: "default#image",
                          iconImageHref: placeIconHrefByKind.park,
                          iconImageSize: [40, 40],
                        }}
                        onClick={() => setSelectedPlace({ kind: "park", place: p })}
                      />
                    );
                  })}
                  {(groomersQuery.data ?? []).map((p) => {
                    const norm = normalizeCoords(p.coordinates);
                    if (!norm) return null;
                    return (
                      <Placemark
                        key={`groomer-${p.id}`}
                        geometry={norm}
                        properties={{ hintContent: p.name, item_type: "place", place_kind: "groomer", place_id: p.id }}
                        options={{
                          iconLayout: "default#image",
                          iconImageHref: placeIconHrefByKind.groomer,
                          iconImageSize: [40, 40],
                        }}
                        onClick={() => setSelectedPlace({ kind: "groomer", place: p })}
                      />
                    );
                  })}
                  </Clusterer>
              )}
            </Map>
          </YMaps>
        ) : (
          <div className={stls.verifyOverlay}>
            <div className={stls.verifyCard}>
              <h3>Карта недоступна</h3>
            </div>
          </div>
        )}
        {isMapLoading && (
          <div className={stls.mapLoadingOverlay}>
            <div className={stls.mapLoadingCard}>Загружаем карту...</div>
          </div>
        )}
      </div>
      {!isVerified && (
        <MapVerificationOverlay
          isVerifyLoading={isVerifyLoading}
          verifyError={verifyError}
          verifyFileInputRef={verifyFileInputRef}
          onVerifyClick={handleVerifyClick}
          onVerifyFileChange={handleVerifyFileChange}
        />
      )}
      <ClusterItemsOverlay
        open={Boolean(clusterItems)}
        items={clusterItems ?? []}
        sibaIns={sibaIns}
        cafes={cafesQuery.data ?? []}
        parks={parksQuery.data ?? []}
        groomers={groomersQuery.data ?? []}
        onClose={() => setClusterItems(null)}
        onOpenSiba={(sid) => {
          setClusterItems(null);
          setIsOpenSiba(true);
          setSelectedSibaId(sid);
        }}
        onOpenPlace={(kind, place) => {
          setClusterItems(null);
          setSelectedPlace({ kind, place });
        }}
      />
      {isMobile ? (
        <SwipeableDrawer
          anchor="bottom"
          open={isOpenSiba}
          onClose={() => {
            setIsOpenSiba(false);
            setSelectedSibaId(null);
          }}
          onOpen={() => {
            /* required by component, no-op */
          }}
          PaperProps={{
            sx: {
              height: "auto",
              maxHeight: "85vh",
              borderTopLeftRadius: 16,
              borderTopRightRadius: 16,
            },
          }}
        >
          <div style={{ width: "100%" }}>
            {selectedSibaId && <Siba id={selectedSibaId} />}
          </div>
        </SwipeableDrawer>
      ) : (
        <Dialog
          open={isOpenSiba}
          onClose={() => {
            setIsOpenSiba(false);
            setSelectedSibaId(null);
          }}
          fullWidth
          maxWidth="xs"
          PaperProps={{
            sx: {
              borderRadius: 2,
            },
          }}
        >
          <div style={{ width: "100%" }}>
            {selectedSibaId && <Siba id={selectedSibaId} />}
          </div>
        </Dialog>
      )}
      <Modal open={isFilterOpen} onClose={() => setIsFilterOpen(false)}>
        <div
          style={{
            position: "fixed",
            left: 0,
            right: 0,
            bottom: 74,
            display: "flex",
            justifyContent: "center",
            padding: "8px 16px",
          }}
        >
          <div
            style={{
              display: "flex",
              gap: 14,
              background: "rgba(255, 252, 245, 0.95)",
              borderRadius: 24,
              padding: "8px 12px",
              boxShadow: "0px 4px 12px rgba(0,0,0,0.12)",
            }}
          >
            <div style={{ width: 44, height: 44, borderRadius: "50%", background: "#FFFCF5", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
              onClick={() => { setIsFilterOpen(false); setIsPlaceFormOpen("cafe"); }}>
              <IconCafe />
            </div>
            <div style={{ width: 44, height: 44, borderRadius: "50%", background: "#FFFCF5", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
              onClick={() => { setIsFilterOpen(false); setIsPlaceFormOpen("park"); }}>
              <IconPark />
            </div>
            <div style={{ width: 44, height: 44, borderRadius: "50%", background: "#FFFCF5", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
              onClick={() => { setIsFilterOpen(false); setIsPlaceFormOpen("groomer"); }}>
              <IconGroomer />
            </div>
          </div>
        </div>
      </Modal>
      <SwipeableDrawer
        anchor="bottom"
        open={Boolean(isPlaceFormOpen)}
        onOpen={() => {}}
        onClose={() => setIsPlaceFormOpen(null)}
        PaperProps={{
          sx: {
            height: "auto",
            maxHeight: "85vh",
            borderTopLeftRadius: 16,
            borderTopRightRadius: 16,
            p: 2,
            background: "rgba(255, 252, 245, 0.95)",
          },
        }}
      >
        {isPlaceFormOpen && (
          <PlaceForm
            kind={isPlaceFormOpen}
            onClose={() => setIsPlaceFormOpen(null)}
          />
        )}
      </SwipeableDrawer>
      <SwipeableDrawer
        anchor="bottom"
        open={Boolean(selectedPlace)}
        onOpen={() => {}}
        onClose={() => setSelectedPlace(null)}
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
      {/* Event calendar modal moved from Header */}
      <EventCalendar
        authUserId={authUserId as string}
        open={isCalendarOpen}
        onClose={() => setIsCalendarOpen(false)}
      />
    </div>
  );
};
