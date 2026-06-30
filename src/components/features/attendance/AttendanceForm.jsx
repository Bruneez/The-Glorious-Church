import { useState } from 'react';
import { BarChart3, X } from 'lucide-react';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';

export default function AttendanceForm({ isOpen, onClose, onSubmit, initialData = null }) {
  const [formData, setFormData] = useState({
    date: initialData?.date || '',
    count: initialData?.count || ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      count: parseInt(formData.count) || 0,
      percentage: 0
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Record Service Headcount" icon={BarChart3}>
      <form onSubmit={handleSubmit} className="space-y-3.5">
        <Input
          label="Service Metric Date"
          name="date"
          type="date"
          value={formData.date}
          onChange={handleChange}
          required
        />

        <Input
          label="Total Attendance Headcount"
          name="count"
          type="number"
          min="0"
          value={formData.count}
          onChange={handleChange}
          placeholder="e.g. 150"
          required
        />

        <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">
            Save Log Entry
          </Button>
        </div>
      </form>
    </Modal>
  );
}
