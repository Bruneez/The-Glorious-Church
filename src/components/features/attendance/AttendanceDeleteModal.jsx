import { AlertTriangle } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import { formatDate } from '@/utils/formatters';

export default function AttendanceDeleteModal({
  record,
  isOpen,
  onClose,
  onConfirm,
  isDeleting = false,
}) {
  if (!record) return null;

  const attendanceDate = record.attendanceDate || record.serviceDate || record.date || '';

  const handleConfirm = async () => {
    await onConfirm(record);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Delete Attendance Record" icon={AlertTriangle}>
      <div className="space-y-4">
        <p className="text-slate-300 text-xs leading-relaxed">
          Are you sure you want to delete the attendance record for{' '}
          <span className="font-semibold text-white">
            {attendanceDate ? formatDate(attendanceDate) : 'this date'}
          </span>
          ? This action cannot be undone.
        </p>

        <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-2 border-t border-slate-700">
          <Button type="button" variant="secondary" onClick={onClose} disabled={isDeleting}>
            Cancel
          </Button>
          <Button type="button" variant="danger" onClick={handleConfirm} isLoading={isDeleting}>
            Delete Record
          </Button>
        </div>
      </div>
    </Modal>
  );
}
