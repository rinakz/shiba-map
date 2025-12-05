import {
  YMaps,
  Map,
  Clusterer,
  Placemark,
  SearchControl,
} from "@pbe/react-yandex-maps";
import { useContext, useRef, useState, type FormEvent } from "react";
import { AppContext } from "../context/app-context";
import stls from "./map.module.sass";
import { Button, IconButton } from "../../ui";
import { IconMap } from "../../assets/icons/IconMap";
import type { ShibaType } from "../../types";
import { IconUser } from "../../assets/icons/IconUser";
import { useNavigate } from "react-router-dom";
import { PATH } from "../../constants/path";

export const GeneralMap = () => {
  const { sibaIns, mySiba } = useContext(AppContext);
  const mapRef = useRef<any | null>(null);
  const navigate = useNavigate();

  const myCoordinate = JSON.parse(mySiba?.coordinates);

  const [coordinates, setCoordinates] = useState(
    myCoordinate ?? [55.75, 37.57]
  ); // Начальные координаты

  const [isShowAccept, setIsShowAccept] = useState(true);

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
        if (location && position.coords.latitude) {
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
                    navigate(`siba/${el.id}`);
                  }}
                  key={el.id}
                  modules={["geoObject.addon.balloon"]}
                  options={{
                    iconLayout: "default#image",
                    iconImageHref: `/${el?.siba_icon}.png`,
                    iconImageSize: [42, 42],
                  }}
                  geometry={JSON.parse(el.coordinates)}
                  properties={{
                    balloonContent: `<h1 style={{ fontSize: "14px" }}>${el.siba_name}</h1>`,
                  }}
                />
              ))}
          </Clusterer>
        </Map>
      </YMaps>
    </div>
  );
};
