import { useCallback, useMemo, useState } from 'react';
import { Plus, Users } from 'lucide-react';
import Button from '@/components/ui/Button';
import TaskSummaryCards from '@/components/features/tasks/TaskSummaryCards';
import TaskEmptyState from '@/components/features/tasks/TaskEmptyState';
import TaskFilters from '@/components/features/tasks/TaskFilters';
import TaskAssigneeCardGrid from '@/components/features/tasks/TaskAssigneeCardGrid';
import UserTasksModal from '@/components/features/tasks/UserTasksModal';
import TaskDetailsModal from '@/components/features/tasks/TaskDetailsModal';
import TaskForm from '@/components/features/tasks/TaskForm';
import TaskDeleteModal from '@/components/features/tasks/TaskDeleteModal';
import RemoveFromTasksModal from '@/components/features/tasks/RemoveFromTasksModal';
import ExcludedTaskUsersModal from '@/components/features/tasks/ExcludedTaskUsersModal';
import {
  useTasks,
  createTask,
  updateTask,
  updateTaskStatus,
  deleteTask,
  reassignActiveTasks,
  archiveActiveTasks,
} from '@/services/tasksService';
import { excludeStaffFromTasksModule, restoreStaffToTasksModule } from '@/services/staffService';
import { useCollection } from '@/hooks/useFirestore';
import { COLLECTIONS } from '@/config/collections';
import {
  buildStaffWorkloadOverview,
  canViewAssigneeTasks,
  getActiveTasksForAssignee,
  getTasksModuleExcludedStaff,
  isTaskAssignedToCurrentUser,
} from '@/config/tasksOptions';
import { useAuth } from '@/hooks/useAuth';
import { useRoleAccess } from '@/hooks/useRoleAccess';

function FeedbackBanner({ feedback, onDismiss }) {
  if (!feedback?.message) return null;

  const isSuccess = feedback.type === 'success';

  return (
    <div
      className={`p-3 rounded-lg text-xs font-medium flex items-center justify-between gap-3 ${
        isSuccess
          ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
          : 'bg-rose-500/10 border border-rose-500/20 text-rose-400'
      }`}
    >
      <span>{feedback.message}</span>
      <button type="button" onClick={onDismiss} className="text-current hover:opacity-80 shrink-0">
        Dismiss
      </button>
    </div>
  );
}

export default function TasksPage() {
  const { data: tasks = [], loading, error } = useTasks();
  const { data: staff = [] } = useCollection(COLLECTIONS.STAFF);
  const { staffProfile, firebaseUser, staffDocId } = useAuth();
  const { canPerformAction, role } = useRoleAccess();

  const canManageTasks = canPerformAction('MANAGE_TASKS');
  const canViewAllTasks = canPerformAction('VIEW_ALL_TASKS');
  const canUpdateOwnTaskStatus = canPerformAction('UPDATE_OWN_TASK_STATUS');

  const [searchTerm, setSearchTerm] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [deletingTask, setDeletingTask] = useState(null);
  const [selectedAssignee, setSelectedAssignee] = useState(null);
  const [viewingTask, setViewingTask] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [removingAssignee, setRemovingAssignee] = useState(null);
  const [isRemovingFromTasks, setIsRemovingFromTasks] = useState(false);
  const [isExcludedUsersOpen, setIsExcludedUsersOpen] = useState(false);
  const [isRestoringToTasks, setIsRestoringToTasks] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  const userContext = useMemo(
    () => ({ staffDocId, staffProfile, firebaseUser }),
    [staffDocId, staffProfile, firebaseUser],
  );

  const assigneeGroups = useMemo(
    () => buildStaffWorkloadOverview(staff, tasks, searchTerm),
    [staff, tasks, searchTerm],
  );

  const excludedStaff = useMemo(() => getTasksModuleExcludedStaff(staff), [staff]);

  const hasSearchTerm = searchTerm.trim() !== '';

  const createdBy = staffDocId || firebaseUser?.uid || '';
  const createdByName =
    staffProfile?.fullName ||
    staffProfile?.name ||
    firebaseUser?.displayName ||
    firebaseUser?.email ||
    'Admin';

  const canViewAssignee = useCallback(
    (assignee) => canViewAssigneeTasks(assignee, userContext, { canViewAll: canViewAllTasks }),
    [userContext, canViewAllTasks],
  );

  const authorizedSelectedAssignee = useMemo(() => {
    if (!selectedAssignee || !canViewAssignee(selectedAssignee)) {
      return null;
    }

    return selectedAssignee;
  }, [selectedAssignee, canViewAssignee]);

  const canUpdateTaskStatus = (task) => {
    if (canManageTasks) return true;
    if (!canUpdateOwnTaskStatus) return false;
    return isTaskAssignedToCurrentUser(task, userContext);
  };

  const showFeedback = (type, message) => {
    setFeedback({ type, message });
  };

  const handleAddTask = () => {
    setEditingTask(null);
    setIsFormOpen(true);
  };

  const handleEditTask = (task) => {
    if (!canManageTasks) return;

    setViewingTask(null);
    setSelectedAssignee(null);
    setEditingTask(task);
    setIsFormOpen(true);
  };

  const handleDeletePrompt = (task) => {
    if (!canManageTasks) return;

    setViewingTask(null);
    setDeletingTask(task);
  };

  const handleFormSubmit = async (formData) => {
    if (!canManageTasks) {
      throw new Error('You do not have permission to manage tasks.');
    }

    try {
      if (editingTask) {
        await updateTask(editingTask.id, formData, { previousTask: editingTask });
        showFeedback('success', 'Task updated successfully.');
      } else {
        await createTask(formData, { createdBy, createdByName });
        showFeedback('success', 'Task created successfully.');
      }

      setIsFormOpen(false);
      setEditingTask(null);
    } catch (submitError) {
      console.error('Error saving task:', submitError);
      throw submitError;
    }
  };

  const handleStatusUpdate = async (task, status) => {
    if (!canUpdateTaskStatus(task)) {
      throw new Error('You can only update status on tasks assigned to you.');
    }

    await updateTaskStatus(task.id, status);
    showFeedback('success', 'Task status updated successfully.');
    setViewingTask((current) =>
      current?.id === task.id ? { ...current, status } : current,
    );
  };

  const handleDeleteConfirm = async (task) => {
    if (!canManageTasks) return;

    setIsDeleting(true);

    try {
      await deleteTask(task.id);
      showFeedback('success', 'Task deleted successfully.');
      setDeletingTask(null);
      setViewingTask(null);
      setSelectedAssignee(null);
    } catch (deleteError) {
      console.error('Error deleting task:', deleteError);
      showFeedback('error', 'Failed to delete task. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSelectAssignee = (assignee) => {
    if (!canViewAssignee(assignee)) {
      showFeedback('error', 'You can only view your own assigned tasks.');
      return;
    }

    setSelectedAssignee(assignee);
  };

  const handleTaskClick = (task) => {
    if (!canViewAllTasks && !isTaskAssignedToCurrentUser(task, userContext)) {
      showFeedback('error', 'You can only view your own assigned tasks.');
      return;
    }

    setViewingTask(task);
  };

  const handleRemoveFromTasksPrompt = (assignee) => {
    if (!canManageTasks || assignee.key === 'unassigned') return;
    setRemovingAssignee(assignee);
  };

  const finalizeRemoveFromTasks = async (assignee) => {
    await excludeStaffFromTasksModule(assignee.userId, { role });
    showFeedback('success', `${assignee.name} was removed from the Tasks module.`);
    setRemovingAssignee(null);

    if (selectedAssignee?.userId === assignee.userId) {
      setSelectedAssignee(null);
    }
  };

  const handleRemoveFromTasks = async (assignee) => {
    if (!canManageTasks) {
      throw new Error('You do not have permission to remove users from Tasks.');
    }

    const activeTasks = getActiveTasksForAssignee(assignee.tasks);
    if (activeTasks.length > 0) {
      throw new Error('Active tasks must be reassigned or archived before removal.');
    }

    setIsRemovingFromTasks(true);

    try {
      await finalizeRemoveFromTasks(assignee);
    } finally {
      setIsRemovingFromTasks(false);
    }
  };

  const handleReassignAndRemoveFromTasks = async (assignee, targetStaffId) => {
    if (!canManageTasks) {
      throw new Error('You do not have permission to remove users from Tasks.');
    }

    const activeTasks = getActiveTasksForAssignee(assignee.tasks);
    const targetStaffMember = staff.find((member) => member.id === targetStaffId);

    if (!targetStaffMember) {
      throw new Error('Selected staff member could not be found.');
    }

    setIsRemovingFromTasks(true);

    try {
      if (activeTasks.length > 0) {
        await reassignActiveTasks(activeTasks, targetStaffMember, { role });
      }

      await finalizeRemoveFromTasks(assignee);
    } finally {
      setIsRemovingFromTasks(false);
    }
  };

  const handleArchiveAndRemoveFromTasks = async (assignee) => {
    if (!canManageTasks) {
      throw new Error('You do not have permission to remove users from Tasks.');
    }

    const activeTasks = getActiveTasksForAssignee(assignee.tasks);

    setIsRemovingFromTasks(true);

    try {
      if (activeTasks.length > 0) {
        await archiveActiveTasks(activeTasks, { role });
      }

      await finalizeRemoveFromTasks(assignee);
    } finally {
      setIsRemovingFromTasks(false);
    }
  };

  const handleRestoreToTasks = async (member) => {
    if (!canManageTasks) {
      throw new Error('You do not have permission to restore users to Tasks.');
    }

    setIsRestoringToTasks(true);

    try {
      await restoreStaffToTasksModule(member.id, { role });
      showFeedback(
        'success',
        `${member.fullName || member.name || 'User'} was restored to the Tasks module.`,
      );
    } finally {
      setIsRestoringToTasks(false);
    }
  };

  const viewingTaskCanUpdateStatus = viewingTask ? canUpdateTaskStatus(viewingTask) : false;
  const canViewSelectedTask =
    viewingTask &&
    (canViewAllTasks || isTaskAssignedToCurrentUser(viewingTask, userContext));

  return (
    <div className="page-root">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-wide">Tasks</h1>
          <p className="text-sm text-slate-400 mt-1">
            {canManageTasks
              ? 'Create and manage tasks assigned to staff members.'
              : 'View staff workload summaries and manage tasks assigned to you.'}
          </p>
        </div>
        {canManageTasks && (
          <div className="flex flex-col sm:flex-row gap-2 shrink-0">
            <Button variant="secondary" icon={Users} onClick={() => setIsExcludedUsersOpen(true)}>
              Excluded Users{excludedStaff.length > 0 ? ` (${excludedStaff.length})` : ''}
            </Button>
            <Button icon={Plus} onClick={handleAddTask}>
              New Task
            </Button>
          </div>
        )}
      </div>

      <FeedbackBanner feedback={feedback} onDismiss={() => setFeedback({ type: '', message: '' })} />

      <TaskSummaryCards tasks={tasks} loading={loading} />

      {!loading && !error ? <TaskFilters searchTerm={searchTerm} onSearchChange={setSearchTerm} /> : null}

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500" />
        </div>
      ) : error ? (
        <div className="rounded-xl border border-rose-500/20 bg-rose-950/30 p-4 text-xs text-rose-400">
          Failed to load tasks. Please refresh and try again.
        </div>
      ) : assigneeGroups.length === 0 && hasSearchTerm ? (
        <TaskEmptyState noSearchMatches />
      ) : assigneeGroups.length === 0 ? (
        <TaskEmptyState canManageTasks={canManageTasks} />
      ) : (
        <TaskAssigneeCardGrid
          assignees={assigneeGroups}
          onSelectAssignee={handleSelectAssignee}
          onRemoveFromTasks={handleRemoveFromTasksPrompt}
          canViewAssignee={canViewAssignee}
          canRemoveFromTasks={canManageTasks}
        />
      )}

      <UserTasksModal
        assignee={authorizedSelectedAssignee}
        isOpen={Boolean(authorizedSelectedAssignee)}
        onClose={() => setSelectedAssignee(null)}
        onTaskClick={handleTaskClick}
      />

      <TaskDetailsModal
        task={canViewSelectedTask ? viewingTask : null}
        isOpen={Boolean(canViewSelectedTask)}
        onClose={() => setViewingTask(null)}
        onEdit={canManageTasks ? handleEditTask : undefined}
        onDelete={canManageTasks ? handleDeletePrompt : undefined}
        onStatusUpdate={viewingTaskCanUpdateStatus ? handleStatusUpdate : undefined}
        canManage={canManageTasks}
        canUpdateStatus={viewingTaskCanUpdateStatus}
      />

      {canManageTasks && (
        <>
          <TaskForm
            isOpen={isFormOpen}
            onClose={() => {
              setIsFormOpen(false);
              setEditingTask(null);
            }}
            onSubmit={handleFormSubmit}
            initialData={editingTask}
            staff={staff}
          />

          <TaskDeleteModal
            task={deletingTask}
            isOpen={Boolean(deletingTask)}
            onClose={() => setDeletingTask(null)}
            onConfirm={handleDeleteConfirm}
            isDeleting={isDeleting}
          />

          <RemoveFromTasksModal
            assignee={removingAssignee}
            staff={staff}
            isOpen={Boolean(removingAssignee)}
            onClose={() => setRemovingAssignee(null)}
            onRemove={handleRemoveFromTasks}
            onReassignAndRemove={handleReassignAndRemoveFromTasks}
            onArchiveAndRemove={handleArchiveAndRemoveFromTasks}
            isProcessing={isRemovingFromTasks}
          />

          <ExcludedTaskUsersModal
            excludedStaff={excludedStaff}
            isOpen={isExcludedUsersOpen}
            onClose={() => setIsExcludedUsersOpen(false)}
            onRestore={handleRestoreToTasks}
            isProcessing={isRestoringToTasks}
          />
        </>
      )}
    </div>
  );
}
