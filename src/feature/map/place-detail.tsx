import { useQuery } from "@tanstack/react-query";
import { fetchPlaceVisits } from "./general-map.utils";
import type { Place, PlaceKind } from "./place-types";
import { useState } from "react";
import { Button } from "../../shared/ui";

type PlaceDetailProps = {
  kind: PlaceKind;
  place: Place;
};

export const PlaceDetail = ({ kind, place }: PlaceDetailProps) => {
  const [showAll, setShowAll] = useState(false);
  const visitsQuery = useQuery({
    queryKey: ["place-visits", kind, place.id],
    queryFn: () => fetchPlaceVisits(kind, place.id),
  });

  const visits = visitsQuery.data ?? [];
  const first = visits[0];

  return (
    <div style={{ padding: 12, maxWidth: 480 }}>
      <h3 style={{ marginTop: 0 }}>{place.name}</h3>
      <div style={{ color: "#74736E", marginBottom: 8 }}>{place.address}</div>
      {place.photo && (
        <img
          src={place.photo}
          alt={place.name}
          style={{ width: "100%", borderRadius: 12, marginBottom: 8 }}
        />
      )}
      {first ? (
        <div style={{ marginTop: 8 }}>
          Тут был: <b>{first.siba_name ?? "Сиба"}</b> —{" "}
          {new Date(first.visited_at).toLocaleDateString()}
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
            <div key={v.id} style={{ color: "#74736E" }}>
              {new Date(v.visited_at).toLocaleDateString()} — {v.siba_name ?? "Сиба"}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
