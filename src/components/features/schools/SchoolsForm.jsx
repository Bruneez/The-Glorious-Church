import { useEffect, useState } from 'react';
import { School } from 'lucide-react';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import {
  SCHOOL_STATUS,
  SCHOOL_STATUS_OPTIONS,
  SCHOOL_TYPE_OPTIONS,
  mapSchoolToFormData,
  validateSchoolForm,
} from '@/config/schoolsOptions';

const EMPTY_FORM = {
  name: '',
  type: '',
  address: '',
  status: SCHOOL_STATUS.ACTIVE,
};

export default function SchoolsForm({ isOpen, onClose, onSubmit, initialData = null, defaultType = '' }) {
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEditing = Boolean(initialData?.id);

  useEffect(() => {
    if (!isOpen) return;

    if (isEditing) {
      setFormData(mapSchoolToFormData(initialData));
    } else {
      setFormData({
        ...EMPTY_FORM,
        type: defaultType || '',
      });
    }

    setError('');
    setIsSubmitting(false);
  }, [defaultType, initialData, isEditing, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const validationError = validateSchoolForm(formData);
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsSubmitting(true);

    try {
      await onSubmit({
        name: formData.name.trim(),
        type: formData.type,
        address: formData.address.trim(),
        status: formData.status,
      });
    } catch (submitError) {
      setError(submitError?.message || 'Failed to save school. Please try again.');
      setIsSubmitting(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Edit School' : 'Add School'}
      icon={School}
      maxWidth="max-w-lg"
    >
      <form onSubmit={handleSubmit} className="space-y-3">
        <Input
          label="School Name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="e.g. Sunshine Primary School"
          required
        />

        <Select
          label="School Type"
          name="type"
          value={formData.type}
          onChange={handleChange}
          options={SCHOOL_TYPE_OPTIONS}
          placeholder="Select school type"
          required
        />

        <Input
          label="Address"
          name="address"
          value={formData.address}
          onChange={handleChange}
          placeholder="123 Main Street, Suburb"
        />

        <Select
          label="Status"
          name="status"
          value={formData.status}
          onChange={handleChange}
          options={SCHOOL_STATUS_OPTIONS}
          placeholder="Select status"
          required
        />

        {error && (
          <p className="text-rose-400 text-[11px] font-medium">{error}</p>
        )}

        <div className="flex justify-end gap-2 pt-2 border-t border-slate-700">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isSubmitting}>
            {isEditing ? 'Save Changes' : 'Add School'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
