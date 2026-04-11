/** Начальная точка карты (Москва) до геолокации / движения карты. */
export const DEFAULT_MAP_CENTER: [number, number] = [55.75, 37.57];

export const getYmapsApiKey = (): string | undefined =>
  import.meta.env.VITE_YMAPS_API_KEY as string | undefined;
