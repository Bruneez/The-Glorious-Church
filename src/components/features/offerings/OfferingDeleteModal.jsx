import { AlertTriangle } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import { formatDate, formatCurrencySimple } from '@/utils/formatters';

export default function OfferingDeleteModal({
  offering,
  isOpen,
  onClose,
  onConfirm,
  isDeleting = false,
}) {
  if (!offering) return null;

  const handleConfirm = async () => {
    await onConfirm(offering);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Delete Offering" icon={AlertTriangle}>
      <div className="space-y-4">
        <p className="text-slate-300 text-xs leading-relaxed">
          Are you sure you want to delete the offering for{' '}
          <span className="font-semibold text-white">
            {offering.serviceDate ? formatDate(offering.serviceDate) : 'this date'}
          </span>{' '}
          ({formatCurrencySimple(offering.totalAmount)})? This action cannot be undone.
        </p>

        <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-2 border-t border-slate-700">
          <Button type="button" variant="secondary" onClick={onClose} disabled={isDeleting}>
            Cancel
          </Button>
          <Button type="button" variant="danger" onClick={handleConfirm} isLoading={isDeleting}>
            Delete Offering
          </Button>
        </div>
      </div>
    </Modal>
  );
}
