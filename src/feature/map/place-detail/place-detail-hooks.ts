import { useEffect, useMemo, useState } from "react";
import {
  geocodeAddressFromCoords,
  type YMapGeocodeApi,
} from "../../../shared/api/ymaps-geocode";
import { formatCoords, tryParseCoordsFromAddress } from "./place-detail.utils";

export function useResolvedPlaceAddress(address: string) {
  const [resolvedAddress, setResolvedAddress] = useState(address);
  const [isResolvingAddress, setIsResolvingAddress] = useState(false);

  const addressCoords = useMemo(
    () => tryParseCoordsFromAddress(address),
    [address],
  );

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      if (!addressCoords) {
        setResolvedAddress(address);
        return;
      }
      const ymaps = (window as unknown as { ymaps?: YMapGeocodeApi }).ymaps;
      if (!ymaps) {
        setResolvedAddress(formatCoords(addressCoords));
        return;
      }
      setIsResolvingAddress(true);
      try {
        const backwardAddr = await geocodeAddressFromCoords(
          ymaps,
          addressCoords,
        );
        if (!cancelled) {
          setResolvedAddress(backwardAddr ?? formatCoords(addressCoords));
        }
      } catch {
        if (!cancelled) setResolvedAddress(formatCoords(addressCoords));
      } finally {
        if (!cancelled) setIsResolvingAddress(false);
      }
    };
    void run();
    return () => {
      cancelled = true;
    };
  }, [addressCoords, address]);

  return { resolvedAddress, isResolvingAddress };
}
