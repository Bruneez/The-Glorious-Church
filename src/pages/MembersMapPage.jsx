import { useMemo } from 'react';
import { Users } from 'lucide-react';
import LeafletMap from '@/components/features/maps/LeafletMap';
import MapPanel from '@/components/features/maps/MapPanel';
import { MEMBERS_MAP_CENTER, MEMBERS_MAP_ZOOM } from '@/config/mapConfig';
import { MEMBER_STATUS } from '@/config/memberOptions';
import { useMembers } from '@/services/membersService';
import { buildMemberHubData, countMappedMembers } from '@/utils/mapMarkers';

function MemberHubPopup({ hub }) {
  return (
    <div className="p-1 min-w-[180px]">
      <h4 className="font-bold text-emerald-400 text-xs mb-0.5">{hub.region}</h4>
      <p className="text-[10px] text-slate-300">
        Leader: <strong>{hub.lead}</strong>
      </p>
      <div className="mt-2 pt-1 border-t border-slate-700/60 flex justify-between items-center">
        <span className="bg-indigo-500/20 text-indigo-300 font-bold px-1.5 py-0.5 rounded text-[9px] font-mono">
          {hub.count} Active Member{hub.count === 1 ? '' : 's'}
        </span>
      </div>
    </div>
  );
}

export default function MembersMapPage() {
  const { data: members = [], loading } = useMembers({ status: MEMBER_STATUS.ACTIVE });

  const hubs = useMemo(() => buildMemberHubData(members), [members]);
  const mappedCount = useMemo(() => countMappedMembers(members), [members]);

  const markers = useMemo(
    () =>
      hubs.map((hub) => ({
        id: hub.region,
        coords: hub.coords,
        popup: <MemberHubPopup hub={hub} />,
      })),
    [hubs],
  );

  const badge = loading
    ? 'Loading members…'
    : `${hubs.length} Clusters · ${mappedCount} of ${members.length} mapped`;

  return (
    <div className="flex flex-col flex-1 min-h-0 h-full gap-4">
      <p className="text-[10px] text-slate-400 shrink-0">
        Visual mapping of active fellowship pockets across the Cape Peninsula
      </p>

      <MapPanel
        icon={Users}
        title="Active Fellowship Hubs"
        badge={badge}
        badgeClassName="text-indigo-400 bg-indigo-500/10 border border-indigo-500/20"
      >
        {loading ? (
          <div className="flex h-full items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500" />
          </div>
        ) : (
          <LeafletMap
            center={MEMBERS_MAP_CENTER}
            zoom={MEMBERS_MAP_ZOOM}
            markers={markers}
          />
        )}
      </MapPanel>
    </div>
  );
}
