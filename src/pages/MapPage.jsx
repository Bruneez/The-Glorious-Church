import { useEffect, useMemo, useState } from 'react';
import LeafletMap from '@/components/features/maps/LeafletMap';
import MapLayerControls from '@/components/features/maps/MapLayerControls';
import MapMarkerPopup from '@/components/features/maps/popups/MapMarkerPopup';
import { MAP_DEFAULT_CENTER, MAP_DEFAULT_ZOOM } from '@/config/mapConfig';
import { createDefaultActiveLayers, filterMarkersByActiveLayers, MAP_LAYER_IDS } from '@/config/mapOptions';
import { computeMemberCountsBySchool } from '@/config/schoolsOptions';
import { mergeMemberAndSchoolMarkers } from '@/utils/schoolLocations';
import { buildMemberHomeLocationMarkers, buildSchoolLocationMarkers, fetchMapMarkers } from '@/services/mapService';
import { useMembers } from '@/services/membersService';
import { useSchoolsDirectory } from '@/services/schoolsService';

export default function MapPage() {
  const { data: members = [], loading: membersLoading } = useMembers();
  const { data: schools = [], loading: schoolsLoading } = useSchoolsDirectory();
  const [activeLayers, setActiveLayers] = useState(createDefaultActiveLayers);
  const [otherMarkers, setOtherMarkers] = useState([]);
  const [otherLoading, setOtherLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    fetchMapMarkers()
      .then((markers) => {
        if (isMounted) {
          setOtherMarkers(markers);
        }
      })
      .finally(() => {
        if (isMounted) {
          setOtherLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const memberMarkers = useMemo(
    () => buildMemberHomeLocationMarkers(members, MAP_LAYER_IDS.MEMBERS),
    [members],
  );

  const memberCounts = useMemo(
    () => computeMemberCountsBySchool(members, schools),
    [members, schools],
  );

  const schoolMarkers = useMemo(
    () => buildSchoolLocationMarkers(schools, memberCounts),
    [memberCounts, schools],
  );

  const mapMarkers = useMemo(
    () => mergeMemberAndSchoolMarkers(memberMarkers, [...schoolMarkers, ...otherMarkers]),
    [memberMarkers, otherMarkers, schoolMarkers],
  );

  const visibleMarkers = useMemo(() => {
    const filtered = filterMarkersByActiveLayers(mapMarkers, activeLayers);
    return filtered.map((marker) => ({
      ...marker,
      popup: <MapMarkerPopup marker={marker} />,
    }));
  }, [activeLayers, mapMarkers]);

  const handleToggleLayer = (layerId) => {
    setActiveLayers((prev) => ({
      ...prev,
      [layerId]: !prev[layerId],
    }));
  };

  const loading = membersLoading || schoolsLoading || otherLoading;

  return (
    <div className="page-root flex-1 min-h-0 h-full gap-5 md:gap-6">
      <div className="shrink-0">
        <h1 className="text-xl font-bold text-white tracking-wide">Map</h1>
        <p className="text-sm text-slate-400 mt-1">
          View church members, schools, branches and ministries from one central map.
        </p>
      </div>

      <MapLayerControls activeLayers={activeLayers} onToggleLayer={handleToggleLayer} />

      <div className="relative flex-1 min-h-[320px] md:min-h-[480px] w-full rounded-xl border border-slate-700/70 overflow-hidden bg-slate-950 shadow-sm">
        {loading ? (
          <div className="flex h-full items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500" />
          </div>
        ) : (
          <LeafletMap
            center={MAP_DEFAULT_CENTER}
            zoom={MAP_DEFAULT_ZOOM}
            markers={visibleMarkers}
          />
        )}
      </div>
    </div>
  );
}
