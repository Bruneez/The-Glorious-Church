import { useEffect, useState } from 'react';
import { ListTodo } from 'lucide-react';
import { getRoleLabel } from '@/config/roles';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import Select from '@/components/ui/Select';
import { formatDate } from '@/utils/formatters';
import { PriorityBadge, StatusBadge } from '@/components/features/tasks/TaskBadges';
import { isTaskOverdue, STATUS_OPTIONS, TASK_STATUS } from '@/config/tasksOptions';

function DetailField({ label, value, children }) {
  return (
    <div className="rounded-xl bg-slate-900/50 border border-slate-700/60 p-3.5">
      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{label}</p>
      <div className="text-sm font-medium text-white mt-1">{children ?? value ?? '—'}</div>
    </div>
  );
}

function formatTimestamp(value) {
  if (!value) return '—';

  const date = typeof value?.toDate === 'function' ? value.toDate() : new Date(value);
  if (Number.isNaN(date.getTime())) return '—';

  return formatDate(date.toISOString(), 'time');
}

export default function TaskDetailsModal({
  task,
  isOpen,
  onClose,
  onEdit,
  onDelete,
  onStatusUpdate,
  canManage = false,
  canUpdateStatus = false,
}) {
  const [status, setStatus] = useState('');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [statusError, setStatusError] = useState('');

  useEffect(() => {
    if (!isOpen || !task) return;

    setStatus(task.status || TASK_STATUS.OPEN);
    setStatusError('');
    setIsUpdatingStatus(false);
  }, [isOpen, task]);

  if (!task) return null;

  const overdue = isTaskOverdue(task);
  const showStatusControls = canUpdateStatus && onStatusUpdate;
  const statusChanged = status !== task.status;

  const handleStatusUpdate = async () => {
    if (!statusChanged) return;

    setStatusError('');
    setIsUpdatingStatus(true);

    try {
      await onStatusUpdate(task, status);
    } catch (updateError) {
      setStatusError(updateError?.message || 'Failed to update task status. Please try again.');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleMarkCompleted = async () => {
    setStatus(TASK_STATUS.COMPLETED);
    setStatusError('');
    setIsUpdatingStatus(true);

    try {
      await onStatusUpdate(task, TASK_STATUS.COMPLETED);
    } catch (updateError) {
      setStatusError(updateError?.message || 'Failed to mark task as completed. Please try again.');
      setStatus(task.status || TASK_STATUS.OPEN);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Task Details"
      icon={ListTodo}
      maxWidth="max-w-2xl"
    >
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <DetailField label="Task Title" value={task.title} />
          <DetailField label="Assigned User">
            <div>
              <p>{task.assignedUserName || '—'}</p>
              {task.assignedUserRole ? (
                <p className="text-[11px] text-slate-400 font-normal mt-0.5">
                  {getRoleLabel(task.assignedUserRole)}
                </p>
              ) : null}
            </div>
          </DetailField>
          <DetailField label="Priority">
            <PriorityBadge priority={task.priority} />
          </DetailField>
          <DetailField label="Status">
            <StatusBadge status={task.status} />
          </DetailField>
          <DetailField label="Due Date">
            <span className={overdue ? 'text-rose-400' : undefined}>
              {task.dueDate ? formatDate(task.dueDate, 'long') : '—'}
              {overdue ? ' (Overdue)' : ''}
            </span>
          </DetailField>
          <DetailField label="Created By" value={task.createdByName || task.createdBy || '—'} />
          <DetailField label="Created Date" value={formatTimestamp(task.createdAt)} />
        </div>

        <DetailField label="Description" value={task.description || '—'} />

        {showStatusControls ? (
          <div className="rounded-xl bg-slate-900/50 border border-slate-700/60 p-3.5 space-y-3">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Update Status
            </p>
            <Select
              label="Status"
              name="taskStatus"
              value={status}
              onChange={(event) => setStatus(event.target.value)}
              options={STATUS_OPTIONS}
              className="mb-0"
            />
            {statusError ? <p className="text-rose-400 text-[11px]">{statusError}</p> : null}
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="primary"
                onClick={handleStatusUpdate}
                isLoading={isUpdatingStatus}
                disabled={!statusChanged || isUpdatingStatus}
              >
                Save Status
              </Button>
              {task.status !== TASK_STATUS.COMPLETED ? (
                <Button
                  type="button"
                  variant="success"
                  onClick={handleMarkCompleted}
                  isLoading={isUpdatingStatus}
                  disabled={isUpdatingStatus}
                >
                  Mark Completed
                </Button>
              ) : null}
            </div>
          </div>
        ) : null}

        <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-2 border-t border-slate-700">
          {canManage && onDelete ? (
            <Button type="button" variant="danger" onClick={() => onDelete(task)}>
              Delete Task
            </Button>
          ) : null}
          {canManage && onEdit ? (
            <Button
              type="button"
              variant="primary"
              onClick={() => {
                onEdit(task);
                onClose();
              }}
            >
              Edit Task
            </Button>
          ) : null}
          <Button type="button" variant="secondary" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
}
