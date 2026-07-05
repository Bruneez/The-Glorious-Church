import { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import {
  TASK_STATUS,
  TASK_PRIORITY,
  STATUS_OPTIONS,
  PRIORITY_OPTIONS,
} from '@/config/developmentBoardOptions';

const EMPTY_FORM = {
  title: '',
  description: '',
  priority: TASK_PRIORITY.MEDIUM,
  assignedTo: '',
  requestedBy: '',
  status: TASK_STATUS.OPEN,
};

export default function DevelopmentTaskForm({
  isOpen,
  onClose,
  onSubmit,
  initialData = null,
}) {
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    setFormData({
      title: initialData?.title || '',
      description: initialData?.description || '',
      priority: initialData?.priority || TASK_PRIORITY.MEDIUM,
      assignedTo: initialData?.assignedTo || '',
      requestedBy: initialData?.requestedBy || '',
      status: initialData?.status || TASK_STATUS.OPEN,
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

    if (!formData.title.trim()) {
      setError('Task title is required.');
      return;
    }

    if (!formData.priority) {
      setError('Priority is required.');
      return;
    }

    setIsSubmitting(true);

    try {
      await onSubmit(formData);
    } catch (submitError) {
      setError(submitError?.message || 'Failed to save task. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isEditing = Boolean(initialData);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Edit Task' : 'New Task'}
      icon={Plus}
      maxWidth="max-w-lg"
    >
      <form onSubmit={handleSubmit} className="space-y-3">
        <Input
          label="Task Title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          placeholder="e.g. Fix login redirect issue"
          required
        />

        <div>
          <label htmlFor="description" className="block text-slate-400 mb-1 font-medium text-xs">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={4}
            placeholder="Optional details about the task..."
            className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-indigo-500 text-xs resize-y min-h-[96px]"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Select
            label="Priority"
            name="priority"
            value={formData.priority}
            onChange={handleChange}
            options={PRIORITY_OPTIONS}
            required
          />
          <Select
            label="Status"
            name="status"
            value={formData.status}
            onChange={handleChange}
            options={STATUS_OPTIONS}
            required
          />
        </div>

        <Input
          label="Assign To"
          name="assignedTo"
          value={formData.assignedTo}
          onChange={handleChange}
          placeholder="Developer name"
        />

        <Input
          label="Requested By"
          name="requestedBy"
          value={formData.requestedBy}
          onChange={handleChange}
          placeholder="Who requested this work?"
        />

        {error && <p className="text-rose-400 text-[11px]">{error}</p>}

        <div className="flex justify-end gap-2 pt-2 border-t border-slate-700">
          <Button type="button" variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isSubmitting} disabled={isSubmitting}>
            {isEditing ? 'Save Changes' : 'Create Task'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
