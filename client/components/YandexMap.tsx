import React from "react";

type Props = {
  lat: number;   // широта
  lon: number;   // долгота
  zoom?: number;
  label?: string;         // подпись к ссылке "Открыть в Яндекс.Картах"
  height?: number;        // высота карты/превью
  className?: string;
};

export default function YandexMap({
  lat,
  lon,
  zoom = 16,
  label = "Открыть в Яндекс.Картах",
  height = 360,
  className,
}: Props) {
  const [enabled, setEnabled] = React.useState(false);

  // Yandex ожидает ll/pt как lon,lat
  const ll = `${lon.toFixed(6)},${lat.toFixed(6)}`;
  const pt = `${lon.toFixed(6)},${lat.toFixed(6)},pm2rdl`;

  // iframe (живые Яндекс.Карты)
  const iframeSrc = `https://yandex.ru/map-widget/v1/?ll=${encodeURIComponent(ll)}&z=${zoom}&pt=${encodeURIComponent(pt)}`;

  // статическое превью (очень быстро)
  // Док: https://yandex.ru/dev-maps/staticapi/ (Static Maps API)
  // size в пикселях: ширина х высота; ограничим по ширине, высоту подгоним через параметр
  const staticWidth = 650; // реальная ширина изображения (не влияет на CSS width=100%)
  const staticHeight = Math.round(height); 
  const staticSrc = `https://static-maps.yandex.ru/1.x/?ll=${encodeURIComponent(ll)}&z=${zoom}&l=map&size=${staticWidth},${staticHeight}&pt=${encodeURIComponent(pt)}`;

  // внешние ссылки
  const mapsUrl   = `https://yandex.ru/maps/?ll=${ll}&z=${zoom}&pt=${pt}`;
  // Маршрут «из моего местоположения» к точке:
  // rtext=~lat,lon  (пустое «откуда» = текущее местоположение, если доступно)
  const routeUrl  = `https://yandex.ru/maps/?rtext=~${lat.toFixed(6)},${lon.toFixed(6)}&rtt=auto`;

  return (
    <div className={className}>
      {/* Карта или превью */}
      {enabled ? (
        <iframe
          src={iframeSrc}
          width="100%"
          height={height}
          style={{ border: 0 }}
          allowFullScreen
          loading="lazy"
        />
      ) : (
        <div style={{ position: "relative", width: "100%", height }}>
          <img
            src={staticSrc}
            alt="Карта (превью)"
            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", borderRadius: 8 }}
          />
          <button
            type="button"
            onClick={() => setEnabled(true)}
            style={{
              position: "absolute",
              left: "50%",
              top: "50%",
              transform: "translate(-50%,-50%)",
              padding: "10px 16px",
              borderRadius: 8,
              border: "none",
              cursor: "pointer",
              fontWeight: 700,
              background: "#693B9A",
              color: "#fff",
              boxShadow: "0 6px 16px rgba(0,0,0,.25)",
            }}
          >
            Включить карту
          </button>
        </div>
      )}

      {/* Ссылки под картой */}
      <div style={{ marginTop: 12, display: "flex", gap: 12, flexWrap: "wrap" }}>
        <a
          href={mapsUrl}
          target="_blank"
          rel="noreferrer"
          style={linkStyle}
        >
          {label}
        </a>
        <a
          href={routeUrl}
          target="_blank"
          rel="noreferrer"
          style={linkStyle}
        >
          Построить маршрут
        </a>
      </div>
    </div>
  );
}

const linkStyle: React.CSSProperties = {
  background: "#693B9A",
  color: "#fff",
  fontWeight: 700,
  padding: "10px 14px",
  borderRadius: 8,
  textDecoration: "none",
  display: "inline-block",
};
