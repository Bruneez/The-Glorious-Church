import { AlertTriangle } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import { getDestinationPrimaryLabel } from '@/config/travellingDisplay';

export default function TravellingDeleteModal({
  destination,
  isOpen,
  onClose,
  onConfirm,
  isDeleting = false,
}) {
  if (!destination) return null;

  const handleConfirm = async () => {
    await onConfirm(destination);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Delete Travel Destination" icon={AlertTriangle}>
      <div className="space-y-4">
        <p className="text-slate-300 text-xs leading-relaxed">
          Delete this travel destination? This action cannot be undone.
        </p>
        <p className="text-[11px] text-slate-400">
          Location:{' '}
          <span className="font-semibold text-white">{getDestinationPrimaryLabel(destination)}</span>
        </p>

        <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-2 border-t border-slate-700">
          <Button type="button" variant="secondary" onClick={onClose} disabled={isDeleting}>
            Cancel
          </Button>
          <Button type="button" variant="danger" onClick={handleConfirm} isLoading={isDeleting}>
            Delete Location
          </Button>
        </div>
      </div>
    </Modal>
  );
}
