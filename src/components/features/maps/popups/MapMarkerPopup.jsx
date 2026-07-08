import { MAP_MARKER_TYPES } from '@/config/mapOptions';
import {
  MapBranchPopup,
  MapCreativeArtsPopup,
  MapMemberPopup,
  MapMinistryPopup,
  MapSchoolPopup,
} from '@/components/features/maps/popups/MapMarkerPopups';

export default function MapMarkerPopup({ marker }) {
  if (!marker?.data) return null;

  switch (marker.type) {
    case MAP_MARKER_TYPES.MEMBER:
      return <MapMemberPopup data={marker.data} />;
    case MAP_MARKER_TYPES.SCHOOL:
      return <MapSchoolPopup data={marker.data} />;
    case MAP_MARKER_TYPES.BRANCH:
      return <MapBranchPopup data={marker.data} />;
    case MAP_MARKER_TYPES.MINISTRY:
      return <MapMinistryPopup data={marker.data} />;
    case MAP_MARKER_TYPES.CREATIVE_ARTS:
      return <MapCreativeArtsPopup data={marker.data} />;
    default:
      return null;
  }
}
