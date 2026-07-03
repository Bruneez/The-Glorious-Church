import { useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import { CARTO_TILE_URL, CARTO_ATTRIBUTION } from '@/config/mapConfig';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

function FitBounds({ positions, enabled }) {
  const map = useMap();

  useEffect(() => {
    if (!enabled || positions.length === 0) return;
    const bounds = L.latLngBounds(positions);
    map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
  }, [enabled, map, JSON.stringify(positions)]);

  return null;
}

export default function LeafletMap({
  center,
  zoom,
  markers = [],
  fitBounds = false,
}) {
  const positions = useMemo(
    () => markers.map((marker) => marker.coords),
    [markers],
  );

  return (
    <MapContainer
      center={center}
      zoom={zoom}
      className="h-full w-full"
      scrollWheelZoom
    >
      <TileLayer url={CARTO_TILE_URL} attribution={CARTO_ATTRIBUTION} maxZoom={20} />
      <FitBounds positions={positions} enabled={fitBounds && positions.length > 0} />
      {markers.map((marker) => (
        <Marker key={marker.id} position={marker.coords}>
          <Popup>{marker.popup}</Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
