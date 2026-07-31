import { useEffect, useMemo, useState } from 'react';
import { Crown, UserMinus, UserPlus, Users } from 'lucide-react';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import {
  getActiveProjectTeamMembers,
  getPendingProjectMemberships,
  getProjectTeamRoleBadgeClass,
  getProjectTeamRoleLabel,
} from '@/config/projectsDisplay';
import { PROJECT_MEMBERSHIP_ROLE } from '@/config/projectsConstants';
import {
  canAssignProjectLeader,
  canRemoveMember,
  canTransferProjectLeadership,
} from '@/services/projectGuards';

function TeamMemberRow({
  project,
  membership,
  showAssign,
  showTransfer,
  showRemove,
  actionLoading,
  onAssignLeader,
  onTransferLeadership,
  onRemoveMember,
}) {
  const teamRoleLabel = getProjectTeamRoleLabel(project, membership);
  const badgeClass = getProjectTeamRoleBadgeClass(project, membership);

  return (
    <li className="flex flex-col gap-2 rounded-xl border border-slate-700/60 bg-slate-900/50 px-3.5 py-3 min-w-0 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3 min-w-0">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-500/10 border border-indigo-500/20">
          <Users className="h-4 w-4 text-indigo-400" aria-hidden="true" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium text-white truncate">
            {membership.memberName || 'Unknown member'}
          </p>
          <span className={`inline-flex mt-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold ${badgeClass}`}>
            {teamRoleLabel}
          </span>
        </div>
      </div>

      {(showAssign || showTransfer || showRemove) ? (
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {showAssign ? (
            <button
              type="button"
              disabled={actionLoading}
              onClick={() => onAssignLeader(membership)}
              className="inline-flex items-center gap-1 rounded-lg border border-sky-500/30 bg-sky-500/10 px-2.5 py-1.5 text-[10px] font-semibold text-sky-300 hover:bg-sky-500/20 disabled:opacity-50"
            >
              <Crown className="h-3 w-3" aria-hidden="true" />
              Assign Leader
            </button>
          ) : null}
          {showTransfer ? (
            <button
              type="button"
              disabled={actionLoading}
              onClick={() => onTransferLeadership(membership)}
              className="inline-flex items-center gap-1 rounded-lg border border-violet-500/30 bg-violet-500/10 px-2.5 py-1.5 text-[10px] font-semibold text-violet-300 hover:bg-violet-500/20 disabled:opacity-50"
            >
              <Crown className="h-3 w-3" aria-hidden="true" />
              Transfer Leadership
            </button>
          ) : null}
          {showRemove ? (
            <button
              type="button"
              disabled={actionLoading}
              onClick={() => onRemoveMember(membership)}
              className="inline-flex items-center gap-1 rounded-lg border border-rose-500/30 bg-rose-500/10 px-2.5 py-1.5 text-[10px] font-semibold text-rose-300 hover:bg-rose-500/20 disabled:opacity-50"
            >
              <UserMinus className="h-3 w-3" aria-hidden="true" />
              Remove
            </button>
          ) : null}
        </div>
      ) : null}
    </li>
  );
}

function PendingRequestRow({ membership, actionLoading, onApprove, onReject }) {
  return (
    <li className="flex flex-col gap-2 rounded-xl border border-amber-500/20 bg-amber-500/5 px-3.5 py-3 min-w-0 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <p className="text-sm font-medium text-white truncate">
          {membership.memberName || 'Unknown member'}
        </p>
        <p className="text-[11px] text-amber-300/80">Pending approval</p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <button
          type="button"
          disabled={actionLoading}
          onClick={() => onApprove(membership)}
          className="inline-flex items-center gap-1 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1.5 text-[10px] font-semibold text-emerald-300 hover:bg-emerald-500/20 disabled:opacity-50"
        >
          <UserPlus className="h-3 w-3" aria-hidden="true" />
          Approve
        </button>
        <button
          type="button"
          disabled={actionLoading}
          onClick={() => onReject(membership)}
          className="inline-flex items-center gap-1 rounded-lg border border-rose-500/30 bg-rose-500/10 px-2.5 py-1.5 text-[10px] font-semibold text-rose-300 hover:bg-rose-500/20 disabled:opacity-50"
        >
          Reject
        </button>
      </div>
    </li>
  );
}

export default function ManageTeamModal({
  isOpen,
  onClose,
  project,
  memberships = [],
  role,
  userId,
  userMembership,
  canManageTeam = false,
  canTransferLeadership = false,
  onApproveRequest,
  onRejectRequest,
  onAssignLeader,
  onTransferLeadership,
  onRemoveMember,
}) {
  const [actionLoading, setActionLoading] = useState(false);
  const [submitError, setSubmitError] = useState('');

  useEffect(() => {
    if (!isOpen) {
      setSubmitError('');
      setActionLoading(false);
    }
  }, [isOpen]);

  const activeMembers = useMemo(
    () => getActiveProjectTeamMembers(memberships),
    [memberships],
  );

  const pendingRequests = useMemo(
    () => getPendingProjectMemberships(memberships),
    [memberships],
  );

  const runAction = async (action) => {
    setActionLoading(true);
    setSubmitError('');

    try {
      await action();
    } catch (actionError) {
      setSubmitError(getProjectErrorMessage(actionError, 'Unable to update the project team.'));
    } finally {
      setActionLoading(false);
    }
  };

  const handleApprove = (membership) => {
    runAction(() => onApproveRequest(membership));
  };

  const handleReject = (membership) => {
    runAction(() => onRejectRequest(membership));
  };

  const handleAssignLeader = (membership) => {
    runAction(() => onAssignLeader(membership));
  };

  const handleTransferLeadership = (membership) => {
    runAction(() => onTransferLeadership(membership));
  };

  const handleRemoveMember = (membership) => {
    runAction(() => onRemoveMember(membership));
  };

  const memberCanAssign = (membership) => canAssignProjectLeader(role, project, userId, userMembership)
    && membership.userId !== project?.leaderUserId;

  const memberCanTransfer = (membership) => canTransferProjectLeadership(role, project, userId, userMembership)
    && membership.role !== PROJECT_MEMBERSHIP_ROLE.OWNER;

  const memberCanRemove = (membership) => canRemoveMember(role, project, userId, userMembership, membership);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Manage Team"
      icon={Users}
      maxWidth="max-w-lg"
      panelClassName="p-4 space-y-4 max-h-[80vh] overflow-y-auto"
      preventClose={actionLoading}
    >
      {submitError ? (
        <p role="alert" className="text-xs text-rose-400 font-medium">{submitError}</p>
      ) : null}

      {canManageTeam && pendingRequests.length ? (
        <section className="space-y-2">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-amber-300">
            Pending Requests ({pendingRequests.length})
          </h3>
          <ul className="space-y-2">
            {pendingRequests.map((membership) => (
              <PendingRequestRow
                key={membership.id}
                membership={membership}
                actionLoading={actionLoading}
                onApprove={handleApprove}
                onReject={handleReject}
              />
            ))}
          </ul>
        </section>
      ) : null}

      <section className="space-y-2">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-400">
          Active Team ({activeMembers.length})
        </h3>
        {activeMembers.length ? (
          <ul className="space-y-2">
            {activeMembers.map((membership) => (
              <TeamMemberRow
                key={membership.id}
                project={project}
                membership={membership}
                showAssign={canManageTeam && memberCanAssign(membership)}
                showTransfer={canTransferLeadership && memberCanTransfer(membership)}
                showRemove={canManageTeam && memberCanRemove(membership)}
                actionLoading={actionLoading}
                onAssignLeader={handleAssignLeader}
                onTransferLeadership={handleTransferLeadership}
                onRemoveMember={handleRemoveMember}
              />
            ))}
          </ul>
        ) : (
          <div className="rounded-xl border border-dashed border-slate-700/70 bg-slate-900/30 px-4 py-6 text-center">
            <p className="text-xs text-slate-500">No active team members yet.</p>
          </div>
        )}
      </section>

      <div className="flex justify-end pt-1">
        <Button type="button" variant="secondary" onClick={onClose} disabled={actionLoading}>
          Close
        </Button>
      </div>
    </Modal>
  );
}
