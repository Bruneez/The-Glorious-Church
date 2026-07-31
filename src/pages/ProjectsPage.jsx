import { useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Plus } from 'lucide-react';
import Button from '@/components/ui/Button';
import FeedbackToast from '@/components/ui/FeedbackToast';
import CreateProjectModal from '@/components/features/projects/CreateProjectModal';
import EditProjectModal from '@/components/features/projects/EditProjectModal';
import ProjectDeleteModal from '@/components/features/projects/ProjectDeleteModal';
import ProjectsGrid from '@/components/features/projects/ProjectsGrid';
import ProjectsSearchFilters, { ProjectsLoadErrorState } from '@/components/features/projects/ProjectsSearchFilters';
import ProjectsSummaryCards from '@/components/features/projects/ProjectsSummaryCards';
import { COLLECTIONS } from '@/config/collections';
import {
  PROJECTS_CREATE_BUTTON_LABEL,
  PROJECTS_PAGE_SUBTITLE,
  PROJECTS_PAGE_TITLE,
} from '@/config/projectsOptions';
import { filterProjectsForDashboard } from '@/config/projectsDisplay';
import { getProjectErrorMessage } from '@/config/projectsOptions';
import { useCollection } from '@/hooks/useFirestore';
import { useAuth } from '@/hooks/useAuth';
import { useProjects } from '@/hooks/useProjects';
import { useRoleAccess } from '@/hooks/useRoleAccess';
import {
  cancelJoinRequest,
  joinProject,
  leaveProject,
  requestToJoinProject,
} from '@/services/projectMembershipService';
import { canDeleteProject, canManageProject, canCreateProject } from '@/services/projectGuards';
import { createProject, deleteProject, updateProject } from '@/services/projectsService';

function ProjectsErrorState({ message }) {
  return (
    <div
      role="alert"
      className="rounded-xl border border-rose-500/20 bg-rose-950/30 p-4 text-xs text-rose-400"
    >
      {message}
    </div>
  );
}

export default function ProjectsPage() {
  const location = useLocation();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [sortBy, setSortBy] = useState('updated-desc');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [deletingProject, setDeletingProject] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [feedback, setFeedback] = useState(() => location.state?.feedback || { type: '', message: '' });
  const [membershipActionProjectId, setMembershipActionProjectId] = useState('');
  const [reloadNonce, setReloadNonce] = useState(0);

  const { staffProfile, firebaseUser, staffDocId } = useAuth();
  const { role, canPerformAction } = useRoleAccess();
  const { data: staff = [] } = useCollection(COLLECTIONS.STAFF);

  const {
    data: projects = [],
    memberships = [],
    loading,
    error,
    canView,
    userId,
  } = useProjects({ reloadNonce });

  const canCreate = canPerformAction('CREATE_PROJECTS');

  const createdByName = staffProfile?.fullName
    || staffProfile?.name
    || firebaseUser?.displayName
    || '';

  const filteredProjects = useMemo(
    () => filterProjectsForDashboard(projects, {
      searchTerm,
      statusFilter,
      priorityFilter,
      sortBy,
    }),
    [projects, searchTerm, statusFilter, priorityFilter, sortBy],
  );

  const hasActiveFilters = Boolean(
    searchTerm.trim() || statusFilter !== 'all' || priorityFilter !== 'all',
  );

  const showFeedback = (type, message) => {
    setFeedback({ type, message });
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setPriorityFilter('all');
    setSortBy('updated-desc');
  };

  const handleCreateSubmit = async ({ formData, coverFile }) => {
    if (!canCreateProject(role)) {
      throw new Error('You do not have permission to create projects.');
    }

    await createProject(formData, {
      role,
      createdByUserId: userId,
      createdByStaffId: staffDocId || '',
      createdByName,
      coverFile,
    });

    showFeedback('success', 'Project created successfully.');
  };

  const handleEditSubmit = async ({ formData, coverFile, removeCover }) => {
    if (!editingProject?.id) return;

    if (!canManageProject(role, editingProject, userId)) {
      throw new Error('You do not have permission to edit this project.');
    }

    await updateProject(editingProject.id, { ...formData, removeCover }, {
      role,
      userId,
      initialData: editingProject,
      coverFile,
    });

    showFeedback('success', 'Project updated successfully.');
  };

  const handleDeleteConfirm = async (project) => {
    if (!project?.id) return;

    setIsDeleting(true);

    try {
      const result = await deleteProject(project.id, {
        role,
        userId,
        initialData: project,
      });

      setDeletingProject(null);

      if (result.storageWarnings?.length) {
        showFeedback('warning', result.storageWarnings[0]);
      } else {
        showFeedback('success', 'Project deleted successfully.');
      }
    } catch (deleteError) {
      showFeedback('error', getProjectErrorMessage(deleteError, 'Unable to delete this project.'));
    } finally {
      setIsDeleting(false);
    }
  };

  const canEditProject = (project) => canManageProject(role, project, userId);
  const canDeleteProjectForUser = (project) => canDeleteProject(role, project, userId);

  const handleMembershipAction = async (project, tileState) => {
    if (!project?.id || !tileState?.action || !userId) return;

    setMembershipActionProjectId(project.id);

    try {
      const memberContext = {
        role,
        userId,
        staffId: staffDocId || '',
        memberName: createdByName,
        currentUserId: userId,
      };

      if (tileState.action === 'join') {
        await joinProject(project.id, memberContext);
        showFeedback('success', 'You joined the project.');
      } else if (tileState.action === 'request') {
        await requestToJoinProject(project.id, memberContext);
        showFeedback('success', 'Your join request was submitted for approval.');
      } else if (tileState.action === 'leave') {
        if (!project.membership?.id) {
          throw new Error('Membership not found.');
        }
        await leaveProject(project.membership.id, {
          role,
          userId,
          initialData: project.membership,
        });
        showFeedback('success', 'You left the project.');
      } else if (tileState.action === 'cancel') {
        if (!project.membership?.id) {
          throw new Error('Join request not found.');
        }
        await cancelJoinRequest(project.membership.id, {
          role,
          userId,
          initialData: project.membership,
        });
        showFeedback('success', 'Your join request was cancelled.');
      }
    } catch (actionError) {
      showFeedback('error', getProjectErrorMessage(actionError, 'Unable to update project membership.'));
    } finally {
      setMembershipActionProjectId('');
    }
  };

  return (
    <div className="page-root">
      <FeedbackToast
        feedback={feedback}
        onDismiss={() => setFeedback({ type: '', message: '' })}
        fixed
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between min-w-0">
        <div className="min-w-0">
          <h1 className="text-xl font-bold text-white tracking-wide">{PROJECTS_PAGE_TITLE}</h1>
          <p className="text-sm text-slate-400 mt-1 max-w-2xl">
            {PROJECTS_PAGE_SUBTITLE}
          </p>
        </div>

        {canCreate ? (
          <Button icon={Plus} onClick={() => setIsCreateOpen(true)} className="shrink-0">
            {PROJECTS_CREATE_BUTTON_LABEL.replace('First ', '')}
          </Button>
        ) : null}
      </div>

      <div className="mt-4 space-y-4 min-w-0">
        <ProjectsSummaryCards
          projects={projects}
          memberships={memberships}
          userId={userId}
          loading={loading}
        />

        <div className="bg-slate-800 rounded-xl border border-slate-700/70 overflow-hidden shadow-sm min-w-0">
          <div className="p-4 space-y-4 min-w-0">
            <ProjectsSearchFilters
              searchTerm={searchTerm}
              statusFilter={statusFilter}
              priorityFilter={priorityFilter}
              sortBy={sortBy}
              resultCount={filteredProjects.length}
              totalCount={projects.length}
              hasActiveFilters={hasActiveFilters}
              onSearchTermChange={setSearchTerm}
              onStatusFilterChange={setStatusFilter}
              onPriorityFilterChange={setPriorityFilter}
              onSortByChange={setSortBy}
              onClearFilters={handleClearFilters}
            />

            {!canView ? (
              <ProjectsErrorState message="You do not have permission to view Projects." />
            ) : error ? (
              <ProjectsLoadErrorState
                message="Failed to load projects. Please try again."
                onRetry={() => setReloadNonce((value) => value + 1)}
              />
            ) : (
              <ProjectsGrid
                projects={filteredProjects}
                loading={loading}
                hasFilters={hasActiveFilters}
                canCreateProject={canCreate}
                onCreateProject={() => setIsCreateOpen(true)}
                canEditProject={canEditProject}
                onEditProject={setEditingProject}
                canDeleteProject={canDeleteProjectForUser}
                onDeleteProject={setDeletingProject}
                membershipActionProjectId={membershipActionProjectId}
                onMembershipAction={handleMembershipAction}
              />
            )}
          </div>
        </div>
      </div>

      <CreateProjectModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSubmit={handleCreateSubmit}
        staff={staff}
      />

      <EditProjectModal
        isOpen={Boolean(editingProject)}
        onClose={() => setEditingProject(null)}
        onSubmit={handleEditSubmit}
        project={editingProject}
        staff={staff}
      />

      <ProjectDeleteModal
        project={deletingProject}
        isOpen={Boolean(deletingProject)}
        onClose={() => setDeletingProject(null)}
        onConfirm={handleDeleteConfirm}
        isDeleting={isDeleting}
      />
    </div>
  );
}
