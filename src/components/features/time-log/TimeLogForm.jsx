import { useEffect, useMemo, useState } from 'react';
import { Pencil, Plus } from 'lucide-react';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import {
  TIME_LOG_ACTIVITY_TYPE,
  TIME_LOG_ACTIVITY_OPTIONS,
  buildTimeLogFormDataFromRecord,
  computeDurationMinutes,
  formatDateOnly,
  formatDurationHours,
  validateTimeLogForm,
} from '@/config/timeLogOptions';

function getEmptyForm() {
  return {
    activityType: TIME_LOG_ACTIVITY_TYPE.SPIRITUAL,
    date: formatDateOnly(),
    startTime: '',
    endTime: '',
    title: '',
    description: '',
  };
}

function formatDurationLabel({ date, startTime, endTime }) {
  const durationMinutes = computeDurationMinutes({ date, startTime, endTime });

  if (!date || !startTime || !endTime || durationMinutes <= 0) {
    return '—';
  }

  return `${formatDurationHours(durationMinutes)} h (${durationMinutes} min)`;
}

export default function TimeLogForm({
  isOpen,
  onClose,
  onSubmit,
  initialData = null,
  staffMemberName = '',
}) {
  const [formData, setFormData] = useState(getEmptyForm);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEditing = Boolean(initialData?.id);

  useEffect(() => {
    if (!isOpen) return;

    setFormData(
      isEditing ? buildTimeLogFormDataFromRecord(initialData) : getEmptyForm(),
    );
    setError('');
    setIsSubmitting(false);
  }, [initialData, isOpen, isEditing]);

  const durationLabel = useMemo(() => formatDurationLabel(formData), [formData]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((previous) => ({ ...previous, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    const validationMessage = validateTimeLogForm(formData);

    if (validationMessage) {
      setError(validationMessage);
      return;
    }

    setIsSubmitting(true);

    try {
      await onSubmit(formData);
      onClose();
    } catch (submitError) {
      setError(submitError?.message || 'Failed to save time log. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const modalTitle = isEditing
    ? `Edit Time Log${staffMemberName ? ` — ${staffMemberName}` : ''}`
    : staffMemberName
      ? `New Time Log — ${staffMemberName}`
      : 'New Time Log';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={modalTitle}
      icon={isEditing ? Pencil : Plus}
      maxWidth="max-w-lg"
    >
      <form onSubmit={handleSubmit} className="space-y-3">
        <Select
          label="Activity Type"
          name="activityType"
          value={formData.activityType}
          onChange={handleChange}
          options={TIME_LOG_ACTIVITY_OPTIONS}
          required
        />

        <Input
          label="Date"
          name="date"
          type="date"
          value={formData.date}
          onChange={handleChange}
          required
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Start Time"
            name="startTime"
            type="time"
            value={formData.startTime}
            onChange={handleChange}
            required
          />
          <Input
            label="End Time"
            name="endTime"
            type="time"
            value={formData.endTime}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label htmlFor="time-log-duration" className="block text-slate-400 mb-1 font-medium text-xs">
            Duration
          </label>
          <div
            id="time-log-duration"
            className="w-full bg-slate-900/70 border border-slate-700 rounded-lg p-2.5 text-white text-xs tabular-nums"
            aria-live="polite"
          >
            {durationLabel}
          </div>
          <p className="text-[10px] text-slate-500 mt-1">
            Calculated automatically from end time minus start time.
          </p>
        </div>

        <Input
          label="Title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          placeholder="e.g. Morning prayer, Admin work"
          required
        />

        <div>
          <label htmlFor="time-log-description" className="block text-slate-400 mb-1 font-medium text-xs">
            Description
          </label>
          <textarea
            id="time-log-description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={4}
            placeholder="Optional details about this time log entry..."
            className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-indigo-500 text-xs resize-y min-h-[96px]"
          />
        </div>

        {error ? <p className="text-rose-400 text-[11px]">{error}</p> : null}

        <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-2 border-t border-slate-700">
          <Button type="button" variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isSubmitting} disabled={isSubmitting}>
            {isEditing ? 'Save Changes' : 'Save Time Log'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
