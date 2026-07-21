import L from 'leaflet';
import { resolveMapMarkerInnerContent } from '@/utils/mapMarkerIconContent';

export { resolveMapMarkerInnerContent } from '@/utils/mapMarkerIconContent';

export function createMapMarkerIcon(marker) {
  const { innerContent, useLightBackground, style } = resolveMapMarkerInnerContent(marker);
  const size = style.size;

  const html = `
    <div
      style="
        width:${size}px;
        height:${size}px;
        border-radius:${style.borderRadius};
        background:${useLightBackground ? '#ffffff' : style.background};
        color:#ffffff;
        display:flex;
        align-items:center;
        justify-content:center;
        font-size:${style.fontSize};
        font-weight:700;
        border:2px solid rgba(255,255,255,0.95);
        box-shadow:0 2px 10px rgba(0,0,0,0.45);
        line-height:1;
        overflow:hidden;
      "
      aria-hidden="true"
    >${innerContent}</div>
  `;

  return L.divIcon({
    className: 'map-marker-icon',
    html,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -(size / 2)],
  });
}
