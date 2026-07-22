import { useEffect, useMemo, useState } from 'react';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';
import {
  MERCHANDISE_COLOUR_OPTIONS,
  MERCHANDISE_SIZE_OPTIONS,
  PAYMENT_STATUS_OPTIONS,
  normalizeVariants,
} from '@/config/merchandiseOptions';

export default function MerchandiseSaleForm({
  isOpen,
  onClose,
  onSubmit,
  product = null,
  products = [],
}) {
  const [formData, setFormData] = useState({
    productId: '',
    colour: '',
    size: '',
    quantity: '1',
    buyerName: '',
    phoneNumber: '',
    paymentStatus: 'paid',
  });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const selected = product || products[0] || null;
    const variants = normalizeVariants(selected?.variants);
    setFormData({
      productId: selected?.id || '',
      colour: variants[0]?.colour || MERCHANDISE_COLOUR_OPTIONS[0].value,
      size: variants[0]?.size || MERCHANDISE_SIZE_OPTIONS[2].value,
      quantity: '1',
      buyerName: '',
      phoneNumber: '',
      paymentStatus: 'paid',
    });
    setError('');
    setIsSubmitting(false);
  }, [isOpen, product, products]);

  const selectedProduct = useMemo(
    () => products.find((item) => item.id === formData.productId) || product,
    [products, formData.productId, product],
  );

  const variantOptions = normalizeVariants(selectedProduct?.variants);
  const colourOptions = [...new Set(variantOptions.map((variant) => variant.colour))]
    .map((value) => ({ value, label: value }));
  const sizeOptions = variantOptions
    .filter((variant) => !formData.colour || variant.colour === formData.colour)
    .map((variant) => ({
      value: variant.size,
      label: `${variant.size} (${variant.quantity} in stock)`,
    }));

  const productOptions = products
    .filter((item) => item.status !== 'archived')
    .map((item) => ({ value: item.id, label: item.name }));

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    if (!formData.productId) {
      setError('Select a product.');
      return;
    }
    if (!formData.colour || !formData.size) {
      setError('Select colour and size.');
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
      setError(submitError.message || 'Unable to record sale.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Record Sale"
      maxWidth="max-w-lg"
      panelClassName="p-4 space-y-4 max-h-[90vh] overflow-y-auto"
    >
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <Select
          label="Product"
          name="productId"
          value={formData.productId}
          onChange={handleChange}
          options={productOptions}
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
            options={sizeOptions.length ? sizeOptions : MERCHANDISE_SIZE_OPTIONS}
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
        <Input
          label="Buyer Name"
          name="buyerName"
          value={formData.buyerName}
          onChange={handleChange}
          placeholder="Optional"
        />
        <Input
          label="Phone Number"
          name="phoneNumber"
          value={formData.phoneNumber}
          onChange={handleChange}
          placeholder="Optional"
        />
        <Select
          label="Payment Status"
          name="paymentStatus"
          value={formData.paymentStatus}
          onChange={handleChange}
          options={PAYMENT_STATUS_OPTIONS}
        />

        {error ? <p className="text-rose-400 text-[11px]">{error}</p> : null}

        <div className="flex justify-end gap-2 pt-2 border-t border-slate-700">
          <Button type="button" variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isSubmitting} disabled={isSubmitting}>
            Record Sale
          </Button>
        </div>
      </form>
    </Modal>
  );
}
