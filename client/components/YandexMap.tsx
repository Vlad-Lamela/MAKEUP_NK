import React from "react";

type Props = {
  lat: number;   // широта
  lon: number;   // долгота
  zoom?: number;
  height?: number;        // высота области
  className?: string;     // например: "rounded-lg overflow-hidden"
};

export default function YandexMap({
  lat,
  lon,
  zoom = 16,
  height = 360,
  className,
}: Props) {
  const [enabled, setEnabled] = React.useState(false);

  // Yandex ждёт lon,lat в параметрах
  const ll = `${lon.toFixed(6)},${lat.toFixed(6)}`;
  const pt = `${lon.toFixed(6)},${lat.toFixed(6)},pm2rdl`;

  // Живой виджет (iframe)
  const iframeSrc = `https://yandex.ru/map-widget/v1/?ll=${encodeURIComponent(ll)}&z=${zoom}&pt=${encodeURIComponent(pt)}`;

  // Быстрое статичное изображение (Static Maps)
  const staticWidth  = 650;                   // фактический размер изображения
  const staticHeight = Math.round(height);
  const staticSrc = `https://static-maps.yandex.ru/1.x/?ll=${encodeURIComponent(ll)}&z=${zoom}&l=map&size=${staticWidth},${staticHeight}&pt=${encodeURIComponent(pt)}`;

  if (enabled) {
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

  // Превью-картинка: кликаем — включаем карту
  return (
    <img
      src={staticSrc}
      alt="Карта"
      title="Нажмите, чтобы открыть карту"
      width="100%"
      style={{ width: "100%", height, objectFit: "cover", display: "block", cursor: "pointer" }}
      onClick={() => setEnabled(true)}
      className={className}
    />
  );
}
