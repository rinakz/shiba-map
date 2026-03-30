import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { fetchPlaceVisits } from "./general-map.utils";
import type { Place, PlaceKind, PlaceVisit } from "./place-types";
import { Button } from "../../shared/ui";
import { Dialog, SwipeableDrawer, useMediaQuery } from "@mui/material";
import { Siba } from "../siba/siba";

type PlaceDetailProps = {
  kind: PlaceKind;
  place: Place;
};

type GeoObjectLike = {
  getAddressLine?: () => string;
  properties?: {
    getAll?: () => Record<string, unknown>;
  };
};

type GeocodeResultLike = {
  geoObjects?: {
    get?: (idx: number) => GeoObjectLike | null;
    toArray?: () => GeoObjectLike[];
  };
};

type YMapsLike = {
  geocode?: (coords: [number, number]) => Promise<GeocodeResultLike>;
};

export const PlaceDetail = ({ kind, place }: PlaceDetailProps) => {
  const [showAll, setShowAll] = useState(false);
  const [resolvedAddress, setResolvedAddress] = useState<string>(place.address);
  const [isResolvingAddress, setIsResolvingAddress] = useState(false);
  const [selectedSibaId, setSelectedSibaId] = useState<string | null>(null);
  const isMobile = useMediaQuery("(max-width:600px)");
  const visitsQuery = useQuery<PlaceVisit[]>({
    queryKey: ["place-visits", kind, place.id],
    queryFn: () => fetchPlaceVisits(kind, place.id),
  });

  const visits = visitsQuery.data ?? [];
  const first = visits[0];

  const tryParseCoordsFromAddress = (value: string): [number, number] | null => {
    const trimmed = value.trim();
    if (!trimmed.startsWith("[") || !trimmed.endsWith("]")) return null;
    try {
      const parsed = JSON.parse(trimmed);
      if (!Array.isArray(parsed) || parsed.length < 2) return null;
      const lat = Number(parsed[0]);
      const lng = Number(parsed[1]);
      if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
      return [lat, lng];
    } catch {
      return null;
    }
  };

  const extractAddressFromGeoObject = (geoObject: GeoObjectLike | null): string | null => {
    if (!geoObject) return null;
    const line = geoObject?.getAddressLine?.();
    if (typeof line === "string" && line.trim()) return line.trim();
    const props = geoObject?.properties?.getAll?.() ?? {};
    const propsText =
      typeof props?.text === "string" ? props.text.trim() : undefined;
    if (propsText) return propsText;
    return null;
  };

  const addressCoords = useMemo(() => tryParseCoordsFromAddress(place.address), [place.address]);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      if (!addressCoords) {
        setResolvedAddress(place.address);
        return;
      }
      const ymaps = (window as Window & { ymaps?: YMapsLike }).ymaps;
      if (!ymaps?.geocode) {
        setResolvedAddress(place.address);
        return;
      }
      setIsResolvingAddress(true);
      try {
        const res = await ymaps.geocode(addressCoords);
        const geoObjects = res?.geoObjects;
        const firstObj =
          geoObjects?.get?.(0) ?? geoObjects?.toArray?.()?.[0] ?? null;
        const addr = extractAddressFromGeoObject(firstObj);
        if (!cancelled) setResolvedAddress(addr ?? "Адрес не определен");
      } catch {
        if (!cancelled) setResolvedAddress("Адрес не определен");
      } finally {
        if (!cancelled) setIsResolvingAddress(false);
      }
    };
    run();
    return () => {
      cancelled = true;
    };
  }, [addressCoords, place.address]);

  return (
    <div style={{ padding: 12, maxWidth: 480 }}>
      <h3 style={{ marginTop: 0 }}>{place.name}</h3>
      <div style={{ color: "#74736E", marginBottom: 8 }}>
        {isResolvingAddress ? "Определяем адрес..." : resolvedAddress}
      </div>
      {place.photo && (
        <img
          src={place.photo}
          alt={place.name}
          style={{ width: "100%", borderRadius: 12, marginBottom: 8 }}
        />
      )}
      {first ? (
        <div
          style={{
            marginTop: 8,
            display: "flex",
            gap: 8,
            alignItems: "center",
            cursor: "pointer",
          }}
          onClick={() => setSelectedSibaId(first.siba_id)}
        >
          <img
            src={first.siba_photo ?? `/${first.siba_icon ?? "default"}.png`}
            alt={first.siba_name ?? "Сиба"}
            style={{
              width: 28,
              height: 28,
              borderRadius: 14,
              objectFit: "cover",
            }}
          />
          <div>
            Тут был: <b>{first.siba_name ?? "Сиба"}</b> —{" "}
            {new Date(first.visited_at).toLocaleDateString()}
          </div>
        </div>
      ) : (
        <div style={{ marginTop: 8, color: "#74736E" }}>Пока никто не отметился</div>
      )}
      {visits.length > 1 && !showAll && (
        <div style={{ marginTop: 8 }}>
          <Button size="small" onClick={() => setShowAll(true)}>
            Ещё
          </Button>
        </div>
      )}
      {showAll && (
        <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 6 }}>
          {visits.map((v) => (
            <div
              key={v.id}
              style={{ color: "#74736E", display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}
              onClick={() => setSelectedSibaId(v.siba_id)}
            >
              <img
                src={v.siba_photo ?? `/${v.siba_icon ?? "default"}.png`}
                alt={v.siba_name ?? "Сиба"}
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: 12,
                  objectFit: "cover",
                }}
              />
              <span>
                {new Date(v.visited_at).toLocaleDateString()} — {v.siba_name ?? "Сиба"}
              </span>
            </div>
          ))}
        </div>
      )}
      {isMobile ? (
        <SwipeableDrawer
          anchor="bottom"
          open={Boolean(selectedSibaId)}
          onOpen={() => {}}
          onClose={() => setSelectedSibaId(null)}
          PaperProps={{
            sx: {
              height: "auto",
              maxHeight: "85vh",
              borderTopLeftRadius: 16,
              borderTopRightRadius: 16,
            },
          }}
        >
          {selectedSibaId && <Siba id={selectedSibaId} />}
        </SwipeableDrawer>
      ) : (
        <Dialog
          open={Boolean(selectedSibaId)}
          onClose={() => setSelectedSibaId(null)}
          fullWidth
          maxWidth="xs"
          PaperProps={{ sx: { borderRadius: 2 } }}
        >
          {selectedSibaId && <Siba id={selectedSibaId} />}
        </Dialog>
      )}
    </div>
  );
};
