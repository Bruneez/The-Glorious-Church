import { KanbanSquare } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import { formatDate } from '@/utils/formatters';
import { getPriorityBadgeClass } from '@/config/developmentBoardOptions';

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

export default function DevelopmentTaskViewModal({ task, isOpen, onClose, onEdit }) {
  if (!task) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Task Details"
      icon={KanbanSquare}
      maxWidth="max-w-2xl"
    >
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <DetailField label="Title" value={task.title} />
          <DetailField label="Priority">
            <span
              className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${getPriorityBadgeClass(task.priority)}`}
            >
              {task.priority}
            </span>
          </DetailField>
          <DetailField label="Status" value={task.status} />
          <DetailField label="Assigned To" value={task.assignedTo || '—'} />
          <DetailField label="Requested By" value={task.requestedBy || '—'} />
          <DetailField label="Created By" value={task.createdBy || '—'} />
          <DetailField label="Created At" value={formatTimestamp(task.createdAt)} />
          <DetailField label="Updated At" value={formatTimestamp(task.updatedAt)} />
        </div>

        <DetailField label="Description" value={task.description || '—'} />

        <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-2 border-t border-slate-700">
          {onEdit && (
            <Button type="button" variant="primary" onClick={() => onEdit(task)}>
              Edit Task
            </Button>
          )}
          <Button type="button" variant="secondary" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
}
