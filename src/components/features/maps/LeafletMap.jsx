import { useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import { ESRI_ATTRIBUTION, ESRI_WORLD_IMAGERY_TILE_URL } from '@/config/mapConfig';
import { createMapMarkerIcon } from '@/components/features/maps/mapMarkerIcons';

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
  tileUrl = ESRI_WORLD_IMAGERY_TILE_URL,
  attribution = ESRI_ATTRIBUTION,
  maxZoom = 19,
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
      zoomControl
    >
      <TileLayer url={tileUrl} attribution={attribution} maxZoom={maxZoom} />
      <FitBounds positions={positions} enabled={fitBounds && positions.length > 0} />
      {markers.map((marker) => (
        <Marker
          key={marker.id}
          position={marker.coords}
          icon={createMapMarkerIcon(marker)}
        >
          <Popup className="map-popup" maxWidth={280}>
            {marker.popup}
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
