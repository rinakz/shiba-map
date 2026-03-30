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
import { useNavigate } from "react-router-dom";
import { PATH } from "../../shared/constants/path";
import { Popover } from "@mui/material";
import { Siba } from "..";
import { IconMap } from "../../shared/icons/IconMap";
import { IconUser } from "../../shared/icons/IconUser";
import { MapVerificationOverlay } from "./map-verification-overlay";
import {
  jitterCoords,
  normalizeCoords,
  resolveCurrentSiba,
  uploadVerificationPhoto,
} from "./general-map.utils";

const ymapsApiKey = import.meta.env.VITE_YMAPS_API_KEY as string | undefined;

type MapActionTick = {
  globalPixelCenter: [number, number];
  zoom: number;
};

type MapTargetPayload = {
  options: {
    get: (name: "projection") => {
      fromGlobalPixels: (
        globalPixelCenter: [number, number],
        zoom: number,
      ) => [number, number];
    };
  };
};

interface MapActionTickEvent {
  get(key: "target"): MapTargetPayload;
  get(key: "tick"): MapActionTick;
}

export const GeneralMap = () => {
  const { sibaIns, mySiba, setMySiba, authUserId, user } =
    useContext(AppContext);
  const mapRef = useRef<ymaps.Map | undefined>(undefined);
  const verifyFileInputRef = useRef<HTMLInputElement | null>(null);
  const navigate = useNavigate();

  const [coordinates, setCoordinates] = useState([55.75, 37.57]); // Начальные координаты
  const [isShowAccept, setIsShowAccept] = useState(true);
  const [isOpenSiba, setIsOpenSiba] = useState(false);
  const [selectedSibaId, setSelectedSibaId] = useState<string | null>(null);
  const [verifyError, setVerifyError] = useState<string | null>(null);
  const [isVerifyLoading, setIsVerifyLoading] = useState(false);
  const [isMapLoading, setIsMapLoading] = useState(true);
  const isVerified = Boolean(mySiba?.photos || user?.invited_by_code);

  const getLocation = (event: FormEvent<HTMLElement>) => {
    event.preventDefault();
    if (!navigator.geolocation) {
      console.log("Geolocation is not supported by your browser");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setIsShowAccept(false);
        setCoordinates([position.coords.latitude, position.coords.longitude]);
        if (location && position.coords.latitude && mapRef.current) {
          mapRef.current.setCenter(
            [position.coords.latitude, position.coords.longitude],
            14,
            {
              duration: 500, // Optional animation duration
              timingFunction: "ease-in-out", // Optional timing function
            },
          );
        }
      },
      (error) => {
        console.log(error.message);
      },
    );
  };

  function onActionTickComplete(e: MapActionTickEvent) {
    const projection = e.get("target").options.get("projection");
    const { globalPixelCenter, zoom } = e.get("tick");
    setCoordinates(projection.fromGlobalPixels(globalPixelCenter, zoom));
  }

  useEffect(() => {
    if (mySiba?.coordinates) {
      const normalized = normalizeCoords(mySiba.coordinates);
      if (normalized) setCoordinates(normalized);
    }
  }, [mySiba?.coordinates]);

  const handleVerifyClick = () => {
    setVerifyError(null);
    verifyFileInputRef.current?.click();
  };

  const handleVerifyFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setVerifyError("Можно загрузить только изображение.");
      event.target.value = "";
      return;
    }

    const maxSizeMb = 10;
    if (file.size > maxSizeMb * 1024 * 1024) {
      setVerifyError(`Файл слишком большой. Максимум ${maxSizeMb} МБ.`);
      event.target.value = "";
      return;
    }

    setIsVerifyLoading(true);
    setVerifyError(null);
    try {
      const targetSiba = await resolveCurrentSiba({
        mySiba,
        authUserId,
        coordinates,
        setMySiba: (next) => setMySiba(next),
      });

      if (!targetSiba?.id || !targetSiba?.siba_user_id) {
        setVerifyError(
          "Не удалось определить профиль сибы. Завершите регистрацию питомца в профиле.",
        );
        return;
      }

      const photoUrl = await uploadVerificationPhoto(targetSiba, file);

      // photos выступает как ключ успешной верификации
      setMySiba({ ...targetSiba, photos: photoUrl });
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
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        marginTop: "112px",
        position: "relative",
      }}
    >
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
            onClick={() => navigate(PATH.Profile)}
            size="large"
            icon={<IconUser />}
          ></IconButton>
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
                <Clusterer>
                  {sibaIns
                    .filter((el: ShibaType) => el.coordinates && el.photos)
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
                          }}
                          geometry={displayCoords}
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
      <Popover
        open={isOpenSiba}
        onClose={() => {
          setIsOpenSiba(false);
          setSelectedSibaId(null);
        }}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
      >
        {selectedSibaId && <Siba id={selectedSibaId} />}
      </Popover>
    </div>
  );
};
