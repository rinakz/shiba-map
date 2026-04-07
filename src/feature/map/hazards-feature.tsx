import { Placemark } from "@pbe/react-yandex-maps";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { HazardMarkers } from "./hazard-markers";
import {
  fetchActiveHazards,
  insertHazard,
  type HazardKind,
  hazardIconHrefByKind,
} from "./general-map.utils";
import stls from "./map.module.sass";

type Props = {
  addingKind: HazardKind | null;
  setAddingKind: (k: HazardKind | null) => void;
  pendingCoords: [number, number] | null;
  setPendingCoords: (c: [number, number] | null) => void;
};

export const HazardsFeature = ({
  addingKind,
  setAddingKind,
  pendingCoords,
  setPendingCoords,
}: Props) => {
  const queryClient = useQueryClient();

  const hazardsQuery = useQuery({
    queryKey: ["hazards", "active"],
    queryFn: fetchActiveHazards,
    refetchOnWindowFocus: true,
    refetchInterval: false,
  });

  return (
    <>
      <HazardMarkers hazards={hazardsQuery.data ?? []} />
      {addingKind && pendingCoords && (
        <Placemark
          key="haz-pending"
          geometry={pendingCoords}
          options={{
            iconLayout: "default#image",
            iconImageHref: hazardIconHrefByKind[addingKind],
            iconImageSize: [40, 40],
          }}
        />
      )}
      {addingKind && pendingCoords && (
        <div className={stls.hazardConfirm}>
          <button
            type="button"
            className={`${stls.hazardConfirmButton} ${stls.hazardConfirmSave}`}
            onClick={() => {
              insertHazard({
                kind: addingKind!,
                lat: pendingCoords[0],
                lon: pendingCoords[1],
              })
                .then(() => {
                  setAddingKind(null);
                  setPendingCoords(null);
                  queryClient.invalidateQueries({ queryKey: ["hazards", "active"] });
                })
                .catch(() => {
                  setPendingCoords(null);
                });
            }}
          >
            Сохранить
          </button>
          <button
            type="button"
            className={stls.hazardConfirmButton}
            onClick={() => {
              setPendingCoords(null);
            }}
          >
            Отмена
          </button>
        </div>
      )}
    </>
  );
};

