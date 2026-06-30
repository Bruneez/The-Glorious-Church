import { useState } from 'react';
import { Coins, X } from 'lucide-react';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';

export default function OfferingForm({ isOpen, onClose, onSubmit, initialData = null }) {
  const [formData, setFormData] = useState({
    date: initialData?.date || '',
    amount: initialData?.amount || ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      amount: parseFloat(formData.amount) || 0
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Record Service Offerings" icon={Coins}>
      <form onSubmit={handleSubmit} className="space-y-3.5">
        <Input
          label="Service Metric Collection Date"
          name="date"
          type="date"
          value={formData.date}
          onChange={handleChange}
          required
        />

        <div>
          <label className="block text-slate-400 mb-1 font-medium text-xs">Total Offerings Received (ZAR)</label>
          <div className="relative flex items-center">
            <span className="absolute left-3 text-slate-500 font-bold font-sans text-xs">R</span>
            <input
              type="number"
              name="amount"
              min="0"
              step="0.01"
              value={formData.amount}
              onChange={handleChange}
              placeholder="0.00"
              required
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 pl-7 text-white focus:outline-none focus:border-emerald-500 tracking-wide font-mono font-medium text-xs"
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="success">
            Save Collection
          </Button>
        </div>
      </form>
    </Modal>
  );
}
