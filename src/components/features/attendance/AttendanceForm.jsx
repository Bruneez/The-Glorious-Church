import { useEffect, useState } from 'react';
import { BarChart3 } from 'lucide-react';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';

export default function AttendanceForm({ isOpen, onClose, onSubmit, initialData = null }) {
  const [attendanceDate, setAttendanceDate] = useState('');

  useEffect(() => {
    if (!isOpen) return;

    setAttendanceDate(initialData?.serviceDate || initialData?.date || '');
  }, [initialData, isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ serviceDate: attendanceDate });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData?.id ? 'Edit Attendance' : 'New Attendance'}
      icon={BarChart3}
    >
      <form onSubmit={handleSubmit} className="space-y-3.5">
        <Input
          label="Attendance Date"
          name="attendanceDate"
          type="date"
          value={attendanceDate}
          onChange={(e) => setAttendanceDate(e.target.value)}
          required
        />

        <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">
            Continue
          </Button>
        </div>
      </form>
    </Modal>
  );
}
