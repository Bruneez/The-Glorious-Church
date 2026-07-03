import { useEffect, useState } from 'react';
import { Bus } from 'lucide-react';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import {
  TRANSPORT_STATUS,
  TRANSPORT_STATUS_OPTIONS,
  validateTransportForm,
} from '@/config/transportOptions';

const EMPTY_FORM = {
  name: '',
  phone: '',
  vehicle: '',
  route: '',
  capacity: '',
  status: TRANSPORT_STATUS.ACTIVE,
};

export default function TransportForm({ isOpen, onClose, onSubmit, initialData = null }) {
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    setFormData({
      name: initialData?.name || '',
      phone: initialData?.phone || '',
      vehicle: initialData?.vehicle || initialData?.vehicleReg || '',
      route: initialData?.route || '',
      capacity: initialData?.capacity ?? '',
      status: initialData?.status || TRANSPORT_STATUS.ACTIVE,
    });
    setError('');
    setIsSubmitting(false);
  }, [initialData, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const validationError = validateTransportForm(formData);
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsSubmitting(true);

    try {
      await onSubmit(formData);
    } catch (submitError) {
      setError(submitError?.message || 'Failed to save driver. Please try again.');
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
      title={initialData?.id ? 'Edit Driver' : 'Add Driver'}
      icon={Bus}
      maxWidth="max-w-lg"
    >
      <form onSubmit={handleSubmit} className="space-y-3">
        <Input
          label="Driver Name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="e.g. John Doe"
          required
        />

        <Input
          label="Phone Number"
          name="phone"
          type="tel"
          value={formData.phone}
          onChange={handleChange}
          placeholder="012 345 6789"
          required
        />

        <Input
          label="Vehicle"
          name="vehicle"
          value={formData.vehicle}
          onChange={handleChange}
          placeholder="e.g. Toyota Quantum (CA 123 456)"
          required
        />

        <Input
          label="Route"
          name="route"
          value={formData.route}
          onChange={handleChange}
          placeholder="e.g. Route A - CBD to Soweto"
          required
        />

        <Input
          label="Capacity"
          name="capacity"
          type="number"
          min="1"
          value={formData.capacity}
          onChange={handleChange}
          placeholder="e.g. 15"
          required
        />

        <Select
          label="Status"
          name="status"
          value={formData.status}
          onChange={handleChange}
          options={TRANSPORT_STATUS_OPTIONS}
          placeholder="Select Status"
        />

        {error && <p className="text-rose-400 text-[11px]">{error}</p>}

        <div className="flex justify-end gap-2 pt-2 border-t border-slate-700">
          <Button type="button" variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isSubmitting}>
            Save Driver
          </Button>
        </div>
      </form>
    </Modal>
  );
}
