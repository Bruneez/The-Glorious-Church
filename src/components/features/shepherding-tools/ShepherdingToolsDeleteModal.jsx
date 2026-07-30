import { AlertTriangle } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import { getResourceTitle } from '@/config/shepherdingToolsDisplay';

export default function ShepherdingToolsDeleteModal({
  resource,
  isOpen,
  onClose,
  onConfirm,
  isDeleting = false,
}) {
  if (!resource) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Delete Resource" icon={AlertTriangle}>
      <div className="space-y-4">
        <p className="text-slate-300 text-xs leading-relaxed">
          Delete this resource? This will permanently remove the resource from Shepherding Tools
          for all users.
        </p>
        <p className="text-[11px] text-slate-400">
          Resource:{' '}
          <span className="font-semibold text-white">{getResourceTitle(resource)}</span>
        </p>

        <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-2 border-t border-slate-700">
          <Button type="button" variant="secondary" onClick={onClose} disabled={isDeleting}>
            Cancel
          </Button>
          <Button
            type="button"
            variant="danger"
            onClick={() => onConfirm(resource)}
            isLoading={isDeleting}
          >
            Delete Resource
          </Button>
        </div>
      </div>
    </Modal>
  );
}
