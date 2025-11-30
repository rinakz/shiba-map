// import { YMaps, Map, Placemark, Clusterer } from "@pbe/react-yandex-maps";

export default function GeneralMap() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        marginTop: "112px",
      }}
    >
      {/* <YMaps>
        <Map
          height="88vh"
          width="100%"
          defaultState={{
            center: [55.928322, 37.780288],
            zoom: 12,
            controls: ["zoomControl"],
          }}
          modules={["control.ZoomControl"]}
        >
          <Clusterer>
            {jsonData.map((el, idx) => (
              <Placemark
                key={idx}
                modules={["geoObject.addon.balloon"]}
                options={{
                  iconLayout: "default#image",
                  iconImageHref: el.image,
                  iconImageSize: [42, 42],
                }}
                {...el}
              />
            ))}
          </Clusterer>
        </Map>
      </YMaps> */}
    </div>
  );
}
