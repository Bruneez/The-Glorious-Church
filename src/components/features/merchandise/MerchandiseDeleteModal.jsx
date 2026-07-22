import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';

export default function MerchandiseDeleteModal({
  isOpen,
  onClose,
  onConfirm,
  product,
  isDeleting = false,
}) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Delete Merchandise"
      maxWidth="max-w-md"
      panelClassName="p-4 space-y-4"
    >
      <div className="space-y-3">
        <p className="text-sm text-slate-200">
          Delete <span className="font-semibold text-white">{product?.name || 'this product'}</span>?
        </p>
        <p className="text-xs text-slate-400 leading-relaxed">
          This will permanently remove the merchandise item, its images, and inventory variants from the active catalogue.
          Sales and stock history records will remain for reporting.
        </p>
      </div>

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onClose} disabled={isDeleting}>
          Cancel
        </Button>
        <Button variant="danger" onClick={onConfirm} isLoading={isDeleting}>
          Delete Product
        </Button>
      </div>
    </Modal>
  );
}
