import { AlertTriangle } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';

export default function DevelopmentTaskDeleteModal({
  task,
  isOpen,
  onClose,
  onConfirm,
  isDeleting = false,
}) {
  if (!task) return null;

  const handleConfirm = async () => {
    await onConfirm(task);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Delete Task" icon={AlertTriangle}>
      <div className="space-y-4">
        <p className="text-slate-300 text-xs leading-relaxed">
          Are you sure you want to delete{' '}
          <span className="font-semibold text-white">{task.title}</span>? This action cannot be
          undone.
        </p>

        <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-2 border-t border-slate-700">
          <Button type="button" variant="secondary" onClick={onClose} disabled={isDeleting}>
            Cancel
          </Button>
          <Button type="button" variant="danger" onClick={handleConfirm} isLoading={isDeleting}>
            Delete Task
          </Button>
        </div>
      </div>
    </Modal>
  );
}
