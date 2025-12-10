import { YMaps, Map, Placemark, SearchControl } from "@pbe/react-yandex-maps";
import { useRef, useState, type FC, type FormEvent } from "react";
import { IconPawButton } from "../../shared/icons/IconPawButton";
import stls from "./auth.module.sass";
import type { AuthFormType } from "../../pages/auth-page/types";
import { Button, IconButton } from "../../shared/ui";
import { IconRight } from "../../shared/icons/IconRight";
import { supabase } from "../../shared/api/supabase-сlient";
import { useNavigate } from "react-router-dom";
import { PATH } from "../../constants/path";
import { IconMap } from "../../shared/icons/IconMap";

interface FourthStep {
  setActiveStep: (value: number) => void;
  formData: AuthFormType;
}

export const FourthStep: FC<FourthStep> = ({ setActiveStep, formData }) => {
  const [coordinates, setCoordinates] = useState([55.75, 37.57]); // Начальные координаты
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isAccept, setIsAccept] = useState(false);

  const mapRef = useRef<any | null>(null);
  const navigate = useNavigate();

  const getLocation = (event: FormEvent<HTMLElement>) => {
    event.preventDefault();
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setIsAccept(true);
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
    if (!isAccept) {
      setIsAccept(true);
    }
  }

  const handleRegister = async () => {
    setError(null);
    setIsLoading(true);
    if (coordinates) {
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
      });

      if (error) {
        setError(error.message);
      } else {
        const { error: insertError } = await supabase.from("users").insert([
          {
            user_id: data.user?.id && data.user.id,
            email: formData.email,
            nickname: formData.nickname,
            tgname: formData.tgname,
            is_show_tgname: formData.isShowTgName,
            telegram_chat: formData.chat,
          },
        ]);

        if (insertError) {
          setError(insertError.message);
        } else {
          const { error: insertSibaError } = await supabase
            .from("sibains")
            .insert([
              {
                siba_user_id: data.user?.id && data.user.id,
                siba_name: formData.sibaname,
                siba_icon: formData.icon,
                siba_gender: formData.gender,
                coordinates: coordinates,
              },
            ]);

          if (insertSibaError) {
            setError(insertSibaError.message);
          } else {
            navigate(PATH.Login);
          }
        }
      }
    } else {
      setError("Заполните все поля");
    }
    setIsLoading(false);
  };

  return (
    <div className={stls.stepContainer}>
      <div className={stls.coordinateCard}>
        <h1 style={{ fontSize: "28px" }}>Ваша локация</h1>
        Подтвердите ваше местоположение для быстрого поиска друзей рядом
      </div>
      <YMaps query={{ apikey: "8c4bcb7f-e5cd-4ecc-b94c-e669d323affe" }}>
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
              iconImageHref: "sibka-icon.png",
              iconImageSize: [42, 42],
            }}
          />
        </Map>
      </YMaps>
      {error && (
        <span style={{ fontSize: "12px", color: "#E95B47" }}>{error}</span>
      )}
      <div style={{ display: "flex", gap: "16px" }}>
        <IconButton
          onClick={() => setActiveStep(3)}
          variant="secondary"
          size="large"
          icon={
            <span style={{ display: "flex", transform: "rotate(-180deg)" }}>
              <IconRight />
            </span>
          }
        />
        {isAccept ? (
          <Button
            style={{ width: "100%" }}
            iconRight={<IconPawButton />}
            size="large"
            onClick={handleRegister}
            loading={isLoading}
          >
            Зарегистрироваться
          </Button>
        ) : (
          <Button
            style={{ width: "100%" }}
            onClick={getLocation}
            iconRight={<IconMap />}
            size="large"
          >
            Подтвердить
          </Button>
        )}
      </div>
    </div>
  );
};
