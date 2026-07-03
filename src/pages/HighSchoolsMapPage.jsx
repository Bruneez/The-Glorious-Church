import { useMemo } from 'react';
import { GraduationCap, MapPin } from 'lucide-react';
import LeafletMap from '@/components/features/maps/LeafletMap';
import MapPanel from '@/components/features/maps/MapPanel';
import { SCHOOLS_MAP_CENTER, SCHOOLS_MAP_ZOOM } from '@/config/mapConfig';
import { useSchools } from '@/services/schoolsService';
import { partitionSchoolsForMap } from '@/utils/mapMarkers';

function SchoolPopup({ school }) {
  return (
    <div className="p-1 min-w-[200px]">
      <h4 className="font-bold text-indigo-400 text-xs mb-0.5">{school.name}</h4>
      {school.address ? (
        <p className="text-[10px] text-slate-300 leading-relaxed">{school.address}</p>
      ) : null}
      {school.principal ? (
        <p className="text-[10px] text-slate-400 mt-1">Principal: {school.principal}</p>
      ) : null}
      <div className="mt-2 pt-1 border-t border-slate-700/60 text-[9px] text-slate-400 flex items-center gap-1">
        <GraduationCap className="w-3 h-3 text-emerald-400" />
        Cape Town Metro Region
      </div>
    </div>
  );
}

export default function HighSchoolsMapPage() {
  const { data: schools = [], loading } = useSchools('high');

  const { mapped, unmapped } = useMemo(
    () => partitionSchoolsForMap(schools),
    [schools],
  );

  const markers = useMemo(
    () =>
      mapped.map(({ school, coords }) => ({
        id: school.id,
        coords,
        popup: <SchoolPopup school={school} />,
      })),
    [mapped],
  );

  const badge = loading
    ? 'Loading schools…'
    : `${mapped.length} of ${schools.length} schools placed`;

  return (
    <div className="flex flex-col flex-1 min-h-0 h-full gap-4">
      <p className="text-[10px] text-slate-400 shrink-0">
        Targeting outreach networks across Belhar, Delft, and neighboring Cape Town districts
      </p>

      {unmapped.length > 0 && !loading ? (
        <div className="text-[10px] text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-md px-3 py-2 shrink-0">
          {unmapped.length} school{unmapped.length === 1 ? '' : 's'} need map coordinates — add
          lat/lng in Firestore or use a recognized school name.
        </div>
      ) : null}

      <MapPanel
        icon={MapPin}
        title="Local Institutional Markers"
        badge={badge}
        badgeClassName="text-emerald-400 bg-emerald-500/10 border border-emerald-500/20"
      >
        {loading ? (
          <div className="flex h-full items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500" />
          </div>
        ) : mapped.length === 0 ? (
          <div className="flex h-full items-center justify-center p-6 text-center">
            <p className="text-slate-500 text-xs">
              No high schools with map coordinates yet. Add schools in the High Schools roster or
              include lat/lng on campus records.
            </p>
          </div>
        ) : (
          <LeafletMap
            center={SCHOOLS_MAP_CENTER}
            zoom={SCHOOLS_MAP_ZOOM}
            markers={markers}
            fitBounds
          />
        )}
      </MapPanel>
    </div>
  );
}
