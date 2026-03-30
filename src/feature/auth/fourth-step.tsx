import { YMaps, Map, Placemark, SearchControl } from "@pbe/react-yandex-maps";
import { useRef, useState, type FC, type FormEvent } from "react";
import { IconPawButton } from "../../shared/icons/IconPawButton";
import stls from "./auth.module.sass";
import type { AuthFormType } from "../../pages/auth-page/types";
import { Button, IconButton } from "../../shared/ui";
import { supabase } from "../../shared/api/supabase-сlient";
import { useNavigate } from "react-router-dom";
import { PATH } from "../../shared/constants/path";
import { IconMap } from "../../shared/icons/IconMap";
import {
  generatePromoCode,
  linkUsersByInviteCode,
  normalizePromoCode,
} from "../../shared/api/referrals";
import { IconRight } from "../../shared/icons";

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

interface FourthStep {
  setActiveStep: (value: number) => void;
  formData: AuthFormType;
  authMethod: "email" | "telegram";
}

export const FourthStep: FC<FourthStep> = ({
  setActiveStep,
  formData,
  authMethod,
}) => {
  const [coordinates, setCoordinates] = useState([55.75, 37.57]); // Начальные координаты
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isAccept, setIsAccept] = useState(false);

  const mapRef = useRef<ymaps.Map | undefined>(undefined);
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
          mapRef?.current?.setCenter(
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
        setError(error.message);
      },
    );
  };

  function onActionTickComplete(e: MapActionTickEvent) {
    const projection = e.get("target").options.get("projection");
    const { globalPixelCenter, zoom } = e.get("tick");
    setCoordinates(projection.fromGlobalPixels(globalPixelCenter, zoom));
    if (!isAccept) {
      setIsAccept(true);
    }
  }

  const handleRegister = async () => {
    setError(null);
    setSuccessMessage(null);
    setIsLoading(true);
    try {
      if (coordinates) {
        const inviteCode = formData.inviteCode
          ? normalizePromoCode(formData.inviteCode)
          : "";
        const promoCode = generatePromoCode();

        if (authMethod === "email") {
          const { data, error } = await supabase.auth.signUp({
            email: formData.email,
            password: formData.password,
            options: {
              data: {
                nickname: formData.nickname,
                tgname: formData.tgname,
                is_show_tgname: formData.isShowTgName,
                siba_name: formData.sibaname,
                siba_icon: formData.icon,
                siba_gender: formData.gender,
                coordinates,
                invite_code: inviteCode,
                promo_code: promoCode,
              },
            },
          });

          if (error) {
            const normalizedError = error.message.toLowerCase();
            if (normalizedError.includes("email rate limit exceeded")) {
              setSuccessMessage(
                "Регистрация прошла успешно. Мы отправили письмо на email — подтвердите его и затем войдите в аккаунт.",
              );
            } else {
              setError(error.message);
            }
            return;
          }

          const userId = data.user?.id;
          if (!userId) {
            setError("Не удалось создать пользователя.");
            return;
          }

          const { data: sessionData } = await supabase.auth.getSession();
          const sessionUserId = sessionData.session?.user?.id;

          if (!sessionUserId || sessionUserId !== userId) {
            setSuccessMessage(
              "Регистрация прошла успешно. Мы отправили письмо на email — подтвердите его и затем войдите в аккаунт.",
            );
            navigate(PATH.Login);
            return;
          }

          const { error: insertError } = await supabase.from("users").upsert(
            [
              {
                user_id: sessionUserId,
                email: formData.email,
                nickname: formData.nickname,
                tgname: formData.tgname,
                is_show_tgname: formData.isShowTgName,
                promo_code: promoCode,
                invited_by_code: inviteCode || null,
              },
            ],
            { onConflict: "user_id" },
          );

          if (insertError) {
            setError(insertError.message);
            return;
          }

          const { error: insertSibaError } = await supabase
            .from("sibains")
            .upsert(
              [
                {
                  siba_user_id: sessionUserId,
                  siba_name: formData.sibaname,
                  siba_icon: formData.icon,
                  siba_gender: formData.gender,
                  coordinates: coordinates,
                },
              ],
              { onConflict: "siba_user_id" },
            );

          if (insertSibaError) {
            setError(insertSibaError.message);
            return;
          }

          await linkUsersByInviteCode(sessionUserId, inviteCode);

          setSuccessMessage(
            "Регистрация прошла успешно. Мы отправили письмо на email — подтвердите его и затем войдите в аккаунт.",
          );
          navigate(PATH.Login);
          return;
        }

        // Telegram-режим: пользователь уже залогинен (auth via Edge Function).
        const { data: sessionData, error: sessionError } =
          await supabase.auth.getSession();
        if (sessionError) {
          setError(sessionError.message);
          return;
        }

        const userId = sessionData.session?.user?.id;
        const email = sessionData.session?.user?.email ?? formData.email;

        if (!userId) {
          setError("Нет активной сессии. Сначала выполните вход в Telegram.");
          return;
        }

        const { error: insertError } = await supabase.from("users").upsert(
          [
            {
              user_id: userId,
              email,
              nickname: formData.nickname,
              tgname: formData.tgname,
              is_show_tgname: formData.isShowTgName,
              promo_code: promoCode,
              invited_by_code: inviteCode || null,
            },
          ],
          { onConflict: "user_id" },
        );

        if (insertError) {
          setError(insertError.message);
          return;
        }

        const { error: insertSibaError } = await supabase
          .from("sibains")
          .upsert(
            [
              {
                siba_user_id: userId,
                siba_name: formData.sibaname,
                siba_icon: formData.icon,
                siba_gender: formData.gender,
                coordinates: coordinates,
              },
            ],
            { onConflict: "siba_user_id" },
          );

        if (insertSibaError) {
          setError(insertSibaError.message);
          return;
        }

        await linkUsersByInviteCode(userId, inviteCode);

        // Фото пока нет, поэтому дальнейший экран будет ProfilePage (загрузка фото).
        navigate(PATH.Home);
      } else {
        setError("Заполните все поля");
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ошибка регистрации");
    } finally {
      // Всегда выключаем loader, даже при ранних return в ветках ошибок.
      setIsLoading(false);
    }
  };

  return (
    <div className={stls.stepContainer}>
      <div className={stls.coordinateCard}>
        <h1 style={{ fontSize: "28px" }}>Ваша локация</h1>
        Подтвердите ваше местоположение для быстрого поиска друзей рядом
      </div>
      {ymapsApiKey ? (
        <YMaps query={{ apikey: ymapsApiKey }}>
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
      ) : (
        <span style={{ fontSize: "12px", color: "#E95B47" }}>
          Не задан ключ карты. Добавьте VITE_YMAPS_API_KEY в env.
        </span>
      )}
      {error && (
        <span style={{ fontSize: "12px", color: "#E95B47" }}>{error}</span>
      )}
      {successMessage && (
        <span style={{ fontSize: "12px", color: "#2BB26E" }}>
          {successMessage}
        </span>
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
