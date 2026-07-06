import { useEffect, useState } from 'react';
import { BarChart3 } from 'lucide-react';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import { formatDate } from '@/utils/formatters';
import { validateServiceSummaryForm } from '@/config/attendanceOptions';

export default function AttendanceSummaryForm({
  isOpen,
  onClose,
  onSubmit,
  serviceDate,
  attendanceDate,
  initialData = null,
}) {
  const [formData, setFormData] = useState({
    totalAttendance: '',
    visitors: '',
    firstTimeVisitors: '',
    salvations: '',
    notes: '',
  });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEditing = Boolean(initialData?.recordId);

  useEffect(() => {
    if (!isOpen) return;

    setFormData({
      totalAttendance: initialData?.totalAttendance ?? '',
      visitors: initialData?.visitors ?? '',
      firstTimeVisitors: initialData?.firstTimeVisitors ?? '',
      salvations: initialData?.salvations ?? '',
      notes: initialData?.notes || '',
    });
    setError('');
    setIsSubmitting(false);
  }, [initialData, isOpen]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    const validationError = validateServiceSummaryForm(formData);
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsSubmitting(true);

    try {
      await onSubmit(formData);
    } catch (submitError) {
      setError(submitError?.message || 'Failed to save attendance. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resolvedDate = attendanceDate || serviceDate;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Edit Service Attendance' : 'Record Service Attendance'}
      icon={BarChart3}
      maxWidth="max-w-lg"
    >
      <form onSubmit={handleSubmit} className="space-y-3.5">
        <Input
          label="Service Date"
          name="serviceDateDisplay"
          value={resolvedDate ? formatDate(resolvedDate) : ''}
          disabled
        />

        <Input
          label="Total Attendance"
          name="totalAttendance"
          type="number"
          min="0"
          value={formData.totalAttendance}
          onChange={handleChange}
          placeholder="e.g. 145"
          required
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Visitors"
            name="visitors"
            type="number"
            min="0"
            value={formData.visitors}
            onChange={handleChange}
            placeholder="e.g. 12"
          />
          <Input
            label="First-Time Visitors"
            name="firstTimeVisitors"
            type="number"
            min="0"
            value={formData.firstTimeVisitors}
            onChange={handleChange}
            placeholder="e.g. 4"
          />
        </div>

        <Input
          label="Salvations"
          name="salvations"
          type="number"
          min="0"
          value={formData.salvations}
          onChange={handleChange}
          placeholder="e.g. 3"
        />

        <div>
          <label htmlFor="attendance-notes" className="block text-slate-400 mb-1 font-medium text-xs">
            Notes
          </label>
          <textarea
            id="attendance-notes"
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            rows={3}
            placeholder="Optional service notes..."
            className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-indigo-500 text-xs resize-y min-h-[80px]"
          />
        </div>

        {error && <p className="text-rose-400 text-[11px]">{error}</p>}

        <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
          <Button type="button" variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isSubmitting} disabled={isSubmitting}>
            Save Attendance
          </Button>
        </div>
      </form>
    </Modal>
  );
}
