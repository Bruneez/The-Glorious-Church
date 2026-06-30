import { useState } from 'react';
import { Bus, X } from 'lucide-react';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';

const STATUS_OPTIONS = [
  { value: 'Active', label: 'Active' },
  { value: 'Inactive', label: 'Inactive' }
];

export default function TransportForm({ isOpen, onClose, onSubmit, initialData = null }) {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    phone: initialData?.phone || '',
    vehicleReg: initialData?.vehicleReg || '',
    vehicleType: initialData?.vehicleType || '',
    capacity: initialData?.capacity || '',
    route: initialData?.route || '',
    status: initialData?.status || 'Active'
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      capacity: parseInt(formData.capacity) || 0
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={initialData ? 'Edit Taxi Driver' : 'Add Taxi Driver'} icon={Bus}>
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
          label="Vehicle Registration"
          name="vehicleReg"
          value={formData.vehicleReg}
          onChange={handleChange}
          placeholder="e.g. CA 123 456"
          required
        />

        <Input
          label="Vehicle Type"
          name="vehicleType"
          value={formData.vehicleType}
          onChange={handleChange}
          placeholder="e.g. Toyota Quantum"
        />

        <Input
          label="Vehicle Capacity"
          name="capacity"
          type="number"
          min="1"
          value={formData.capacity}
          onChange={handleChange}
          placeholder="e.g. 15"
          required
        />

        <Input
          label="Assigned Route"
          name="route"
          value={formData.route}
          onChange={handleChange}
          placeholder="e.g. Route A - CBD to Soweto"
        />

        <Select
          label="Operational Status"
          name="status"
          value={formData.status}
          onChange={handleChange}
          options={STATUS_OPTIONS}
        />

        <div className="flex justify-end gap-2 pt-2 border-t border-slate-700">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">
            Save Driver
          </Button>
        </div>
      </form>
    </Modal>
  );
}
