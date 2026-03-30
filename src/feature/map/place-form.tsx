import { useContext, useRef, useState, type ChangeEvent } from "react";
import { Button, Input } from "../../shared/ui";
import { Checkbox } from "@mui/material";
import { supabase } from "../../shared/api/supabase-сlient";
import { PLACES_PHOTOS_BUCKET } from "../../shared/constants/storage";
import { AppContext } from "../../shared/context/app-context";
import type { PlaceKind } from "./place-types";
import { Map, Placemark, SearchControl, YMaps } from "@pbe/react-yandex-maps";
import { IconMap } from "../../shared/icons/IconMap";
import { IconCafe } from "../../shared/icons/IconCafe";
import { IconPark } from "../../shared/icons/IconPark";
import { IconGroomer } from "../../shared/icons/IconGroomer";
import { renderToStaticMarkup } from "react-dom/server";
import { useMutation, useQueryClient } from "@tanstack/react-query";

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

type GeoObjectLike = {
  getAddressLine?: () => string;
  properties?: {
    getAll?: () => Record<string, unknown>;
    get?: (name: string) => unknown;
  };
};

type GeocodeCollectionLike = {
  get?: (index: number) => GeoObjectLike | null;
  toArray?: () => GeoObjectLike[];
};

type GeocodeResultLike = {
  geoObjects?: GeocodeCollectionLike;
};

type YMapsApi = {
  geocode: (q: string | [number, number]) => Promise<GeocodeResultLike>;
};

type PlaceFormProps = {
  kind: PlaceKind;
  onClose: () => void;
};

export const PlaceForm = ({ kind, onClose }: PlaceFormProps) => {
  const { authUserId, mySiba, setMySiba } = useContext(AppContext);
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  // Важно: по умолчанию НЕ используем координаты из пропса (они могут быть координатами моей сибы).
  const [coords, setCoords] = useState<number[] | null>([55.75, 37.57]);
  // Превью координат с карты (обновляются при перемещении карты, но в БД уйдут только после подтверждения/геокодинга).
  const [previewCoords, setPreviewCoords] = useState<number[] | null>([
    55.75, 37.57,
  ]);
  const [withVisit, setWithVisit] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const ymapsApiKey = import.meta.env.VITE_YMAPS_API_KEY as string | undefined;

  const mapRef = useRef<ymaps.Map | undefined>(undefined);

  const initialCenter: [number, number] = [55.75, 37.57];

  const iconHrefByKind = {
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

  const getYmaps = () => {
    return (window as unknown as { ymaps?: YMapsApi }).ymaps;
  };

  const fetchMySibaForVisit = async () => {
    if (!authUserId) return null;
    const { data, error } = await supabase
      .from("sibains")
      .select("*")
      .eq("siba_user_id", authUserId)
      .maybeSingle();
    if (error) {
      console.error("Не удалось загрузить вашу сибу для визита:", error);
      return null;
    }
    if (data) setMySiba(data);
    return data ?? null;
  };

  const extractAddressFromGeoObject = (geoObject: GeoObjectLike | null | undefined) => {
    if (!geoObject) return null;

    // 1) Самый “железный” форматтер адресной строки.
    const line = geoObject?.getAddressLine?.();
    if (typeof line === "string" && line.trim()) return line.trim();

    // 2) Попробуем разные поля, которые Yandex обычно отдаёт в properties.
    const props = geoObject.properties?.getAll?.() ?? {};
    const propsText =
      typeof props?.text === "string" ? props.text.trim() : undefined;
    if (propsText) return propsText;

    const propsName =
      typeof props?.name === "string" ? props.name.trim() : undefined;
    if (propsName) return propsName;

    const propsDescription =
      typeof props?.description === "string" ? props.description.trim() : undefined;
    if (propsDescription) return propsDescription;

    const propsText2 = geoObject.properties?.get?.("text");
    if (typeof propsText2 === "string" && propsText2.trim()) {
      return propsText2.trim();
    }

    return null;
  };

  const getAddressFromCoords = async (valueCoords: [number, number]) => {
    const ymaps = getYmaps();
    if (!ymaps) return null;

    const attempts: [number, number][] = [valueCoords, [valueCoords[1], valueCoords[0]]];

    for (const attempt of attempts) {
      try {
        const res = await ymaps.geocode(attempt);
        const geoCollection = res?.geoObjects;
        const first =
          geoCollection?.get?.(0) ?? geoCollection?.toArray?.()?.[0] ?? null;
        const addressText = extractAddressFromGeoObject(first);
        if (addressText) return addressText;
      } catch {
        // игнорируем и пробуем следующий вариант
      }
    }

    return null;
  };

  const getLocation = () => {
    setError(null);
    if (!navigator.geolocation) {
      setError("Геолокация недоступна в вашем браузере");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const next: [number, number] = [
          position.coords.latitude,
          position.coords.longitude,
        ];
        mapRef.current?.setCenter?.(next, 14, {
          duration: 500,
          timingFunction: "ease-in-out",
        });
        setPreviewCoords(next);
        setCoords(next);
      },
      (err) => {
        setError(err.message || "Не удалось определить местоположение");
      },
    );
  };

  const onPhotoChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    if (file && !file.type.startsWith("image/")) {
      setError("Можно загружать только изображения");
      return;
    }
    if (file && file.size > 10 * 1024 * 1024) {
      setError("Файл слишком большой. Максимум 10 МБ.");
      return;
    }
    setError(null);
    setPhotoFile(file);
    setPhotoPreview(file ? URL.createObjectURL(file) : null);
  };

  const savePlaceMutation = useMutation({
    mutationFn: async ({
      placeName,
      coordinatesToSave,
      uploadedPhoto,
      withVisitMark,
    }: {
      placeName: string;
      coordinatesToSave: [number, number];
      uploadedPhoto: File | null;
      withVisitMark: boolean;
    }) => {
      const resolvedAddress =
        (await getAddressFromCoords(coordinatesToSave)) ??
        "Адрес не определен";

      let photoUrl: string | null = null;
      if (uploadedPhoto) {
        const { data: up, error: upErr } = await supabase.storage
          .from(PLACES_PHOTOS_BUCKET)
          .upload(
            `places/${authUserId ?? "anon"}/${Date.now()}_${uploadedPhoto.name}`,
            uploadedPhoto,
            { contentType: uploadedPhoto.type || "image/jpeg", upsert: true },
          );
        if (upErr) throw upErr;
        const { data } = supabase.storage.from(PLACES_PHOTOS_BUCKET).getPublicUrl(up.path);
        photoUrl = data.publicUrl ?? null;
      }

      const table = kind === "cafe" ? "cafes" : kind === "park" ? "parks" : "groomers";
      const { data: place, error: placeErr } = await supabase
        .from(table)
        .insert([
          {
            name: placeName,
            address: resolvedAddress,
            coordinates: coordinatesToSave,
            photo: photoUrl,
            created_by: authUserId ?? null,
          },
        ])
        .select("*")
        .single();
      if (placeErr) throw placeErr;

      if (withVisitMark) {
        const effectiveMySiba = mySiba?.id ? mySiba : await fetchMySibaForVisit();
        if (!effectiveMySiba?.id) {
          throw new Error("Не удалось определить вашу сибу. Попробуйте ещё раз.");
        }

        if (kind === "cafe") {
          const { error: visitErr } = await supabase
            .from("siba_cafe_visits")
            .insert([
              {
                cafe_id: place.id,
                siba_id: effectiveMySiba.id,
                visited_at: new Date().toISOString(),
              },
            ]);
          if (visitErr) throw new Error(visitErr.message);
          const nextCafe = (effectiveMySiba.cafe ?? 0) + 1;
          const { error: updateErr } = await supabase
            .from("sibains")
            .update({ cafe: nextCafe })
            .eq("id", effectiveMySiba.id);
          if (updateErr) throw new Error(updateErr.message);
          setMySiba({ ...effectiveMySiba, cafe: nextCafe });
        } else if (kind === "park") {
          const { error: visitErr } = await supabase
            .from("siba_park_visits")
            .insert([
              {
                place_id: place.id,
                siba_id: effectiveMySiba.id,
                visited_at: new Date().toISOString(),
              },
            ]);
          if (visitErr) throw new Error(visitErr.message);
          const nextPark = (effectiveMySiba.park ?? 0) + 1;
          const { error: updateErr } = await supabase
            .from("sibains")
            .update({ park: nextPark })
            .eq("id", effectiveMySiba.id);
          if (updateErr) throw new Error(updateErr.message);
          setMySiba({ ...effectiveMySiba, park: nextPark });
        } else {
          const { error: visitErr } = await supabase
            .from("siba_groomer_visits")
            .insert([
              {
                place_id: place.id,
                siba_id: effectiveMySiba.id,
                visited_at: new Date().toISOString(),
              },
            ]);
          if (visitErr) throw new Error(visitErr.message);
          const nextGroomer = (effectiveMySiba.groomer ?? 0) + 1;
          const { error: updateErr } = await supabase
            .from("sibains")
            .update({ groomer: nextGroomer })
            .eq("id", effectiveMySiba.id);
          if (updateErr) throw new Error(updateErr.message);
          setMySiba({ ...effectiveMySiba, groomer: nextGroomer });
        }
      }
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["places", kind] }),
        queryClient.invalidateQueries({ queryKey: ["place-visits"] }),
      ]);
      onClose();
    },
  });

  const handleSave = async () => {
    setError(null);
    if (!name) {
      setError("Введите название");
      return;
    }
    if (!coords) {
      setError("Выберите точку на карте");
      return;
    }
    try {
      await savePlaceMutation.mutateAsync({
        placeName: name,
        coordinatesToSave: coords as [number, number],
        uploadedPhoto: photoFile,
        withVisitMark: withVisit,
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Не удалось сохранить");
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <h3>{kind === "cafe" ? "Добавить кафе/ресторан" : kind === "park" ? "Добавить парк" : "Добавить грумера"}</h3>
      <Input label="Название" value={name} onChange={(e) => setName(e.target.value)} />
      <div style={{ fontSize: 12, color: "#74736E" }}>Выберите адрес</div>

      {ymapsApiKey ? (
        <div style={{ borderRadius: 20, overflow: "hidden", width: "100%" }}>
          <YMaps query={{ apikey: ymapsApiKey }}>
            <Map
              height="180px"
              width="100%"
              instanceRef={mapRef}
              modules={["control.ZoomControl"]}
              onActionTickComplete={(e: MapActionTickEvent) => {
                const projection = e.get("target").options.get("projection");
                const { globalPixelCenter, zoom } = e.get("tick");
                const next = projection.fromGlobalPixels(
                  globalPixelCenter,
                  zoom,
                );
                setPreviewCoords(next);
                setCoords(next);
              }}
              defaultState={{
                center: (previewCoords ?? initialCenter) as [number, number],
                zoom: 14,
                controls: ["zoomControl"],
              }}
            >
              <SearchControl options={{ float: "right", noPlacemark: true }} />
              <Placemark
                geometry={(coords ?? previewCoords ?? initialCenter) as [
                  number,
                  number,
                ]}
                options={{
                  iconLayout: "default#image",
                  iconImageHref: iconHrefByKind[kind],
                  iconImageSize: [40, 40],
                }}
              />
            </Map>
          </YMaps>
        </div>
      ) : (
        <span style={{ fontSize: 12, color: "#E95B47" }}>
          Не задан ключ карты (`VITE_YMAPS_API_KEY`). Карта не отобразится.
        </span>
      )}
      <Button variant="secondary" onClick={getLocation} iconRight={<IconMap />}>
        Определить местоположение
      </Button>
      <div
        onClick={() => document.getElementById(`place-photo-${kind}`)?.click()}
        style={{
          width: 200,
          height: 200,
          borderRadius: 20,
          background: "rgba(255,252,245,0.5)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          overflow: "hidden",
        }}
      >
        {photoPreview ? (
          <img src={photoPreview} alt="Фото" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        ) : (
          <span style={{ color: "#74736E" }}>Загрузить фото</span>
        )}
      </div>
      <input id={`place-photo-${kind}`} type="file" accept="image/*" onChange={onPhotoChange} style={{ display: "none" }} />
      <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <Checkbox checked={withVisit} onChange={(e) => setWithVisit(e.target.checked)} />
        {mySiba?.siba_name ?? "Мой питомец"} был здесь
      </label>
      {error && <span style={{ fontSize: 12, color: "#E95B47" }}>{error}</span>}
      <div style={{ display: "flex", gap: 10 }}>
        <Button variant="secondary" onClick={onClose} disabled={savePlaceMutation.isPending}>
          Отмена
        </Button>
        <Button onClick={handleSave} loading={savePlaceMutation.isPending}>
          Сохранить
        </Button>
      </div>
    </div>
  );
};
