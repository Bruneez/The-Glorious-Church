import { useEffect, useState } from 'react';
import { UserPlus, X } from 'lucide-react';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import { ROLES } from '@/config/roles';
import { getCreateStaffUserErrorMessage } from '@/services/staffUserService';

const ROLE_OPTIONS = [
  { value: ROLES.ADMIN, label: 'Admin' },
  { value: ROLES.PASTOR, label: 'Pastor' },
  { value: ROLES.CA_LEADER, label: 'Leader' }
];

export default function UserForm({ isOpen, onClose, onSubmit, initialData = null }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: ROLES.CA_LEADER,
    phone: '',
    photo: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    setFormData({
      name: initialData?.name || '',
      email: initialData?.email || '',
      role: initialData?.role || ROLES.CA_LEADER,
      phone: initialData?.phone || '',
      photo: initialData?.photo || '',
      password: '',
      confirmPassword: ''
    });
    setError('');
    setIsSubmitting(false);
  }, [initialData, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.name.trim()) {
      setError('Staff member name is required.');
      return;
    }

    if (!formData.email.trim()) {
      setError('Email address is required.');
      return;
    }

    if (!initialData) {
      if (formData.password.length < 6) {
        setError('Password must be at least 6 characters long.');
        return;
      }
      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match.');
        return;
      }
    }

    setIsSubmitting(true);

    try {
      await onSubmit(formData);
    } catch (submitError) {
      console.error('Error saving staff member:', submitError);
      setError(
        initialData
          ? (submitError?.message || 'Failed to save staff member. Please try again.')
          : getCreateStaffUserErrorMessage(submitError),
      );
    } finally {
      setIsSubmitting(false);
    }
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

        {!initialData && (
          <>
            <Input
              label="Password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter a secure password"
              required
            />

            <Input
              label="Confirm Password"
              name="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Re-enter password"
              required
            />
          </>
        )}

        {error && <p className="text-rose-400 text-[11px]">{error}</p>}

        <div className="flex justify-end gap-2 pt-2 border-t border-slate-700">
          <Button type="button" variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isSubmitting} disabled={isSubmitting}>
            Save User
          </Button>
        </div>
      </form>
    </Modal>
  );
}
