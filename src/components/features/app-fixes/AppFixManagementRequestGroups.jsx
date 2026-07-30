import { useMemo, useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import AppFixRequestCard from '@/components/features/app-fixes/AppFixRequestCard';
import UserAvatar from '@/components/ui/UserAvatar';
import { APP_FIX_GROUP_MODES } from '@/config/appFixesConstants';
import { buildManagementRequestGroups } from '@/config/appFixesManagementOptions';

function ExpandableSection({
  title,
  subtitle,
  requestCount,
  openCount,
  avatarName,
  avatarPhoto,
  defaultOpen = false,
  stackChildren = false,
  children,
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const sectionId = `app-fix-group-${String(title || 'section').toLowerCase().replace(/\s+/g, '-')}`;

  return (
    <div className="rounded-xl border border-slate-700/70 bg-slate-900/30 overflow-hidden">
      <button
        type="button"
        onClick={() => setIsOpen((previous) => !previous)}
        aria-expanded={isOpen}
        aria-controls={sectionId}
        className="w-full flex items-center gap-3 p-4 text-left hover:bg-slate-900/60 transition"
      >
        {isOpen ? (
          <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
        ) : (
          <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
        )}

        {avatarName ? (
          <UserAvatar name={avatarName} photo={avatarPhoto || ''} size="sm" />
        ) : null}

        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-white truncate">{title}</p>
          {subtitle ? (
            <p className="text-[11px] text-slate-500 mt-0.5 truncate">{subtitle}</p>
          ) : null}
        </div>

        <div className="text-right shrink-0">
          <p className="text-xs text-slate-300">{requestCount} requests</p>
          <p className="text-[11px] text-slate-500">{openCount} open</p>
        </div>
      </button>

      {isOpen ? (
        <div
          id={sectionId}
          className={`px-4 pb-4 border-t border-slate-700/60 pt-4 ${
            stackChildren ? 'space-y-3' : 'grid grid-cols-1 lg:grid-cols-2 gap-4'
          }`}
        >
          {children}
        </div>
      ) : null}
    </div>
  );
}

export default function AppFixManagementRequestGroups({
  requests = [],
  groupMode,
  staffByUserId,
  onOpenRequest,
}) {
  const groups = useMemo(
    () => buildManagementRequestGroups(requests, groupMode, staffByUserId),
    [groupMode, requests, staffByUserId],
  );

  if (groupMode === APP_FIX_GROUP_MODES.ALL) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 min-w-0">
        {requests.map((request) => (
          <AppFixRequestCard key={request.id} request={request} onOpen={onOpenRequest} />
        ))}
      </div>
    );
  }

  if (groupMode === APP_FIX_GROUP_MODES.USER_GROUPS) {
    return (
      <div className="space-y-4 min-w-0">
        {groups.map((group) => (
          <ExpandableSection
            key={group.key}
            title={group.label}
            subtitle="Role group"
            requestCount={group.requestCount}
            openCount={group.openCount}
            stackChildren
          >
            {group.users?.map((userGroup) => (
              <ExpandableSection
                key={userGroup.key}
                title={userGroup.name}
                subtitle={userGroup.role}
                requestCount={userGroup.requests.length}
                openCount={userGroup.openCount}
                avatarName={userGroup.name}
                avatarPhoto={userGroup.photo}
              >
                {userGroup.requests.map((request) => (
                  <AppFixRequestCard key={request.id} request={request} onOpen={onOpenRequest} />
                ))}
              </ExpandableSection>
            ))}
          </ExpandableSection>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4 min-w-0">
      {groups.map((group) => (
        <ExpandableSection
          key={group.key}
          title={group.label}
          subtitle={group.subtitle}
          requestCount={group.requestCount}
          openCount={group.openCount}
          avatarName={group.avatarName}
          avatarPhoto={group.avatarPhoto}
        >
          {group.requests.map((request) => (
            <AppFixRequestCard key={request.id} request={request} onOpen={onOpenRequest} />
          ))}
        </ExpandableSection>
      ))}
    </div>
  );
}
