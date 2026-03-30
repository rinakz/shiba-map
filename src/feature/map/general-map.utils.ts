import { supabase } from "../../shared/api/supabase-сlient";
import { SIBA_PHOTOS_BUCKET } from "../../shared/constants/storage";
import type { ShibaType } from "../../shared/types";
import type { Place, PlaceKind, PlaceVisit } from "./place-types";
import type { ChangeEvent } from "react";

type VisitRow = {
  id: string;
  siba_id: string;
  visited_at: string;
  cafe_id?: string;
  place_id?: string;
};

type SibaNameRow = {
  id: string;
  siba_name: string;
  siba_icon?: string | null;
  photos?: string | null;
};

type ResolveCurrentSibaParams = {
  mySiba?: ShibaType;
  authUserId: string | null;
  coordinates: number[];
  setMySiba: (value: ShibaType) => void;
};

export const resolveCurrentSiba = async ({
  mySiba,
  authUserId,
  coordinates,
  setMySiba,
}: ResolveCurrentSibaParams) => {
  if (mySiba?.id && mySiba?.siba_user_id) return mySiba;

  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError) {
    throw new Error(authError.message);
  }

  const effectiveUserId = authData.user?.id ?? authUserId ?? null;
  if (!effectiveUserId) {
    return null;
  }

  const { data: sibas, error: sibasError } = await supabase
    .from("sibains")
    .select("*")
    .eq("siba_user_id", effectiveUserId)
    .limit(1);

  if (sibasError) {
    throw new Error(sibasError.message);
  }

  const existingSiba = sibas?.[0];
  if (existingSiba) {
    setMySiba(existingSiba);
    return existingSiba;
  }

  const { data: userData } = await supabase
    .from("users")
    .select("nickname")
    .eq("user_id", effectiveUserId)
    .maybeSingle();

  const fallbackSibaName = userData?.nickname
    ? `${userData.nickname}’s siba`
    : "Моя сиба";

  const { data: insertedSiba, error: createError } = await supabase
    .from("sibains")
    .insert([
      {
        siba_user_id: effectiveUserId,
        siba_name: fallbackSibaName,
        siba_icon: "default",
        siba_gender: "male",
        coordinates,
      },
    ])
    .select("*")
    .single();

  if (createError) {
    throw new Error(createError.message);
  }

  setMySiba(insertedSiba);
  return insertedSiba;
};

export const normalizeCoords = (coords: unknown): [number, number] | null => {
  if (!Array.isArray(coords) || coords.length < 2) return null;
  const lat = typeof coords[0] === "string" ? Number(coords[0]) : Number(coords[0]);
  const lng = typeof coords[1] === "string" ? Number(coords[1]) : Number(coords[1]);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  return [lat, lng];
};

export const jitterCoords = (coords: [number, number], seed: string) => {
  const [lat, lng] = coords;

  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }

  const r1 = ((h >>> 0) % 1000) / 1000;
  const r2 = (((h >>> 0) / 1000) % 1000) / 1000;

  const maxMeters = 25;
  const latDeltaDeg = (r1 - 0.5) * (maxMeters / 111_320);
  const lngDeltaDeg =
    (r2 - 0.5) * (maxMeters / (111_320 * Math.cos((lat * Math.PI) / 180)));

  return [lat + latDeltaDeg, lng + lngDeltaDeg] as [number, number];
};

export const uploadVerificationPhoto = async (
  targetSiba: ShibaType,
  file: File
) => {
  const { data: uploadData, error: uploadError } = await supabase.storage
    .from(SIBA_PHOTOS_BUCKET)
    .upload(
      `images/${targetSiba.siba_user_id}/verify_${targetSiba.id}_${Date.now()}_${file.name}`,
      file,
      {
        contentType: file.type || "image/jpeg",
        upsert: true,
      }
    );

  if (uploadError) {
    throw new Error(uploadError.message);
  }

  if (!uploadData?.path) {
    throw new Error("Не удалось получить путь загруженного фото.");
  }

  const { data: publicUrlData } = supabase.storage
    .from(SIBA_PHOTOS_BUCKET)
    .getPublicUrl(uploadData.path);

  const photoUrl = publicUrlData?.publicUrl;
  if (!photoUrl) {
    throw new Error("Не удалось получить публичную ссылку на фото.");
  }

  const { error: updateError } = await supabase
    .from("sibains")
    .update({ photos: photoUrl })
    .eq("id", targetSiba.id);

  if (updateError) {
    throw new Error(updateError.message);
  }

  return photoUrl;
};

export type ClusterItem =
  | { type: "siba"; id: string }
  | { type: "place"; kind: "cafe" | "park" | "groomer"; id: string };

type ClusterGeoObjectsCollection =
  | unknown[]
  | {
      toArray?: () => unknown[];
      getLength?: () => number;
      get?: (idx: number) => unknown;
    };

type ClusterObjectLike = {
  getGeoObjects?: () => ClusterGeoObjectsCollection;
};

type ClusterClickEventLike = {
  get?: (key: "object" | "target") => unknown;
  object?: unknown;
  target?: unknown;
};

export type ClusterEventUnknown = ClusterClickEventLike;

const normalizeGeoObjectsToArray = (geoObjects: ClusterGeoObjectsCollection) => {
  if (Array.isArray(geoObjects)) return geoObjects;
  if (typeof geoObjects?.toArray === "function") return geoObjects.toArray();
  if (
    typeof geoObjects?.getLength === "function" &&
    typeof geoObjects?.get === "function"
  ) {
    const len = geoObjects.getLength();
    const arr: unknown[] = [];
    for (let i = 0; i < len; i++) {
      const obj = geoObjects.get(i);
      if (obj) arr.push(obj);
    }
    return arr;
  }
  return [];
};

type GeoObjectPropertiesLike = {
  getAll?: () => Record<string, unknown>;
  get?: (key: string) => unknown;
  // some yandex types also allow direct fields
  [key: string]: unknown;
};

const getPropsFromGeoObject = (item: unknown): GeoObjectPropertiesLike | null => {
  if (!item || typeof item !== "object") return null;
  if (!("properties" in item)) return null;
  const props = (item as { properties?: unknown }).properties;
  return (props && typeof props === "object"
    ? (props as GeoObjectPropertiesLike)
    : null);
};

const uniqClusterItems = (items: ClusterItem[]) => {
  const key = (ci: ClusterItem) =>
    ci.type === "siba" ? `siba:${ci.id}` : `place:${ci.kind}:${ci.id}`;
  return Array.from(
    new globalThis.Map<string, ClusterItem>(items.map((ci) => [key(ci), ci]))
      .values()
  );
};

export const extractClusterItems = (params: {
  event: ClusterClickEventLike;
  sibaIns: ShibaType[];
  cafes: Place[];
  parks: Place[];
  groomers: Place[];
}): ClusterItem[] => {
  const { event, sibaIns, cafes, parks, groomers } = params;

  const clickedObject = event?.get?.("object") ?? event?.object;
  const targetFromEvent = event?.get?.("target") ?? event?.target;
  const clusterTarget = (clickedObject as ClusterObjectLike)?.getGeoObjects
    ? (clickedObject as ClusterObjectLike)
    : (targetFromEvent as ClusterObjectLike);

  if (!clusterTarget?.getGeoObjects) return [];

  const geoObjects = clusterTarget.getGeoObjects();
  const items = normalizeGeoObjectsToArray(geoObjects);

  const getItemFromProps = (item: unknown): ClusterItem | null => {
    const props = getPropsFromGeoObject(item);
    if (!props) return null;

    const all: unknown = props?.getAll?.();
    const rec =
      all && typeof all === "object" ? (all as Record<string, unknown>) : {};

    const itemType =
      (typeof props?.get?.("item_type") === "string"
        ? props.get("item_type")
        : rec["item_type"]) ?? null;

    if (itemType === "siba") {
      const viaGet: unknown = props?.get?.("siba_id");
      const direct: unknown = rec["siba_id"] ?? props?.siba_id;
      const id = (viaGet ?? direct) as unknown;
      return typeof id === "string" ? { type: "siba", id } : null;
    }

    if (itemType === "place") {
      const kind = (props?.get?.("place_kind") ?? rec["place_kind"]) as unknown;
      const id = (props?.get?.("place_id") ?? rec["place_id"]) as unknown;
      if (
        (kind === "cafe" || kind === "park" || kind === "groomer") &&
        typeof id === "string"
      ) {
        return { type: "place", kind, id };
      }
    }

    // backwards compat: siba_id без item_type
    const sibaFallback: unknown =
      props?.get?.("siba_id") ?? rec["siba_id"] ?? props?.siba_id;
    if (typeof sibaFallback === "string") return { type: "siba", id: sibaFallback };

    return null;
  };

  const extracted = uniqClusterItems(
    items
      .map((it) => getItemFromProps(it))
      .filter(Boolean) as ClusterItem[]
  );

  // Fallback: если properties не отдали все id, определим объект по ближайшим координатам.
  if (extracted.length < items.length && items.length > 1) {
    const candidates: ClusterItem[] = [...extracted];

    const allPlaces: Array<{
      kind: "cafe" | "park" | "groomer";
      id: string;
      coordinates: unknown;
    }> = [
      ...(cafes ?? []).map((p) => ({ kind: "cafe" as const, id: p.id, coordinates: p.coordinates })),
      ...(parks ?? []).map((p) => ({ kind: "park" as const, id: p.id, coordinates: p.coordinates })),
      ...(groomers ?? []).map((p) => ({ kind: "groomer" as const, id: p.id, coordinates: p.coordinates })),
    ];

    for (const item of items) {
      if (getItemFromProps(item)) continue;

      const coords =
        typeof item === "object" &&
        item !== null &&
        "geometry" in item &&
        (item as { geometry?: { getCoordinates?: () => unknown } }).geometry
          ?.getCoordinates?.();

      if (!Array.isArray(coords) || coords.length < 2) continue;
      const [lat, lng] = coords as [number, number];

      let best: ClusterItem | null = null;
      let bestDist = Number.POSITIVE_INFINITY;

      for (const el of sibaIns.filter((x) => x.coordinates)) {
        const norm = normalizeCoords(el.coordinates);
        if (!norm) continue;
        const display = jitterCoords(norm, el.siba_user_id ?? el.id);
        const d =
          (display[0] - lat) * (display[0] - lat) +
          (display[1] - lng) * (display[1] - lng);
        if (d < bestDist) {
          bestDist = d;
          best = { type: "siba", id: el.id };
        }
      }

      for (const p of allPlaces) {
        const norm = normalizeCoords(p.coordinates);
        if (!norm) continue;
        const d = (norm[0] - lat) * (norm[0] - lat) + (norm[1] - lng) * (norm[1] - lng);
        if (d < bestDist) {
          bestDist = d;
          best = { type: "place", kind: p.kind, id: p.id };
        }
      }

      if (best) candidates.push(best);
    }

    return uniqClusterItems(candidates);
  }

  return extracted;
};

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

export interface MapActionTickEvent {
  get(key: "target"): MapTargetPayload;
  get(key: "tick"): MapActionTick;
}

export const onMapActionTickComplete = (
  e: MapActionTickEvent,
  setCoordinates: (coords: [number, number]) => void,
) => {
  const projection = e.get("target").options.get("projection");
  const { globalPixelCenter, zoom } = e.get("tick");
  setCoordinates(projection.fromGlobalPixels(globalPixelCenter, zoom));
};

export const requestBrowserLocation = (params: {
  mapRef: { current: ymaps.Map | undefined };
  setIsShowAccept: (v: boolean) => void;
  setCoordinates: (v: [number, number]) => void;
}) => {
  const { mapRef, setIsShowAccept, setCoordinates } = params;
  if (!navigator.geolocation) return;
  navigator.geolocation.getCurrentPosition((position) => {
    setIsShowAccept(false);
    const next: [number, number] = [
      position.coords.latitude,
      position.coords.longitude,
    ];
    setCoordinates(next);
    mapRef.current?.setCenter?.(next, 14, {
      duration: 500,
      timingFunction: "ease-in-out",
    });
  });
};

export const verifyFileToSibaPhoto = async (params: {
  event: ChangeEvent<HTMLInputElement>;
  authUserId: string | null;
  coordinates: [number, number];
  mySiba?: ShibaType;
  setMySiba: (v: ShibaType) => void;
  setVerifyError: (v: string | null) => void;
}) => {
  const { event, authUserId, coordinates, mySiba, setMySiba, setVerifyError } =
    params;
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

  setVerifyError(null);
  const targetSiba = await resolveCurrentSiba({
    mySiba,
    authUserId,
    coordinates,
    setMySiba,
  });

  if (!targetSiba?.id || !targetSiba?.siba_user_id) {
    setVerifyError(
      "Не удалось определить профиль сибы. Завершите регистрацию питомца в профиле.",
    );
    return;
  }

  const photoUrl = await uploadVerificationPhoto(targetSiba, file);
  setMySiba({ ...targetSiba, photos: photoUrl });
  event.target.value = "";
};

const tableByKind: Record<PlaceKind, string> = {
  cafe: "cafes",
  park: "parks",
  groomer: "groomers",
};

export const fetchPlaces = async (kind: PlaceKind): Promise<Place[]> => {
  const table = tableByKind[kind];
  const { data, error } = await supabase.from(table).select("*");
  if (error) throw error;
  return (data ?? []) as Place[];
};

export const fetchPlaceVisits = async (
  kind: PlaceKind,
  placeId: string,
): Promise<PlaceVisit[]> => {
  const table =
    kind === "cafe"
      ? "siba_cafe_visits"
      : kind === "park"
      ? "siba_park_visits"
      : "siba_groomer_visits";

  // В cafe — cafe_id, в park/groomer — place_id (унифицируем в TS через alias).
  const filterColumn = kind === "cafe" ? "cafe_id" : "place_id";
  const { data: visits, error: visitsErr } = await supabase
    .from(table)
    .select(`id, ${filterColumn}, siba_id, visited_at`)
    .eq(filterColumn, placeId)
    .order("visited_at", { ascending: false });

  if (visitsErr) throw visitsErr;
  const safeVisits = (visits ?? []) as VisitRow[];

  if (!safeVisits.length) return [];

  // Подтягиваем siba_name отдельно, чтобы не зависеть от названия FK и alias join'ов.
  const sibaIds = Array.from(new Set(safeVisits.map((v) => v.siba_id)));
  const { data: sibas, error: sibasErr } = await supabase
    .from("sibains")
    .select("id,siba_name,siba_icon,photos")
    .in("id", sibaIds);

  if (sibasErr) throw sibasErr;
  const byId = new Map<string, SibaNameRow>(
    ((sibas ?? []) as SibaNameRow[]).map((s) => [s.id, s]),
  );

  return safeVisits.map((v) => {
    const place_id = kind === "cafe" ? v.cafe_id : v.place_id;
    return {
      id: v.id,
      place_id,
      siba_id: v.siba_id,
      visited_at: v.visited_at,
      siba_name: byId.get(v.siba_id)?.siba_name,
      siba_icon: byId.get(v.siba_id)?.siba_icon,
      siba_photo: byId.get(v.siba_id)?.photos,
    } as PlaceVisit;
  });
};
