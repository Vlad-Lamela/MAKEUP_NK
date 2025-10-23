import React from "react";

type Props = {
  lat: number;  // широта
  lon: number;  // долгота
  zoom?: number;
  label?: string;
  height?: number;
  className?: string;
};

/** Простой виджет Яндекс.Карт без ключа: карта + одна метка */
export default function YandexMap({
  lat,
  lon,
  zoom = 16,
  label = "Открыть в Яндекс.Картах",
  height = 360,
  className,
}: Props) {
  const ll = `${lon.toFixed(6)},${lat.toFixed(6)}`;       // центр (lon,lat)
  const pt = `${lon.toFixed(6)},${lat.toFixed(6)},pm2rdl`; // красная метка
  const src = `https://yandex.ru/map-widget/v1/?ll=${encodeURIComponent(ll)}&z=${zoom}&pt=${encodeURIComponent(pt)}`;

  return (
    <div className={className}>
      <iframe
        src={src}
        width="100%"
        height={height}
        style={{ border: 0 }}
        allowFullScreen
        loading="lazy"
      />
      <div style={{ marginTop: 8 }}>
        <a
          href={`https://yandex.ru/maps/?ll=${ll}&z=${zoom}&pt=${pt}`}
          target="_blank"
          rel="noreferrer"
        >
          {label}
        </a>
      </div>
    </div>
  );
}
