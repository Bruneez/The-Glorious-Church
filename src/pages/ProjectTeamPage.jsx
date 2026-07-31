import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import ManageTeamModal from '@/components/features/projects/ManageTeamModal';
import ProjectDetailLoadingSkeleton from '@/components/features/projects/ProjectDetailLoadingSkeleton';
import ProjectTeam from '@/components/features/projects/ProjectTeam';
import { getProjectErrorMessage } from '@/config/projectsOptions';
import { useAuth } from '@/hooks/useAuth';
import { useProject } from '@/hooks/useProject';
import {
  approveMembershipRequest,
  assignProjectLeader,
  rejectMembershipRequest,
  removeMemberFromProject,
  transferProjectLeadership,
} from '@/services/projectMembershipService';
import {
  canManageProjectTeam,
  canTransferProjectLeadership,
  PROJECT_DENIED_MESSAGE,
} from '@/services/projectGuards';

function FeedbackBanner({ feedback, onDismiss }) {
  if (!feedback?.message) return null;

  const toneClass =
    feedback.type === 'success'
      ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
      : 'bg-rose-500/10 border border-rose-500/20 text-rose-400';

  return (
    <div className={`p-3 rounded-lg text-xs font-medium flex items-center justify-between gap-3 ${toneClass}`}>
      <span>{feedback.message}</span>
      <button type="button" onClick={onDismiss} className="text-current hover:opacity-80 shrink-0">
        Dismiss
      </button>
    </div>
  );
}

export default function ProjectTeamPage() {
  const { projectId = '' } = useParams();
  const [feedback, setFeedback] = useState({ type: '', message: '' });
  const [isManageOpen, setIsManageOpen] = useState(false);

  const { staffProfile, firebaseUser } = useAuth();
  const actorName = staffProfile?.fullName || staffProfile?.name || firebaseUser?.displayName || '';

  const {
    project,
    memberships,
    userMembership,
    loading,
    error,
    accessDenied,
    canView,
    canAccessProject,
    userId,
    role,
  } = useProject(projectId);

  const canManageTeam = useMemo(
    () => (project ? canManageProjectTeam(role, project, userId, userMembership) : false),
    [project, role, userId, userMembership],
  );

  const canTransferLeadership = useMemo(
    () => (project ? canTransferProjectLeadership(role, project, userId, userMembership) : false),
    [project, role, userId, userMembership],
  );

  const actorContext = {
    role,
    userId,
    actorMembership: userMembership,
    actorName,
    reviewerName: actorName,
  };

  const handleApproveRequest = async (membership) => {
    await approveMembershipRequest(membership.id, {
      ...actorContext,
      initialData: membership,
    });
    setFeedback({ type: 'success', message: 'Join request approved.' });
  };

  const handleRejectRequest = async (membership) => {
    await rejectMembershipRequest(membership.id, {
      ...actorContext,
      initialData: membership,
    });
    setFeedback({ type: 'success', message: 'Join request rejected.' });
  };

  const handleAssignLeader = async (membership) => {
    await assignProjectLeader(project.id, {
      ...actorContext,
      targetUserId: membership.userId,
      targetStaffId: membership.staffId,
      targetName: membership.memberName,
    });
    setFeedback({ type: 'success', message: 'Project leader assigned.' });
  };

  const handleTransferLeadership = async (membership) => {
    await transferProjectLeadership(project.id, {
      ...actorContext,
      targetMembershipId: membership.id,
    });
    setFeedback({ type: 'success', message: 'Project leadership transferred.' });
  };

  const handleRemoveMember = async (membership) => {
    await removeMemberFromProject(membership.id, actorContext);
    setFeedback({ type: 'success', message: 'Team member removed.' });
  };

  if (!canView) {
    return (
      <div className="page-root">
        <p role="alert" className="text-sm text-rose-400">
          You do not have permission to view Projects.
        </p>
      </div>
    );
  }

  return (
    <div className="page-root">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between min-w-0">
        <Link
          to={project?.id ? `/projects/${project.id}` : '/projects'}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-indigo-300 transition w-fit"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back to Project
        </Link>
      </div>

      <div className="mt-4 space-y-4 min-w-0">
        <FeedbackBanner feedback={feedback} onDismiss={() => setFeedback({ type: '', message: '' })} />

        {loading ? (
          <ProjectDetailLoadingSkeleton />
        ) : accessDenied ? (
          <p role="alert" className="text-sm text-rose-400">{PROJECT_DENIED_MESSAGE}</p>
        ) : error && !project ? (
          <p role="alert" className="text-sm text-rose-400">
            {getProjectErrorMessage(error, 'Project not found.')}
          </p>
        ) : !canAccessProject ? (
          <p role="alert" className="text-sm text-rose-400">{PROJECT_DENIED_MESSAGE}</p>
        ) : project ? (
          <div className="rounded-xl border border-slate-700/70 bg-slate-800/80 p-4 sm:p-5 min-w-0">
            <div className="mb-4">
              <h1 className="text-lg font-semibold text-white">{project.title}</h1>
              <p className="text-xs text-slate-400 mt-1">Team management</p>
            </div>

            <ProjectTeam
              project={project}
              memberships={memberships}
              canManageTeam={canManageTeam}
              onManageTeam={() => setIsManageOpen(true)}
            />
          </div>
        ) : (
          <p role="alert" className="text-sm text-rose-400">Project not found.</p>
        )}
      </div>

      <ManageTeamModal
        isOpen={isManageOpen}
        onClose={() => setIsManageOpen(false)}
        project={project}
        memberships={memberships}
        role={role}
        userId={userId}
        userMembership={userMembership}
        canManageTeam={canManageTeam}
        canTransferLeadership={canTransferLeadership}
        onApproveRequest={handleApproveRequest}
        onRejectRequest={handleRejectRequest}
        onAssignLeader={handleAssignLeader}
        onTransferLeadership={handleTransferLeadership}
        onRemoveMember={handleRemoveMember}
      />
    </div>
  );
}
