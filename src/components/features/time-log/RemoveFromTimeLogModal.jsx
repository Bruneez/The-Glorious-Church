import { useEffect, useState } from 'react';
import { UserMinus } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';

export default function RemoveFromTimeLogModal({
  staffSummary,
  isOpen,
  onClose,
  onConfirm,
  isProcessing = false,
}) {
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isOpen) return;

    setError('');
  }, [isOpen, staffSummary?.userId]);

  if (!staffSummary) return null;

  const handleConfirm = async () => {
    setError('');

    try {
      await onConfirm(staffSummary);
    } catch (confirmError) {
      setError(confirmError?.message || 'Failed to remove user from Time Log.');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Remove from Time Log" icon={UserMinus}>
      <div className="space-y-4">
        <p className="text-slate-300 text-xs leading-relaxed">
          Remove <span className="font-semibold text-white">{staffSummary.name}</span> from the
          Time Log module? Their system account will remain active and their historical time log
          records will be kept, but they will no longer appear in the Time Log overview.
        </p>

        {error ? <p className="text-rose-400 text-[11px]">{error}</p> : null}

        <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-2 border-t border-slate-700">
          <Button type="button" variant="secondary" onClick={onClose} disabled={isProcessing}>
            Cancel
          </Button>
          <Button
            type="button"
            variant="danger"
            onClick={handleConfirm}
            isLoading={isProcessing}
            disabled={isProcessing}
          >
            Remove from Time Log
          </Button>
        </div>
      </div>
    </Modal>
  );
}
