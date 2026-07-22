import { useEffect, useMemo, useState } from 'react';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';
import {
  MERCHANDISE_COLOUR_OPTIONS,
  MERCHANDISE_SIZE_OPTIONS,
  REQUEST_STATUS_OPTIONS,
  normalizeVariants,
} from '@/config/merchandiseOptions';

export default function MerchandiseRequestForm({
  isOpen,
  onClose,
  onSubmit,
  products = [],
}) {
  const activeProducts = useMemo(
    () => products.filter((product) => product.status !== 'archived'),
    [products],
  );

  const [formData, setFormData] = useState({
    requesterName: '',
    contactNumber: '',
    productId: '',
    colour: '',
    size: '',
    quantity: '1',
    notes: '',
    status: 'waiting',
  });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const first = activeProducts[0];
    const variants = normalizeVariants(first?.variants);
    setFormData({
      requesterName: '',
      contactNumber: '',
      productId: first?.id || '',
      colour: variants[0]?.colour || MERCHANDISE_COLOUR_OPTIONS[0].value,
      size: variants[0]?.size || MERCHANDISE_SIZE_OPTIONS[2].value,
      quantity: '1',
      notes: '',
      status: 'waiting',
    });
    setError('');
    setIsSubmitting(false);
  }, [isOpen, activeProducts]);

  const selectedProduct = activeProducts.find((product) => product.id === formData.productId);
  const variantOptions = normalizeVariants(selectedProduct?.variants);
  const colourOptions = [...new Set(variantOptions.map((variant) => variant.colour))]
    .map((value) => ({ value, label: value }));

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    if (!formData.requesterName.trim()) {
      setError('Requester name is required.');
      return;
    }
    if (!formData.productId) {
      setError('Select a product.');
      return;
    }
    const quantity = Number.parseInt(formData.quantity, 10);
    if (!quantity || quantity < 1) {
      setError('Enter a valid quantity.');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
    } catch (submitError) {
      setError(submitError.message || 'Unable to save request.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Record Merchandise Request"
      maxWidth="max-w-lg"
      panelClassName="p-4 space-y-4 max-h-[90vh] overflow-y-auto"
    >
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <Input
          label="Name"
          name="requesterName"
          value={formData.requesterName}
          onChange={handleChange}
          required
        />
        <Input
          label="Contact Number"
          name="contactNumber"
          value={formData.contactNumber}
          onChange={handleChange}
        />
        <Select
          label="Product Requested"
          name="productId"
          value={formData.productId}
          onChange={handleChange}
          options={activeProducts.map((product) => ({ value: product.id, label: product.name }))}
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Select
            label="Colour"
            name="colour"
            value={formData.colour}
            onChange={handleChange}
            options={colourOptions.length ? colourOptions : MERCHANDISE_COLOUR_OPTIONS}
          />
          <Select
            label="Size"
            name="size"
            value={formData.size}
            onChange={handleChange}
            options={MERCHANDISE_SIZE_OPTIONS}
          />
        </div>
        <Input
          label="Quantity"
          name="quantity"
          type="number"
          min="1"
          value={formData.quantity}
          onChange={handleChange}
          required
        />
        <div>
          <label htmlFor="request-notes" className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
            Notes
          </label>
          <textarea
            id="request-notes"
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            rows={3}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 resize-y"
          />
        </div>
        <Select
          label="Status"
          name="status"
          value={formData.status}
          onChange={handleChange}
          options={REQUEST_STATUS_OPTIONS}
        />

        {error ? <p className="text-rose-400 text-[11px]">{error}</p> : null}

        <div className="flex justify-end gap-2 pt-2 border-t border-slate-700">
          <Button type="button" variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isSubmitting} disabled={isSubmitting}>
            Save Request
          </Button>
        </div>
      </form>
    </Modal>
  );
}
