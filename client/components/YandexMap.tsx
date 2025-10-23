import React from "react";

type Props = {
  lat: number;
  lon: number;
  zoom?: number;
  height?: number;
  className?: string;
};

export default function YandexMap({
  lat,
  lon,
  zoom = 16,
  height = 360,
  className,
}: Props) {
  // Yandex ждёт lon,lat
  const ll = `${lon.toFixed(6)},${lat.toFixed(6)}`;
  const pt = `${lon.toFixed(6)},${lat.toFixed(6)},pm2rdl`;
  const iframeSrc = `https://yandex.ru/map-widget/v1/?ll=${encodeURIComponent(ll)}&z=${zoom}&pt=${encodeURIComponent(pt)}`;

  return (
    <iframe
      title="Карта"
      src={iframeSrc}
      width="100%"
      height={height}
      style={{ border: 0, display: "block" }}
      loading="lazy"
      allowFullScreen
      referrerPolicy="no-referrer-when-downgrade"
      className={className}
    />
  );
}
