import { Placemark } from "@pbe/react-yandex-maps";
import type { Hazard } from "./general-map.utils";
import { hazardIconHrefByKind } from "./general-map.utils";

type Props = {
  hazards: Hazard[];
};

export const HazardMarkers = ({ hazards }: Props) => {
  return (
    <>
      {hazards.map((h) => (
        <Placemark
          key={`haz-${h.id}`}
          geometry={[h.lat, h.lon]}
          properties={{
            hintContent:
              h.kind === "doghunters"
                ? "Опасность: догхантеры"
                : h.kind === "reagents"
                ? "Опасность: реагенты/химия"
                : "Опасность: салют/шум",
          }}
          options={{
            iconLayout: "default#image",
            iconImageHref: hazardIconHrefByKind[h.kind],
            iconImageSize: [40, 40],
          }}
        />
      ))}
    </>
  );
};

