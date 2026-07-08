import L from 'leaflet';
import { MAP_MARKER_TYPES } from '@/config/mapOptions';

const MARKER_STYLES = {
  [MAP_MARKER_TYPES.MEMBER]: {
    size: 36,
    borderRadius: '9999px',
    background: '#4f46e5',
    fontSize: '11px',
  },
  [MAP_MARKER_TYPES.SCHOOL]: {
    size: 34,
    borderRadius: '10px',
    background: '#0ea5e9',
    fontSize: '10px',
  },
  [MAP_MARKER_TYPES.BRANCH]: {
    size: 38,
    borderRadius: '9999px',
    background: '#10b981',
    fontSize: '16px',
  },
  [MAP_MARKER_TYPES.MINISTRY]: {
    size: 36,
    borderRadius: '12px',
    background: '#f59e0b',
    fontSize: '12px',
  },
  [MAP_MARKER_TYPES.CREATIVE_ARTS]: {
    size: 36,
    borderRadius: '9999px',
    background: '#ec4899',
    fontSize: '14px',
  },
};

export function createMapMarkerIcon(marker) {
  const style = MARKER_STYLES[marker.type] || MARKER_STYLES[MAP_MARKER_TYPES.MEMBER];
  const label = marker.label || '•';
  const size = style.size;

  const html = `
    <div
      style="
        width:${size}px;
        height:${size}px;
        border-radius:${style.borderRadius};
        background:${style.background};
        color:#ffffff;
        display:flex;
        align-items:center;
        justify-content:center;
        font-size:${style.fontSize};
        font-weight:700;
        border:2px solid rgba(255,255,255,0.95);
        box-shadow:0 2px 10px rgba(0,0,0,0.45);
        line-height:1;
      "
      aria-hidden="true"
    >${label}</div>
  `;

  return L.divIcon({
    className: 'map-marker-icon',
    html,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -(size / 2)],
  });
}
