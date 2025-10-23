
import React from "react";
import {
  YMaps,
  Map,
  Placemark,
} from "@pbe/react-yandex-maps";

type Props = {
  /** [lat, lon] */
  center?: [number, number];
  /** 10–19 обычно */
  zoom?: number;
  /** px */
  height?: number;
};

const DEFAULT_CENTER: [number, number] = [55.6345, 51.8143]; // Бызова 2к2
const DEFAULT_ZOOM = 17;

export default function YandexMap({
  center = DEFAULT_CENTER,
  zoom = DEFAULT_ZOOM,
  height = 385,
}: Props) {
  // формируем ссылку «Маршрут» в Яндекс.Картах
  const [lat, lon] = center;
  const routeUrl = `https://yandex.ru/maps/?rtext=~${lat},${lon}&rtt=auto`;

  return (
    <div style={{ width: "100%", height }}>
      <YMaps
        /** грузим карты «лениво» и минимально */
        query={{
          // язык/регион можно поменять: ru_RU / tr_TR и т.п.
          lang: "ru_RU",
          // только необходимые модули
          load: "package.full",
        }}
      >
        <Map
          defaultState={{ center, zoom }}
          state={{ center, zoom }}
          width="100%"
          height={height}
          options={{
            suppressMapOpenBlock: true,
            yandexMapAllowCSSFilters: true,
          }}
          modules={["control.ZoomControl", "control.FullscreenControl"]}
        >
          <Placemark
            geometry={center}
            options={{
              preset: "islands#violetIcon",
              openEmptyBalloon: true,
            }}
            properties={{
              iconCaption: "Dream Room",
              balloonContent:
                `<div style="font:13px/1.4 system-ui">
                   <div><b>MAKEUP NK</b></div>
                   <div>ул. Бызова 2к2, салон Dream Room</div>
                   <div style="margin-top:8px">
                     <a href="${routeUrl}" target="_blank" rel="noopener noreferrer">Маршрут в Яндекс.Картах</a>
                   </div>
                 </div>`,
            }}
            onClick={() => {
              // по клику сразу открываем маршрут в новой вкладке
              window.open(routeUrl, "_blank", "noopener,noreferrer");
            }}
            modules={["geoObject.addon.balloon", "geoObject.addon.hint"]}
          />
        </Map>
      </YMaps>
    </div>
  );
}
