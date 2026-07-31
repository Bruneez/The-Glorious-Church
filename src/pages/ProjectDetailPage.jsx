import { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Edit2, Trash2 } from 'lucide-react';
import EditProjectModal from '@/components/features/projects/EditProjectModal';
import ManageTeamModal from '@/components/features/projects/ManageTeamModal';
import ProjectDeleteModal from '@/components/features/projects/ProjectDeleteModal';
import FeedbackToast from '@/components/ui/FeedbackToast';
import ProjectAttachments from '@/components/features/projects/ProjectAttachments';
import ProjectDetailLoadingSkeleton from '@/components/features/projects/ProjectDetailLoadingSkeleton';
import ProjectInformation from '@/components/features/projects/ProjectInformation';
import ProjectObjectives from '@/components/features/projects/ProjectObjectives';
import ProjectOverview from '@/components/features/projects/ProjectOverview';
import ProjectProgress from '@/components/features/projects/ProjectProgress';
import ProjectTeam from '@/components/features/projects/ProjectTeam';
import ProjectUpdates from '@/components/features/projects/ProjectUpdates';
import { COLLECTIONS } from '@/config/collections';
import { getProjectErrorMessage } from '@/config/projectsOptions';
import { useCollection } from '@/hooks/useFirestore';
import { useAuth } from '@/hooks/useAuth';
import { useProject } from '@/hooks/useProject';
import { useRoleAccess } from '@/hooks/useRoleAccess';
import {
  approveMembershipRequest,
  assignProjectLeader,
  cancelJoinRequest,
  joinProject,
  leaveProject,
  rejectMembershipRequest,
  removeMemberFromProject,
  requestToJoinProject,
  transferProjectLeadership,
} from '@/services/projectMembershipService';
import {
  canAddProjectUpdate,
  canDeleteProject,
  canManageProject,
  canManageProjectTeam,
  canTransferProjectLeadership,
  canUpdateProgress,
  canUploadAttachments,
  PROJECT_DENIED_MESSAGE,
} from '@/services/projectGuards';
import {
  deleteProjectAttachmentRecord,
  uploadAttachmentForProject,
} from '@/services/projectAttachmentService';
import { createProjectComment, updateProjectComment } from '@/services/projectUpdateService';
import {
  changeProjectProgress,
  changeProjectStatus,
  deleteProject,
  updateProject,
} from '@/services/projectsService';

function ProjectDetailErrorState({ message, backHref = '/projects' }) {
  return (
    <div className="rounded-xl border border-rose-500/20 bg-rose-950/30 p-5 space-y-4">
      <p role="alert" className="text-sm text-rose-400">{message}</p>
      <Link
        to={backHref}
        className="inline-flex items-center gap-2 text-xs font-semibold text-indigo-400 hover:text-indigo-300"
      >
        <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
        Back to Projects
      </Link>
    </div>
  );
}

export default function ProjectDetailPage() {
  const navigate = useNavigate();
  const { projectId = '' } = useParams();
  const [feedback, setFeedback] = useState({ type: '', message: '' });
  const [membershipActionLoading, setMembershipActionLoading] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isManageTeamOpen, setIsManageTeamOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const { staffProfile, firebaseUser, staffDocId } = useAuth();
  const { role } = useRoleAccess();
  const { data: staff = [] } = useCollection(COLLECTIONS.STAFF);

  const {
    project,
    memberships,
    updates,
    attachments,
    userMembership,
    loading,
    error,
    accessDenied,
    canView,
    userId,
  } = useProject(projectId);

  const createdByName = staffProfile?.fullName
    || staffProfile?.name
    || firebaseUser?.displayName
    || '';

  const canEdit = useMemo(
    () => (project ? canManageProject(role, project, userId) : false),
    [project, role, userId],
  );

  const canDelete = useMemo(
    () => (project ? canDeleteProject(role, project, userId) : false),
    [project, role, userId],
  );

  const canPostUpdate = useMemo(
    () => (project ? canAddProjectUpdate(role, project, userId, userMembership) : false),
    [project, role, userId, userMembership],
  );

  const canManageProgress = useMemo(
    () => (project ? canUpdateProgress(role, project, userId, userMembership) : false),
    [project, role, userId, userMembership],
  );

  const canUploadAttachmentFiles = useMemo(
    () => (project ? canUploadAttachments(role, project, userId, userMembership) : false),
    [project, role, userId, userMembership],
  );

  const canManageTeam = useMemo(
    () => (project ? canManageProjectTeam(role, project, userId, userMembership) : false),
    [project, role, userId, userMembership],
  );

  const canTransferLeadership = useMemo(
    () => (project ? canTransferProjectLeadership(role, project, userId, userMembership) : false),
    [project, role, userId, userMembership],
  );

  const teamActorContext = useMemo(() => ({
    role,
    userId,
    actorMembership: userMembership,
    actorName: createdByName,
    reviewerName: createdByName,
  }), [role, userId, userMembership, createdByName]);

  const showFeedback = (type, message) => {
    setFeedback({ type, message });
  };

  const runAction = async (action, {
    successMessage = '',
    errorMessage = 'Unable to complete this action.',
  } = {}) => {
    try {
      await action();
      if (successMessage) {
        showFeedback('success', successMessage);
      }
    } catch (actionError) {
      showFeedback('error', getProjectErrorMessage(actionError, errorMessage));
    }
  };

  const handleMembershipAction = async (targetProject, tileState) => {
    if (!targetProject?.id || !tileState?.action || !userId) return;

    setMembershipActionLoading(true);

    try {
      const memberContext = {
        role,
        userId,
        staffId: staffDocId || '',
        memberName: createdByName,
        currentUserId: userId,
      };

      if (tileState.action === 'join') {
        await joinProject(targetProject.id, memberContext);
        showFeedback('success', 'You joined the project.');
      } else if (tileState.action === 'request') {
        await requestToJoinProject(targetProject.id, memberContext);
        showFeedback('success', 'Your join request was submitted for approval.');
      } else if (tileState.action === 'leave') {
        if (!targetProject.membership?.id) {
          throw new Error('Membership not found.');
        }
        await leaveProject(targetProject.membership.id, {
          role,
          userId,
          initialData: targetProject.membership,
        });
        showFeedback('success', 'You left the project.');
      } else if (tileState.action === 'cancel') {
        if (!targetProject.membership?.id) {
          throw new Error('Join request not found.');
        }
        await cancelJoinRequest(targetProject.membership.id, {
          role,
          userId,
          initialData: targetProject.membership,
        });
        showFeedback('success', 'Your join request was cancelled.');
      }
    } catch (actionError) {
      showFeedback('error', getProjectErrorMessage(actionError, 'Unable to update project membership.'));
    } finally {
      setMembershipActionLoading(false);
    }
  };

  const handleEditSubmit = async ({ formData, coverFile, removeCover }) => {
    if (!project?.id) return;

    await runAction(async () => {
      if (!canManageProject(role, project, userId)) {
        throw new Error('You do not have permission to edit this project.');
      }

      await updateProject(project.id, { ...formData, removeCover }, {
        role,
        userId,
        initialData: project,
        coverFile,
      });
    }, {
      successMessage: 'Project updated successfully.',
      errorMessage: 'Unable to update this project.',
    });
  };

  const handleDeleteConfirm = async () => {
    if (!project?.id) return;

    setIsDeleting(true);

    try {
      const result = await deleteProject(project.id, {
        role,
        userId,
        initialData: project,
      });

      setIsDeleteOpen(false);

      if (result.storageWarnings?.length) {
        showFeedback('warning', result.storageWarnings[0]);
      }

      navigate('/projects', {
        replace: true,
        state: {
          feedback: {
            type: result.storageWarnings?.length ? 'warning' : 'success',
            message: result.storageWarnings?.length
              ? result.storageWarnings[0]
              : 'Project deleted successfully.',
          },
        },
      });
    } catch (deleteError) {
      showFeedback('error', getProjectErrorMessage(deleteError, 'Unable to delete this project.'));
    } finally {
      setIsDeleting(false);
    }
  };

  const handleAddUpdate = async ({ message, attachmentFile, onAttachmentProgress }) => {
    if (!project?.id) return;

    await runAction(async () => {
      if (message) {
        await createProjectComment(project.id, message, {
          role,
          userId,
          memberName: createdByName,
          membership: userMembership,
        });
      }

      if (attachmentFile) {
        await uploadAttachmentForProject(project.id, attachmentFile, {
          role,
          userId,
          membership: userMembership,
          onProgress: onAttachmentProgress,
        });
      }
    }, {
      successMessage: message && attachmentFile
        ? 'Update and attachment posted successfully.'
        : attachmentFile
          ? 'Attachment uploaded successfully.'
          : 'Update posted successfully.',
      errorMessage: 'Unable to post this update.',
    });
  };

  const handleUploadAttachment = async (file, onProgress) => {
    if (!project?.id) return;

    await runAction(async () => {
      await uploadAttachmentForProject(project.id, file, {
        role,
        userId,
        membership: userMembership,
        onProgress,
      });
    }, {
      successMessage: 'Attachment uploaded successfully.',
      errorMessage: 'Unable to upload this attachment.',
    });
  };

  const handleDeleteAttachment = async (attachment) => {
    if (!attachment?.id) return;

    try {
      const result = await deleteProjectAttachmentRecord(attachment.id, {
        role,
        userId,
        initialData: attachment,
        membership: userMembership,
      });

      if (result.storageWarning) {
        showFeedback('warning', result.storageWarning);
        return;
      }

      showFeedback('success', 'Attachment deleted.');
    } catch (deleteError) {
      showFeedback('error', getProjectErrorMessage(deleteError, 'Unable to delete this attachment.'));
    }
  };

  const handleEditComment = async (updateId, message) => {
    await runAction(
      () => updateProjectComment(updateId, message, { role, userId }),
      { successMessage: 'Update saved.', errorMessage: 'Unable to save this update.' },
    );
  };

  const handleSaveProgress = async (progress) => {
    if (!project?.id) return;

    await runAction(
      () => changeProjectProgress(project.id, progress, {
        role,
        userId,
        memberName: createdByName,
        membership: userMembership,
        initialData: project,
      }),
      { successMessage: 'Project progress updated.', errorMessage: 'Unable to update progress.' },
    );
  };

  const handleSaveStatus = async (status) => {
    if (!project?.id) return;

    await runAction(
      () => changeProjectStatus(project.id, status, {
        role,
        userId,
        memberName: createdByName,
        membership: userMembership,
        initialData: project,
      }),
      { successMessage: 'Project status updated.', errorMessage: 'Unable to update status.' },
    );
  };

  const handleApproveRequest = async (membership) => {
    await runAction(
      () => approveMembershipRequest(membership.id, {
        ...teamActorContext,
        initialData: membership,
      }),
      { successMessage: 'Join request approved.', errorMessage: 'Unable to approve this request.' },
    );
  };

  const handleRejectRequest = async (membership) => {
    await runAction(
      () => rejectMembershipRequest(membership.id, {
        ...teamActorContext,
        initialData: membership,
      }),
      { successMessage: 'Join request rejected.', errorMessage: 'Unable to reject this request.' },
    );
  };

  const handleAssignLeader = async (membership) => {
    if (!project?.id) return;

    await runAction(
      () => assignProjectLeader(project.id, {
        ...teamActorContext,
        targetUserId: membership.userId,
        targetStaffId: membership.staffId,
        targetName: membership.memberName,
      }),
      { successMessage: 'Project leader assigned.', errorMessage: 'Unable to assign leader.' },
    );
  };

  const handleTransferLeadership = async (membership) => {
    if (!project?.id) return;

    await runAction(
      () => transferProjectLeadership(project.id, {
        ...teamActorContext,
        targetMembershipId: membership.id,
      }),
      { successMessage: 'Project leadership transferred.', errorMessage: 'Unable to transfer leadership.' },
    );
  };

  const handleRemoveMember = async (membership) => {
    await runAction(
      () => removeMemberFromProject(membership.id, teamActorContext),
      { successMessage: 'Team member removed.', errorMessage: 'Unable to remove this member.' },
    );
  };

  if (!canView) {
    return (
      <div className="page-root">
        <ProjectDetailErrorState message="You do not have permission to view Projects." />
      </div>
    );
  }

  return (
    <div className="page-root">
      <FeedbackToast
        feedback={feedback}
        onDismiss={() => setFeedback({ type: '', message: '' })}
        fixed
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between min-w-0">
        <Link
          to="/projects"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-indigo-300 transition w-fit"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back to Projects
        </Link>

        {project && (canEdit || canDelete) ? (
          <div className="flex flex-wrap items-center gap-2 self-start">
            {canEdit ? (
              <button
                type="button"
                onClick={() => setIsEditOpen(true)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-indigo-500/30 bg-indigo-500/10 px-3 py-2 text-xs font-semibold text-indigo-300 hover:bg-indigo-500/20 transition"
              >
                <Edit2 className="h-3.5 w-3.5" aria-hidden="true" />
                Edit Project
              </button>
            ) : null}
            {canDelete ? (
              <button
                type="button"
                onClick={() => setIsDeleteOpen(true)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-xs font-semibold text-rose-300 hover:bg-rose-500/20 transition"
              >
                <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                Delete Project
              </button>
            ) : null}
          </div>
        ) : null}
      </div>

      <div className="mt-4 space-y-4 min-w-0">
        {loading ? (
          <ProjectDetailLoadingSkeleton />
        ) : accessDenied ? (
          <ProjectDetailErrorState message={PROJECT_DENIED_MESSAGE} />
        ) : error && !project ? (
          <ProjectDetailErrorState message={getProjectErrorMessage(error, 'Project not found.')} />
        ) : project ? (
          <div className="space-y-4 min-w-0">
            <ProjectOverview
              project={project}
              membershipActionLoading={membershipActionLoading}
              onMembershipAction={handleMembershipAction}
            />

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 min-w-0">
              <div className="xl:col-span-2 space-y-4 min-w-0">
                <div className="rounded-xl border border-slate-700/70 bg-slate-800/80 p-4 sm:p-5 space-y-5 min-w-0">
                  <ProjectInformation project={project} />
                  <ProjectObjectives project={project} />
                  <ProjectUpdates
                    updates={updates}
                    attachments={attachments}
                    userId={userId}
                    canAddUpdate={canPostUpdate}
                    onAddUpdate={handleAddUpdate}
                    onEditComment={handleEditComment}
                  />
                  <ProjectAttachments
                    project={project}
                    attachments={attachments}
                    userId={userId}
                    role={role}
                    membership={userMembership}
                    canUpload={canUploadAttachmentFiles}
                    onUpload={handleUploadAttachment}
                    onDelete={handleDeleteAttachment}
                  />
                </div>
              </div>

              <div className="space-y-4 min-w-0">
                <div className="rounded-xl border border-slate-700/70 bg-slate-800/80 p-4 sm:p-5 min-w-0">
                  <ProjectProgress
                    project={project}
                    canManageProgress={canManageProgress}
                    onSaveProgress={handleSaveProgress}
                    onSaveStatus={handleSaveStatus}
                  />
                </div>

                <div className="rounded-xl border border-slate-700/70 bg-slate-800/80 p-4 sm:p-5 min-w-0">
                  <ProjectTeam
                    project={project}
                    memberships={memberships}
                    canManageTeam={canManageTeam}
                    onManageTeam={() => setIsManageTeamOpen(true)}
                  />
                </div>
              </div>
            </div>
          </div>
        ) : (
          <ProjectDetailErrorState message="Project not found." />
        )}
      </div>

      <EditProjectModal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        onSubmit={handleEditSubmit}
        project={project}
        staff={staff}
      />

      <ManageTeamModal
        isOpen={isManageTeamOpen}
        onClose={() => setIsManageTeamOpen(false)}
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

      <ProjectDeleteModal
        project={project}
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDeleteConfirm}
        isDeleting={isDeleting}
      />
    </div>
  );
}
