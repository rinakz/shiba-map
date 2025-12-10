import {
  YMaps,
  Map,
  Clusterer,
  Placemark,
  SearchControl,
} from "@pbe/react-yandex-maps";
import { useContext, useEffect, useRef, useState, type FormEvent } from "react";
import { AppContext } from "../../shared/context/app-context";
import stls from "./map.module.sass";
import { Button, IconButton } from "../../shared/ui";
import { IconMap } from "../../shared/icons/IconMap";
import type { ShibaType } from "../../shared/types";
import { IconUser } from "../../shared/icons/IconUser";
import { useNavigate } from "react-router-dom";
import { PATH } from "../../shared/constants/path";
import { Popover } from "@mui/material";
import { Siba } from "..";

export const GeneralMap = () => {
  const { sibaIns, mySiba } = useContext(AppContext);
  const mapRef = useRef<ymaps.Map | null>(null);
  const navigate = useNavigate();

  const [coordinates, setCoordinates] = useState([55.75, 37.57]); // Начальные координаты
  const [isShowAccept, setIsShowAccept] = useState(true);
  const [isOpenSiba, setIsOpenSiba] = useState(false);
  const [selectedSibaId, setSelectedSibaId] = useState<string | null>(null);

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
            }
          );
        }
      },
      (error) => {
        console.log(error.message);
      }
    );
  };

  function onActionTickComplete(e: any) {
    const projection = e.get("target").options.get("projection");
    const { globalPixelCenter, zoom } = e.get("tick");
    setCoordinates(projection.fromGlobalPixels(globalPixelCenter, zoom));
  }

  useEffect(() => {
    if (mySiba?.coordinates) {
      setCoordinates(mySiba?.coordinates);
    }
  }, [mySiba?.coordinates]);

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
      <YMaps query={{ apikey: "8c4bcb7f-e5cd-4ecc-b94c-e669d323affe" }}>
        <Map
          height="88vh"
          width="100%"
          instanceRef={mapRef}
          onActionTickComplete={onActionTickComplete}
          modules={["control.ZoomControl"]}
          defaultState={{
            center: coordinates,
            zoom: 10,
            controls: ["zoomControl"],
          }}
        >
          <SearchControl options={{ float: "right", noPlacemark: true }} />
          <Clusterer>
            {sibaIns
              .filter((el: ShibaType) => el.coordinates)
              .map((el: ShibaType) => (
                <Placemark
                  onClick={() => {
                    setIsOpenSiba(true);
                    setSelectedSibaId(el.id);
                    // navigate(`siba/${el.id}`);
                  }}
                  key={el.id}
                  options={{
                    iconLayout: "default#image",
                    iconImageHref: `/${el?.siba_icon}.png`,
                    iconImageSize: [42, 42],
                  }}
                  geometry={el.coordinates}
                />
              ))}
          </Clusterer>
        </Map>
      </YMaps>
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
