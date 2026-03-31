export type YMapGeoObject = {
  getAddressLine?: () => string;
  properties?: {
    getAll?: () => Record<string, unknown>;
    get?: (name: string) => unknown;
  };
};

export type YMapGeoCollection = {
  get?: (index: number) => YMapGeoObject | null;
  toArray?: () => YMapGeoObject[];
};

export type YMapGeocodeResult = {
  geoObjects?: YMapGeoCollection;
};

export type YMapGeocodeApi = {
  geocode: (q: string | [number, number]) => Promise<YMapGeocodeResult>;
};

const toText = (value: unknown): string | null =>
  typeof value === "string" && value.trim() ? value.trim() : null;

export const extractAddressFromGeoObject = (
  geoObject: YMapGeoObject | null | undefined,
): string | null => {
  if (!geoObject) return null;

  const line = toText(geoObject.getAddressLine?.());
  if (line) return line;

  const props = geoObject.properties?.getAll?.() ?? {};

  const directText =
    toText(props.text) ??
    toText(props.name) ??
    toText(props.description) ??
    toText(geoObject.properties?.get?.("text"));
  if (directText) return directText;

  const metaDataProperty =
    (props.metaDataProperty as Record<string, unknown> | undefined) ?? {};
  const geocoderMetaData =
    (metaDataProperty.GeocoderMetaData as Record<string, unknown> | undefined) ??
    {};
  const address =
    (geocoderMetaData.Address as Record<string, unknown> | undefined) ?? {};

  const metaText =
    toText(geocoderMetaData.text) ??
    toText(address.formatted) ??
    toText(address.addressLine);
  if (metaText) return metaText;

  const components = Array.isArray(address.Components)
    ? (address.Components as Array<Record<string, unknown>>)
    : [];
  if (components.length) {
    const parts = components
      .map((c) => toText(c.name))
      .filter(Boolean) as string[];
    if (parts.length) return parts.join(", ");
  }

  return null;
};

export const geocodeAddressFromCoords = async (
  ymaps: YMapGeocodeApi | undefined,
  coords: [number, number],
): Promise<string | null> => {
  if (!ymaps?.geocode) return null;
  const attempts: [number, number][] = [coords, [coords[1], coords[0]]];
  for (const attempt of attempts) {
    try {
      const res = await ymaps.geocode(attempt);
      const first = res?.geoObjects?.get?.(0) ?? res?.geoObjects?.toArray?.()?.[0] ?? null;
      const text = extractAddressFromGeoObject(first);
      if (text) return text;
    } catch {
      // continue next attempt
    }
  }
  return null;
};
