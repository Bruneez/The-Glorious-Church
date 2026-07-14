import { ListTodo } from 'lucide-react';
import { getRoleLabel } from '@/config/roles';
import Modal from '@/components/ui/Modal';
import UserAvatar from '@/components/ui/UserAvatar';
import { PriorityBadge, StatusBadge, TaskDueDateDisplay } from '@/components/features/tasks/TaskBadges';

function TaskListItem({ task, onClick }) {
  return (
    <button
      type="button"
      onClick={() => onClick?.(task)}
      className="w-full text-left rounded-xl bg-slate-900/50 border border-slate-700/60 p-3.5 hover:border-indigo-500/40 hover:bg-slate-900/80 transition cursor-pointer"
    >
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-white truncate">{task.title}</p>
          <TaskDueDateDisplay task={task} />
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <PriorityBadge priority={task.priority} />
          <StatusBadge status={task.status} />
        </div>
      </div>
    </button>
  );
}

export default function UserTasksModal({ assignee, isOpen, onClose, onTaskClick }) {
  if (!assignee) return null;

  const taskLabel = assignee.total === 1 ? '1 Task' : `${assignee.total} Tasks`;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`${assignee.name} — ${taskLabel}`}
      icon={ListTodo}
      maxWidth="max-w-2xl"
    >
      <div className="space-y-4">
        <div className="flex items-center gap-3 rounded-xl bg-slate-900/50 border border-slate-700/60 p-3.5">
          <UserAvatar name={assignee.name} photo={assignee.photo} size="md" />
          <div className="min-w-0">
            <p className="text-sm font-semibold text-white truncate">{assignee.name}</p>
            {assignee.role ? (
              <p className="text-[11px] text-indigo-400/90 font-medium mt-0.5">{getRoleLabel(assignee.role)}</p>
            ) : null}
            <p className="text-[11px] text-slate-400 mt-1">
              {assignee.completed} completed · {assignee.outstanding} outstanding
            </p>
          </div>
        </div>

        <div className="space-y-2">
          {assignee.tasks.map((task) => (
            <TaskListItem key={task.id} task={task} onClick={onTaskClick} />
          ))}
        </div>
      </div>
    </Modal>
  );
}
