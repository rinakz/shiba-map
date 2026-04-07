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
} from "react";
import { AppContext } from "../../shared/context/app-context";
import stls from "./map.module.sass";
import type { ShibaType } from "../../shared/types";
import { useLocation } from "react-router-dom";
import { Dialog, SwipeableDrawer, useMediaQuery } from "@mui/material";
import { Siba } from "..";
import { MapVerificationOverlay } from "./map-verification-overlay";
import {
  extractClusterItems,
  jitterCoords,
  normalizeCoords,
  onMapActionTickComplete,
  requestBrowserLocation,
  getSibaMarkerHref,
  type ClusterItem,
  type MapActionTickEvent,
  type ClusterEventUnknown,
  verifyFileToSibaPhoto,
  type HazardKind,
} from "./general-map.utils";
import { PlaceForm } from "./place-form";
import { fetchPlaces } from "./general-map.utils";
import type { Place } from "./place-types";
import { useQuery } from "@tanstack/react-query";
import { PlaceDetail } from "./place-detail";
import { HazardsFeature } from "./hazards-feature";
import { ClusterItemsOverlay } from "./cluster-items-overlay";
import { MapBottomControls } from "./map-bottom-controls";
import { PlaceKindPicker } from "./place-kind-picker";
import { MapAddMenu } from "./map-add-menu";
import {
  getSibaStatus,
  isGreenStatus,
  SHIBA_STATUSES,
} from "../../shared/utils/siba-status";
import { placeIconHrefByKind } from "./general-map.utils";

const ymapsApiKey = import.meta.env.VITE_YMAPS_API_KEY as string | undefined;

// placeIconHrefByKind is provided by utils

export const GeneralMap = () => {
  const { sibaIns, mySiba, setMySiba, authUserId, user } =
    useContext(AppContext);
  const mapRef = useRef<ymaps.Map | undefined>(undefined);
  const verifyFileInputRef = useRef<HTMLInputElement | null>(null);
  const [clusterItems, setClusterItems] = useState<ClusterItem[] | null>(null);
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
  const [isPlaceFormOpen, setIsPlaceFormOpen] = useState<
    null | "cafe" | "park" | "groomer"
  >(null);
  const [isPlacePickerOpen, setIsPlacePickerOpen] = useState(false);
  const [isHazardPickerOpen, setIsHazardPickerOpen] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState<{
    kind: "cafe" | "park" | "groomer";
    place: Place;
  } | null>(null);
  const [addingHazardKind, setAddingHazardKind] = useState<HazardKind | null>(
    null,
  );
  const [pendingHazardCoords, setPendingHazardCoords] = useState<
    [number, number] | null
  >(null);
  const [isMapActionMenuOpen, setIsMapActionMenuOpen] = useState(false);

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
      setIsPlacePickerOpen(true);
    }
  }, [location.search]);

  // Disabled pulsing to avoid re-render flicker on the map
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

  const handleVerifyFileChange = async (
    event: ChangeEvent<HTMLInputElement>,
  ) => {
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
      <MapBottomControls
        isShowAccept={isShowAccept}
        onLocateUser={() =>
          requestBrowserLocation({ mapRef, setIsShowAccept, setCoordinates })
        }
      />
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
              onClick={(evt: { get: (k: "coords") => [number, number] }) => {
                if (!addingHazardKind) return;
                const coords = evt.get("coords");
                setPendingHazardCoords(coords);
              }}
        >
          <SearchControl options={{ float: "right", noPlacemark: true }} />
              {isVerified && (
                <Clusterer
                  options={{ clusterDisableClickZoom: true }}
                  instanceRef={(
                    inst: {
                      events?: {
                        add: (name: string, cb: (e: unknown) => void) => void;
                      };
                    } | null,
                  ) => {
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
                      const status = getSibaStatus(el);
                      const isWalkStatus = status === "walk";

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
                            iconImageHref: getSibaMarkerHref(
                              el?.siba_icon,
                              isWalkStatus,
                            ),
                            // Визуально выделяем "хочу гулять" увеличенным маркером.
                            iconImageSize: isWalkStatus
                              ? [64, 64]
                              : isGreenStatus(status)
                                ? [48, 48]
                                : [42, 42],
                          }}
                          properties={{
                            hintContent: (() => {
                              if (!status) return undefined;
                              return SHIBA_STATUSES.find((x) => x.id === status)
                                ?.label;
                            })(),
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
                        properties={{
                          hintContent: p.name,
                          item_type: "place",
                          place_kind: "cafe",
                          place_id: p.id,
                        }}
                        options={{
                          iconLayout: "default#image",
                          iconImageHref: placeIconHrefByKind.cafe,
                          iconImageSize: [40, 40],
                        }}
                        onClick={() =>
                          setSelectedPlace({ kind: "cafe", place: p })
                        }
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
                        properties={{
                          hintContent: p.name,
                          item_type: "place",
                          place_kind: "park",
                          place_id: p.id,
                        }}
                        options={{
                          iconLayout: "default#image",
                          iconImageHref: placeIconHrefByKind.park,
                          iconImageSize: [40, 40],
                        }}
                        onClick={() =>
                          setSelectedPlace({ kind: "park", place: p })
                        }
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
                        properties={{
                          hintContent: p.name,
                          item_type: "place",
                          place_kind: "groomer",
                          place_id: p.id,
                        }}
                        options={{
                          iconLayout: "default#image",
                          iconImageHref: placeIconHrefByKind.groomer,
                          iconImageSize: [40, 40],
                        }}
                        onClick={() =>
                          setSelectedPlace({ kind: "groomer", place: p })
                        }
                      />
                    );
                  })}
                  <HazardsFeature
                    addingKind={addingHazardKind}
                    setAddingKind={setAddingHazardKind}
                    pendingCoords={pendingHazardCoords}
                    setPendingCoords={setPendingHazardCoords}
                  />
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
      {isVerified && (
        <MapAddMenu
          isOpen={isMapActionMenuOpen}
          onOpen={() => setIsMapActionMenuOpen(true)}
          onClose={() => {
            setIsMapActionMenuOpen(false);
            setAddingHazardKind(null);
          }}
          onAddPlace={() => {
            setIsMapActionMenuOpen(false);
            setIsPlacePickerOpen(true);
          }}
          onAddHazard={() => {
            setIsMapActionMenuOpen(false);
            setIsHazardPickerOpen(true);
          }}
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
      <SwipeableDrawer
        anchor="bottom"
        open={isPlacePickerOpen}
        onOpen={() => {}}
        onClose={() => setIsPlacePickerOpen(false)}
        PaperProps={{
          sx: {
            height: "auto",
            maxHeight: "85vh",
            borderTopLeftRadius: 16,
            borderTopRightRadius: 16,
            p: 2,
            background: "#FFFCF5",
          },
        }}
      >
        <PlaceKindPicker
          onPick={(kind) => {
            setIsPlacePickerOpen(false);
            setIsPlaceFormOpen(kind);
          }}
        />
      </SwipeableDrawer>
      <SwipeableDrawer
        anchor="bottom"
        open={isHazardPickerOpen}
        onOpen={() => {}}
        onClose={() => setIsHazardPickerOpen(false)}
        PaperProps={{
          sx: {
            height: "auto",
            maxHeight: "85vh",
            borderTopLeftRadius: 16,
            borderTopRightRadius: 16,
            p: 2,
            background: "#FFFCF5",
          },
        }}
      >
        <div className={stls.hazardDrawer}>
          <button
            type="button"
            className={stls.hazardMenuItem}
            onClick={() => {
              setAddingHazardKind("doghunters");
              setPendingHazardCoords(null);
              setIsHazardPickerOpen(false);
            }}
          >
            <span className={`${stls.hazardBtn} ${stls.hazardBtnRed}`}>⚠️</span>
            <span className={stls.hazardMenuLabel}>Догхантеры</span>
          </button>
          <button
            type="button"
            className={stls.hazardMenuItem}
            onClick={() => {
              setAddingHazardKind("reagents");
              setPendingHazardCoords(null);
              setIsHazardPickerOpen(false);
            }}
          >
            <span className={`${stls.hazardBtn} ${stls.hazardBtnBlue}`}>🧪</span>
            <span className={stls.hazardMenuLabel}>Реагенты</span>
          </button>
          <button
            type="button"
            className={stls.hazardMenuItem}
            onClick={() => {
              setAddingHazardKind("salute");
              setPendingHazardCoords(null);
              setIsHazardPickerOpen(false);
            }}
          >
            <span className={`${stls.hazardBtn} ${stls.hazardBtnOrange}`}>🎆</span>
            <span className={stls.hazardMenuLabel}>Салют</span>
          </button>
        </div>
      </SwipeableDrawer>
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
            background: "#FFFCF5",
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
        {selectedPlace && (
          <PlaceDetail kind={selectedPlace.kind} place={selectedPlace.place} />
        )}
      </SwipeableDrawer>
    </div>
  );
};
