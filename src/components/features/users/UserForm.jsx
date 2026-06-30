import { useState } from 'react';
import { UserPlus, X } from 'lucide-react';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import { ROLES } from '@/config/roles';

const ROLE_OPTIONS = [
  { value: ROLES.ADMIN, label: 'Admin' },
  { value: ROLES.PASTOR, label: 'Pastor' },
  { value: ROLES.CA_LEADER, label: 'Creative Arts Leader' }
];

export default function UserForm({ isOpen, onClose, onSubmit, initialData = null }) {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    email: initialData?.email || '',
    role: initialData?.role || ROLES.CA_LEADER,
    phone: initialData?.phone || '',
    photo: initialData?.photo || ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={initialData ? 'Edit Staff Member' : 'Provision Authorized Account'} icon={UserPlus}>
      <form onSubmit={handleSubmit} className="space-y-3">
        <Input
          label="Staff Member Name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="e.g. John Doe"
          required
        />

        <Input
          label="Secure Log Email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="name@thegloriouschurch.org"
          required
        />

        <Select
          label="Assigned Portal Role"
          name="role"
          value={formData.role}
          onChange={handleChange}
          options={ROLE_OPTIONS}
          required
        />

        <Input
          label="Phone Number"
          name="phone"
          type="tel"
          value={formData.phone}
          onChange={handleChange}
          placeholder="012 345 6789"
        />

        <div className="flex justify-end gap-2 pt-2 border-t border-slate-700">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">
            Save Staff Member
          </Button>
        </div>
      </form>
    </Modal>
  );
}
