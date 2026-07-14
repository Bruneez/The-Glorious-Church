import { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, UserMinus } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import Select from '@/components/ui/Select';
import { StatusBadge } from '@/components/features/tasks/TaskBadges';
import {
  buildStaffAssigneeOptions,
  getActiveTasksForAssignee,
} from '@/config/tasksOptions';

export default function RemoveFromTasksModal({
  assignee,
  staff = [],
  isOpen,
  onClose,
  onRemove,
  onReassignAndRemove,
  onArchiveAndRemove,
  isProcessing = false,
}) {
  const [reassignTargetId, setReassignTargetId] = useState('');
  const [error, setError] = useState('');

  const activeTasks = useMemo(
    () => getActiveTasksForAssignee(assignee?.tasks || []),
    [assignee],
  );
  const hasActiveTasks = activeTasks.length > 0;

  const reassignmentOptions = useMemo(() => {
    return buildStaffAssigneeOptions(staff).filter(
      (option) => option.value && option.value !== assignee?.userId,
    );
  }, [staff, assignee?.userId]);

  useEffect(() => {
    if (!isOpen) return;

    setReassignTargetId('');
    setError('');
  }, [isOpen, assignee?.userId]);

  if (!assignee) return null;

  const handleRemove = async () => {
    setError('');

    try {
      await onRemove(assignee);
    } catch (removeError) {
      setError(removeError?.message || 'Failed to remove user from Tasks.');
    }
  };

  const handleReassignAndRemove = async () => {
    if (!reassignTargetId) {
      setError('Select a staff member to reassign active tasks to.');
      return;
    }

    setError('');

    try {
      await onReassignAndRemove(assignee, reassignTargetId);
    } catch (removeError) {
      setError(removeError?.message || 'Failed to reassign tasks and remove user.');
    }
  };

  const handleArchiveAndRemove = async () => {
    setError('');

    try {
      await onArchiveAndRemove(assignee);
    } catch (removeError) {
      setError(removeError?.message || 'Failed to archive tasks and remove user.');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Remove from Tasks"
      icon={hasActiveTasks ? AlertTriangle : UserMinus}
      maxWidth="max-w-lg"
    >
      <div className="space-y-4">
        {hasActiveTasks ? (
          <>
            <p className="text-slate-300 text-xs leading-relaxed">
              <span className="font-semibold text-white">{assignee.name}</span> has{' '}
              {activeTasks.length === 1 ? '1 active task' : `${activeTasks.length} active tasks`}.
              Active tasks must first be reassigned or archived before this user can be removed
              from the Tasks module.
            </p>

            <div className="rounded-xl bg-slate-900/50 border border-slate-700/60 p-3 space-y-2 max-h-40 overflow-y-auto">
              {activeTasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-center justify-between gap-3 text-xs border-b border-slate-800/80 last:border-b-0 pb-2 last:pb-0"
                >
                  <span className="text-white font-medium truncate">{task.title}</span>
                  <StatusBadge status={task.status} />
                </div>
              ))}
            </div>

            <Select
              label="Reassign active tasks to"
              name="reassignTargetId"
              value={reassignTargetId}
              onChange={(event) => setReassignTargetId(event.target.value)}
              options={[
                { value: '', label: 'Select staff member...' },
                ...reassignmentOptions,
              ]}
            />

            {error ? <p className="text-rose-400 text-[11px]">{error}</p> : null}

            <div className="flex flex-col-reverse sm:flex-row sm:flex-wrap sm:justify-end gap-2 pt-2 border-t border-slate-700">
              <Button type="button" variant="secondary" onClick={onClose} disabled={isProcessing}>
                Cancel
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={handleArchiveAndRemove}
                isLoading={isProcessing}
                disabled={isProcessing}
              >
                Archive Active Tasks & Remove
              </Button>
              <Button
                type="button"
                variant="primary"
                onClick={handleReassignAndRemove}
                isLoading={isProcessing}
                disabled={isProcessing || !reassignTargetId}
              >
                Reassign & Remove
              </Button>
            </div>
          </>
        ) : (
          <>
            <p className="text-slate-300 text-xs leading-relaxed">
              Remove this user from the Tasks module? Their system account will remain active, but
              they will no longer appear in the task overview.
            </p>

            {error ? <p className="text-rose-400 text-[11px]">{error}</p> : null}

            <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-2 border-t border-slate-700">
              <Button type="button" variant="secondary" onClick={onClose} disabled={isProcessing}>
                Cancel
              </Button>
              <Button
                type="button"
                variant="danger"
                onClick={handleRemove}
                isLoading={isProcessing}
                disabled={isProcessing}
              >
                Remove from Tasks
              </Button>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}
