import { useMemo, useState } from 'react';
import { Plus, Search } from 'lucide-react';
import Button from '@/components/ui/Button';
import Select from '@/components/ui/Select';
import KanbanBoard from '@/components/features/development-board/KanbanBoard';
import DevelopmentTaskForm from '@/components/features/development-board/DevelopmentTaskForm';
import DevelopmentTaskViewModal from '@/components/features/development-board/DevelopmentTaskViewModal';
import DevelopmentTaskDeleteModal from '@/components/features/development-board/DevelopmentTaskDeleteModal';
import {
  useDevelopmentTasks,
  createDevelopmentTask,
  updateDevelopmentTask,
  updateDevelopmentTaskStatus,
  deleteDevelopmentTask,
} from '@/services/developmentBoardService';
import {
  filterDevelopmentTasks,
  getTaskStatusLabel,
  groupTasksByStatus,
  PRIORITY_FILTER_OPTIONS,
} from '@/config/developmentBoardOptions';
import { useAuth } from '@/hooks/useAuth';

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

export default function DevelopmentBoardPage() {
  const { data: tasks = [], loading, error } = useDevelopmentTasks();
  const { staffProfile, firebaseUser } = useAuth();

  const [searchTerm, setSearchTerm] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [viewingTask, setViewingTask] = useState(null);
  const [deletingTask, setDeletingTask] = useState(null);
  const [updatingTaskId, setUpdatingTaskId] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  const createdByName =
    staffProfile?.fullName ||
    staffProfile?.name ||
    firebaseUser?.displayName ||
    firebaseUser?.email ||
    'Admin';

  const filteredTasks = useMemo(
    () => filterDevelopmentTasks(tasks, { searchTerm, priority: priorityFilter }),
    [tasks, searchTerm, priorityFilter],
  );

  const groupedTasks = useMemo(() => groupTasksByStatus(filteredTasks), [filteredTasks]);

  const showFeedback = (type, message) => {
    setFeedback({ type, message });
  };

  const handleAddTask = () => {
    setEditingTask(null);
    setIsFormOpen(true);
  };

  const handleEditTask = (task) => {
    setViewingTask(null);
    setEditingTask(task);
    setIsFormOpen(true);
  };

  const handleViewTask = (task) => {
    setViewingTask(task);
  };

  const handleDeletePrompt = (task) => {
    setDeletingTask(task);
  };

  const handleFormSubmit = async (formData) => {
    if (editingTask) {
      await updateDevelopmentTask(editingTask.id, formData);
      showFeedback('success', 'Task updated successfully.');
    } else {
      await createDevelopmentTask(formData, createdByName);
      showFeedback('success', 'Task created successfully.');
    }

    setIsFormOpen(false);
    setEditingTask(null);
  };

  const handleStatusChange = async (task, status) => {
    if (!task?.id || task.status === status) return;

    setUpdatingTaskId(task.id);

    try {
      await updateDevelopmentTaskStatus(task.id, status);
      showFeedback('success', `Task moved to ${getTaskStatusLabel(status)}.`);
    } catch (statusError) {
      console.error('Error updating task status:', statusError);
      showFeedback('error', 'Failed to update task status. Please try again.');
    } finally {
      setUpdatingTaskId('');
    }
  };

  const handleDeleteConfirm = async (task) => {
    setIsDeleting(true);

    try {
      await deleteDevelopmentTask(task.id);
      showFeedback('success', 'Task deleted successfully.');
      setDeletingTask(null);
      setViewingTask(null);
    } catch (deleteError) {
      console.error('Error deleting task:', deleteError);
      showFeedback('error', 'Failed to delete task. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="page-root">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-wide">Development Board</h1>
          <p className="text-sm text-slate-400 mt-1">Feature requests and bug tracking</p>
        </div>
        <Button icon={Plus} onClick={handleAddTask}>
          New Task
        </Button>
      </div>

      <FeedbackBanner feedback={feedback} onDismiss={() => setFeedback({ type: '', message: '' })} />

      <div className="bg-slate-800 rounded-xl border border-slate-700/70 p-4">
        <div className="flex flex-col md:flex-row md:items-end gap-3">
          <div className="flex-1 min-w-0 w-full">
            <label htmlFor="development-board-search" className="block text-slate-400 mb-1 font-medium text-xs">
              Search
            </label>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
              <input
                id="development-board-search"
                type="text"
                placeholder="Search by title or description..."
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 pl-10 pr-3 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="w-full md:w-56 shrink-0">
            <Select
              label="Priority"
              name="priorityFilter"
              value={priorityFilter}
              onChange={(event) => setPriorityFilter(event.target.value)}
              options={PRIORITY_FILTER_OPTIONS}
              className="mb-0"
            />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500" />
        </div>
      ) : error ? (
        <div className="rounded-xl border border-rose-500/20 bg-rose-950/30 p-4 text-xs text-rose-400">
          Failed to load development tasks. Please refresh and try again.
        </div>
      ) : (
        <div className="w-full max-w-full min-w-0">
          <KanbanBoard
            groupedTasks={groupedTasks}
            onView={handleViewTask}
            onEdit={handleEditTask}
            onDelete={handleDeletePrompt}
            onStatusChange={handleStatusChange}
            updatingTaskId={updatingTaskId}
          />
        </div>
      )}

      <DevelopmentTaskForm
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingTask(null);
        }}
        onSubmit={handleFormSubmit}
        initialData={editingTask}
      />

      <DevelopmentTaskViewModal
        task={viewingTask}
        isOpen={Boolean(viewingTask)}
        onClose={() => setViewingTask(null)}
        onEdit={handleEditTask}
      />

      <DevelopmentTaskDeleteModal
        task={deletingTask}
        isOpen={Boolean(deletingTask)}
        onClose={() => setDeletingTask(null)}
        onConfirm={handleDeleteConfirm}
        isDeleting={isDeleting}
      />
    </div>
  );
}
