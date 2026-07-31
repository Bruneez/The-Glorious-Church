import { AlertTriangle } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';

export default function ProjectDeleteModal({
  project,
  isOpen,
  onClose,
  onConfirm,
  isDeleting = false,
}) {
  if (!project) return null;

  const handleConfirm = async () => {
    await onConfirm(project);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Delete Project" icon={AlertTriangle}>
      <div className="space-y-4">
        <p className="text-slate-300 text-xs leading-relaxed">
          Are you sure you want to delete{' '}
          <span className="font-semibold text-white">{project.title}</span>?
          Team memberships, updates, and attachments will be removed. This action cannot be undone.
        </p>

        <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-2 border-t border-slate-700">
          <Button type="button" variant="secondary" onClick={onClose} disabled={isDeleting}>
            Cancel
          </Button>
          <Button type="button" variant="danger" onClick={handleConfirm} isLoading={isDeleting}>
            Delete Project
          </Button>
        </div>
      </div>
    </Modal>
  );
}
