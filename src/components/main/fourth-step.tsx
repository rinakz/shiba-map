import { Button } from "@mui/material";
// import { YMaps, Map, Placemark, SearchControl } from "@pbe/react-yandex-maps";
import { useRef, useState, type FormEvent } from "react";
// import { IconPawButton } from "../../assets/icons/IconPawButton";
import stls from "../auth/auth.module.sass";

export const FourthStep = () => {
  const [coordinates, setCoordinates] = useState([55.75, 37.57]); // Начальные координаты
  const [error, setError] = useState<string | null>(null);
  const mapRef = useRef<any | null>(null);

  const getLocation = (event: FormEvent<HTMLElement>) => {
    event.preventDefault();
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
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
        setError(error.message);
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
        gap: "24px",
        justifyContent: "space-between",
        height: "100%",
      }}
    >
      <button onClick={getLocation}>определить местоположение</button>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "24px",
          background: "#FFFCF5",
          borderRadius: "12px",
          padding: "24px",
          height: "100%",
        }}
      >
        <div className={stls.fieldContainer}>выставьте свою метку на карте</div>
        ааааа
        {/* <YMaps query={{ apikey: "8c4bcb7f-e5cd-4ecc-b94c-e669d323affe" }}>
          <Map
            instanceRef={mapRef}
            onActionTickComplete={onActionTickComplete}
            modules={["control.ZoomControl"]}
            defaultState={{
              center: coordinates,
              zoom: 10,
              controls: ["zoomControl"],
            }}
            width="100%"
          >
            <SearchControl options={{ float: "right", noPlacemark: true }} />

            <Placemark
              geometry={coordinates}
              modules={["geoObject.addon.balloon"]}
              options={{
                iconLayout: "default#image",
                iconImageHref: "sibka.png",
                iconImageSize: [42, 42],
              }}
            />
          </Map>
        </YMaps> */}
      </div>

      <div className={stls.buttonContainer}>
        {/* <Controller
          name="location"
          control={control}
          render={({ field }) => (
            <Button
              onClick={() => {
                field.onChange(coordinates);
              }}
              className={stls.button}
            >
              Завершить <IconPawButton />
            </Button>
          )}
        /> */}
      </div>
    </div>
  );
};
