
import React from "react";
import { YMaps, Map, Placemark } from "@pbe/react-yandex-maps";

/**
 * Безопасный компонент Яндекс.Карт:
 * - Центр всегда массив [lat, lon] (если не передали — берём дефолт).
 * - Никаких деструктуризаций из undefined.
 * - Пин кликабелен: открывает маршрут в Яндекс.Картах.
 * - Не рендерим карту на сервере (SSR guard).
 */

type Props = {
  /** Центр карты, если не указать — возьмём дефолт (Нижнекамск, Бызова 2к2 окрестности) */
  center?: [number, number] | number[] | null | undefined;
  /** Зум по умолчанию */
  zoom?: number;
  /** Высота контейнера */
  height?: number | string;
};

const DEFAULT_CENTER: [number, number] = [55.6345, 51.8143]; // безопасный дефолт

function normalizeCenter(input: Props["center"]): [number, number] {
  if (Array.isArray(input) && input.length === 2) {
    const a = Number(input[0]);
    const b = Number(input[1]);
    if (Number.isFinite(a) && Number.isFinite(b)) return [a, b];
  }
  return DEFAULT_CENTER;
}

export default function YandexMap(props: Props) {
  const isClient = typeof window !== "undefined";
  const center = React.useMemo(() => normalizeCenter(props.center), [props.center]);
  const zoom = Number.isFinite(props.zoom as number) ? (props.zoom as number) : 16;
  const height = props.height ?? 385;

  const openYandexRoute = React.useCallback(() => {
    const url = `https://yandex.ru/maps/?rtext=~${center[0]},${center[1]}&rtt=auto`;
    window.open(url, "_blank", "noopener,noreferrer");
  }, [center]);

  if (!isClient) {
    // SSR/fallback — ничего «итерировать» не пытаемся
    return <div style={{ width: "100%", height }} />;
  }

  return (
    <div style={{ width: "100%", height }}>
      <YMaps query={{ lang: "ru_RU" }}>
        <Map
          width="100%"
          height={height}
          state={{ center, zoom }}
          defaultState={{ center, zoom }}
          options={{
            yandexMapDisablePoiInteractivity: true,
            suppressMapOpenBlock: true,
          }}
        >
          <Placemark
            geometry={center}
            options={{ preset: "islands#violetDotIcon", iconColor: "#8D5193" }}
            properties={{
              hintContent: "MAKEUP NK",
              balloonContent: "Нажмите, чтобы построить маршрут в Яндекс.Картах",
            }}
            onClick={openYandexRoute}
          />
        </Map>
      </YMaps>
    </div>
  );
}
