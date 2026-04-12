import { Map, Placemark, YMaps } from "@pbe/react-yandex-maps";
import {
  getSibaMarkerAbsoluteHref,
  normalizeCoords,
} from "../map/general-map.utils";
import stls from "./siba-location-map.module.sass";

type SibaLocationMapProps = {
  coordinates: unknown;
  sibaIcon?: string | null;
};

const MAP_HEIGHT_PX = 200;

const ymapsApiKey = import.meta.env.VITE_YMAPS_API_KEY as string | undefined;

export const SibaLocationMap = ({
  coordinates,
  sibaIcon,
}: SibaLocationMapProps) => {
  const pos = normalizeCoords(coordinates);
  if (!ymapsApiKey || !pos) return null;

  const [lat, lon] = pos;
  const iconHref = getSibaMarkerAbsoluteHref(sibaIcon);

  return (
    <div className={stls.mapSnippet}>
      <div className={stls.mapSnippetTitle}>На карте</div>
      <div className={stls.mapBox}>
        <YMaps query={{ apikey: ymapsApiKey }}>
          <Map
            defaultState={{ center: [lat, lon], zoom: 14, controls: [] }}
            width="100%"
            height={MAP_HEIGHT_PX}
            options={{
              suppressMapOpenBlock: true,
            }}
          >
            <Placemark
              geometry={[lat, lon]}
              options={{
                iconLayout: "default#image",
                iconImageHref: iconHref,
                iconImageSize: [44, 44],
                iconImageOffset: [-22, -44],
              }}
            />
          </Map>
        </YMaps>
      </div>
    </div>
  );
};
