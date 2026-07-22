import { useEffect, useMemo, useState } from 'react';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';
import {
  MERCHANDISE_COLOUR_OPTIONS,
  MERCHANDISE_SIZE_OPTIONS,
  normalizeVariants,
} from '@/config/merchandiseOptions';

const MODE_COPY = {
  add: {
    title: 'Add Stock',
    submitLabel: 'Add Stock',
    quantityLabel: 'Quantity Received',
    reasonPlaceholder: 'e.g. New delivery',
  },
  remove: {
    title: 'Remove Stock',
    submitLabel: 'Remove Stock',
    quantityLabel: 'Quantity to Remove',
    reasonPlaceholder: 'e.g. Damaged / lost',
  },
  adjust: {
    title: 'Adjust Stock',
    submitLabel: 'Adjust Stock',
    quantityLabel: 'Correct Quantity',
    reasonPlaceholder: 'e.g. Stock count correction',
  },
};

export default function MerchandiseStockForm({
  isOpen,
  onClose,
  onSubmit,
  product = null,
  mode = 'add',
}) {
  const copy = MODE_COPY[mode] || MODE_COPY.add;
  const [formData, setFormData] = useState({
    colour: '',
    size: '',
    quantity: '',
    reason: '',
  });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen || !product) return;
    const variants = normalizeVariants(product.variants);
    setFormData({
      colour: variants[0]?.colour || MERCHANDISE_COLOUR_OPTIONS[0].value,
      size: variants[0]?.size || MERCHANDISE_SIZE_OPTIONS[2].value,
      quantity: mode === 'adjust' ? String(variants[0]?.quantity ?? '0') : '',
      reason: '',
    });
    setError('');
    setIsSubmitting(false);
  }, [isOpen, product, mode]);

  const variantOptions = normalizeVariants(product?.variants);
  const colourOptions = [...new Set([
    ...variantOptions.map((variant) => variant.colour),
    ...MERCHANDISE_COLOUR_OPTIONS.map((option) => option.value),
  ])].map((value) => ({ value, label: value }));

  const currentVariant = useMemo(
    () => variantOptions.find(
      (variant) => variant.colour === formData.colour && variant.size === formData.size,
    ),
    [variantOptions, formData.colour, formData.size],
  );

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    const quantity = Number.parseInt(formData.quantity, 10);
    if (!formData.colour || !formData.size) {
      setError('Select colour and size.');
      return;
    }
    if (Number.isNaN(quantity) || quantity < 0 || (mode !== 'adjust' && quantity < 1)) {
      setError('Enter a valid quantity.');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({
        ...formData,
        quantityChange: quantity,
        type: mode,
      });
    } catch (submitError) {
      setError(submitError.message || 'Unable to update stock.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`${copy.title}${product?.name ? `: ${product.name}` : ''}`}
      maxWidth="max-w-md"
      panelClassName="p-4 space-y-4"
    >
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <Select
          label="Colour"
          name="colour"
          value={formData.colour}
          onChange={handleChange}
          options={colourOptions}
        />
        <Select
          label="Size"
          name="size"
          value={formData.size}
          onChange={handleChange}
          options={MERCHANDISE_SIZE_OPTIONS}
        />
        <Input
          label={copy.quantityLabel}
          name="quantity"
          type="number"
          min="0"
          value={formData.quantity}
          onChange={handleChange}
          required
        />
        <Input
          label="Reason / Notes"
          name="reason"
          value={formData.reason}
          onChange={handleChange}
          placeholder={copy.reasonPlaceholder}
        />
        <p className="text-[11px] text-slate-400">
          Current stock for this variant: {currentVariant?.quantity ?? 0}
        </p>

        {error ? <p className="text-rose-400 text-[11px]">{error}</p> : null}

        <div className="flex justify-end gap-2 pt-2 border-t border-slate-700">
          <Button type="button" variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isSubmitting} disabled={isSubmitting}>
            {copy.submitLabel}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
