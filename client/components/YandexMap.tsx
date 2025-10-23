import React from "react";
import { YMaps, Map, Placemark, ZoomControl } from "@pbe/react-yandex-maps";

type Props = {
  center: [number, number];   // [lat, lon]
  placemark: [number, number]; // [lat, lon]
  address: string;
  zoom?: number;
  height?: number; // px
};

/**
 * Фишки:
 * - Ленивая инициализация: создаём <Map> только когда секция попала в зону видимости (IntersectionObserver),
 *   это ускоряет первую загрузку.
 * - Клик по пину: открывает маршрут в Яндекс.Картах в новой вкладке.
 * - В балуне есть ссылка «Маршрут».
 */
export default function YandexMap({
  center,
  placemark,
  address,
  zoom = 16,
  height = 385,
}: Props) {
  const [isVisible, setIsVisible] = React.useState(false);
  const holderRef = React.useRef<HTMLDivElement | null>(null);

  // URL для построения маршрута к точке
  const [lat, lon] = placemark;
  const routeUrl = React.useMemo(
    () => `https://yandex.ru/maps/?rtext=~${lat},${lon}&rtt=auto`,
    [lat, lon]
  );

  // Покажем карту только когда секция попала в вьюпорт (чуть заранее)
  React.useEffect(() => {
    if (!holderRef.current) return;
    const io = new IntersectionObserver(
      (entries) => {
        const [e] = entries;
        if (e.isIntersecting) {
          setIsVisible(true);
          io.disconnect();
        }
      },
      { rootMargin: "200px 0px" } // подгружаем карту за ~200px до видимой области
    );
    io.observe(holderRef.current);
    return () => io.disconnect();
  }, []);

  const onPlacemarkClick = React.useCallback(() => {
    window.open(routeUrl, "_blank", "noopener");
  }, [routeUrl]);

  return (
    <div
      ref={holderRef}
      className="rounded-lg overflow-hidden"
      style={{ height }}
    >
      {/* Пока секция не в зоне видимости – не монтируем <Map> вовсе */}
      {!isVisible ? (
        <div
          className="w-full h-full"
          style={{
            // неброский серый скелетон (без кнопок и текста)
            background:
              "linear-gradient(90deg,#2f2f2f 25%,#3a3a3a 37%,#2f2f2f 63%)",
            backgroundSize: "400% 100%",
            animation: "ymap-skeleton 1.2s ease-in-out infinite",
          }}
        />
      ) : (
        <YMaps
          query={{
            // русская локаль; грузим только то, что нужно для карты/контролов/подсказок
            lang: "ru_RU",
            load: "package.map,package.controls,package.geoObjects",
          }}
        >
          <Map
            defaultState={{ center: [center[0], center[1]], zoom }}
            width="100%"
            height={height}
            options={{
              suppressMapOpenBlock: true, // не показывать «Открыть в Я.Картах»
              yandexMapDisablePoiInteractivity: true, // снизить лишние hover-события
            }}
          >
            <ZoomControl options={{ position: { right: 10, top: 10 } }} />
            <Placemark
              geometry={[placemark[0], placemark[1]]}
              options={{
                preset: "islands#violetIcon",
                iconColor: "#8D5193",
                openBalloonOnClick: true,
              }}
              properties={{
                hintContent: address,
                balloonContent: `
                  <div style="font: 13px/1.4 system-ui, -apple-system, Segoe UI, Roboto, Arial">
                    <div style="font-weight:600;margin-bottom:6px">${escapeHtml(
                      address
                    )}</div>
                    <a href="${routeUrl}" target="_blank" rel="noopener" style="color:#8D5193;text-decoration:none">
                      Маршрут в Яндекс.Картах →
                    </a>
                  </div>`,
              }}
              modules={["geoObject.addon.hint", "geoObject.addon.balloon"]}
              onClick={onPlacemarkClick}
            />
          </Map>
        </YMaps>
      )}

      {/* keyframes для скелетона */}
      <style>{`
        @keyframes ymap-skeleton {
          0% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>
    </div>
  );
}

function escapeHtml(s: string) {
  return s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
