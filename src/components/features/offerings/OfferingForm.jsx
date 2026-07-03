import { useEffect, useState } from 'react';
import { Coins } from 'lucide-react';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import { validateOfferingForm } from '@/config/offeringsOptions';

export default function OfferingForm({ isOpen, onClose, onSubmit, initialData = null }) {
  const [serviceDate, setServiceDate] = useState('');
  const [totalAmount, setTotalAmount] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    setServiceDate(initialData?.serviceDate || initialData?.date || '');
    setTotalAmount(
      initialData?.totalAmount !== undefined && initialData?.totalAmount !== null
        ? String(initialData.totalAmount ?? initialData.amount ?? '')
        : '',
    );
    setError('');
    setIsSubmitting(false);
  }, [initialData, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const validationError = validateOfferingForm({ serviceDate, totalAmount });
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsSubmitting(true);

    try {
      await onSubmit({
        serviceDate,
        totalAmount: parseFloat(totalAmount),
      });
    } catch (submitError) {
      setError(submitError?.message || 'Failed to save offering. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData?.id ? 'Edit Offering' : 'Add Offering'}
      icon={Coins}
    >
      <form onSubmit={handleSubmit} className="space-y-3.5">
        <Input
          label="Date of Service"
          name="serviceDate"
          type="date"
          value={serviceDate}
          onChange={(e) => setServiceDate(e.target.value)}
          required
        />

        <div>
          <label className="block text-slate-400 mb-1 font-medium text-xs">Total Amount</label>
          <div className="relative flex items-center">
            <span className="absolute left-3 text-slate-500 font-bold text-xs">R</span>
            <input
              type="number"
              name="totalAmount"
              min="0"
              step="0.01"
              value={totalAmount}
              onChange={(e) => setTotalAmount(e.target.value)}
              placeholder="0.00"
              required
              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 pl-7 text-white focus:outline-none focus:border-indigo-500 tracking-wide font-mono font-medium text-xs"
            />
          </div>
        </div>

        {error && <p className="text-rose-400 text-[11px]">{error}</p>}

        <div className="flex justify-end gap-2 pt-2 border-t border-slate-700">
          <Button type="button" variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isSubmitting}>
            Save Offering
          </Button>
        </div>
      </form>
    </Modal>
  );
}
