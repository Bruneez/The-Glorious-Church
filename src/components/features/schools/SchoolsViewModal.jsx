import { useMemo } from 'react';
import { School } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import UserAvatar from '@/components/ui/UserAvatar';
import SchoolLinkedMembersTable, { SchoolStatusBadge } from '@/components/features/schools/SchoolLinkedMembersTable';
import {
  getMembersLinkedToSchool,
  getSchoolTypeLabel,
  mapLinkedMemberForDisplay,
} from '@/config/schoolsOptions';

function DetailField({ label, value, children }) {
  return (
    <div className="rounded-xl bg-slate-900/50 border border-slate-700/60 p-3.5">
      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{label}</p>
      <div className="text-sm font-medium text-white mt-1">{children ?? value}</div>
    </div>
  );
}

export default function SchoolsViewModal({ school, members = [], isOpen, onClose }) {
  const linkedMembers = useMemo(() => {
    if (!school) return [];
    return getMembersLinkedToSchool(members, school).map(mapLinkedMemberForDisplay);
  }, [members, school]);

  if (!school) return null;

  const logo = school.logo || school.photo || '';
  const linkedCount = linkedMembers.length;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="School Profile"
      icon={School}
      maxWidth="max-w-5xl"
    >
      <div className="space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 pb-4 border-b border-slate-700/70">
          <UserAvatar name={school.schoolName} photo={logo} size="xl" />
          <div className="min-w-0">
            <h3 className="text-lg font-bold text-white tracking-wide">{school.schoolName || '—'}</h3>
            <p className="text-sm text-indigo-400/90 mt-0.5">{getSchoolTypeLabel(school.schoolType)}</p>
            <div className="mt-2">
              <SchoolStatusBadge status={school.status} />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <DetailField label="School Name" value={school.schoolName || '—'} />
          <DetailField label="School Type" value={getSchoolTypeLabel(school.schoolType)} />
          <DetailField label="Total Members" value={linkedCount} />
          <DetailField label="Address" value={school.address || '—'} />
          <DetailField label="Status">
            <SchoolStatusBadge status={school.status} />
          </DetailField>
        </div>

        <div className="rounded-xl border border-slate-700/70 overflow-hidden">
          <div className="p-4 border-b border-slate-700/70 bg-slate-900/40">
            <h4 className="text-sm font-bold text-white tracking-wide">Linked Members</h4>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Members from the directory linked to this school by occupation and school details.
            </p>
          </div>

          <div className="p-4 overflow-x-auto">
            <SchoolLinkedMembersTable
              members={linkedMembers}
              emptyMessage="No members linked to this school."
            />
          </div>
        </div>

        <div className="flex justify-end pt-2 border-t border-slate-700">
          <Button type="button" variant="secondary" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
}
