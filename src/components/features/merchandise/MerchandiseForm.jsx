import { useEffect, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';
import ImageUploadField from '@/components/common/ImageUploadField';
import {
  ACCEPTED_MERCHANDISE_IMAGE_ACCEPT,
  MERCHANDISE_CATEGORY_OPTIONS,
  MERCHANDISE_COLOUR_OPTIONS,
  MERCHANDISE_SIZE_OPTIONS,
  MAX_MERCHANDISE_IMAGES,
  PRODUCT_STATUS_OPTIONS,
  mapMerchandiseToFormData,
  validateMerchandiseForm,
  validateMerchandiseImageFile,
} from '@/config/merchandiseOptions';

function buildCategoryOptions(currentValue, customCategories = []) {
  const values = new Set([
    ...MERCHANDISE_CATEGORY_OPTIONS.map((option) => option.value),
    ...customCategories,
    currentValue,
  ].filter(Boolean));

  return Array.from(values).map((value) => ({ value, label: value }));
}

function buildColourOptions(currentValue, customColours = []) {
  const values = new Set([
    ...MERCHANDISE_COLOUR_OPTIONS.map((option) => option.value),
    ...customColours,
    currentValue,
  ].filter(Boolean));

  return Array.from(values).map((value) => ({ value, label: value }));
}

export default function MerchandiseForm({
  isOpen,
  onClose,
  onSubmit,
  initialData = null,
  customCategories = [],
  customColours = [],
}) {
  const isEditing = Boolean(initialData);
  const [formData, setFormData] = useState(mapMerchandiseToFormData(initialData));
  const [imageFiles, setImageFiles] = useState([]);
  const [removedImagePaths, setRemovedImagePaths] = useState([]);
  const [primaryFile, setPrimaryFile] = useState(null);
  const [formError, setFormError] = useState('');
  const [imageError, setImageError] = useState('');
  const [customCategory, setCustomCategory] = useState('');
  const [customColour, setCustomColour] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setFormData(mapMerchandiseToFormData(initialData));
    setImageFiles([]);
    setRemovedImagePaths([]);
    setPrimaryFile(null);
    setFormError('');
    setImageError('');
    setCustomCategory('');
    setCustomColour('');
    setIsSubmitting(false);
  }, [isOpen, initialData]);

  const visibleImages = (formData.images || []).filter(
    (image) => !removedImagePaths.includes(String(image.storagePath || '').trim()),
  );

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleVariantChange = (index, field, value) => {
    setFormData((prev) => {
      const variants = [...(prev.variants || [])];
      variants[index] = { ...variants[index], [field]: value };
      return { ...prev, variants };
    });
  };

  const addVariantRow = () => {
    setFormData((prev) => ({
      ...prev,
      variants: [...(prev.variants || []), { colour: 'Black', size: 'M', quantity: '0' }],
    }));
  };

  const removeVariantRow = (index) => {
    setFormData((prev) => ({
      ...prev,
      variants: (prev.variants || []).filter((_, i) => i !== index),
    }));
  };

  const handlePrimarySelect = (file) => {
    const message = validateMerchandiseImageFile(file);
    if (message) {
      setImageError(message);
      return;
    }
    setImageError('');
    setPrimaryFile(file);
  };

  const handleAdditionalFiles = (event) => {
    const files = Array.from(event.target.files || []);
    event.target.value = '';
    if (!files.length) return;

    for (const file of files) {
      const message = validateMerchandiseImageFile(file);
      if (message) {
        setImageError(message);
        return;
      }
    }

    setImageError('');
    setImageFiles((prev) => [...prev, ...files].slice(0, MAX_MERCHANDISE_IMAGES));
  };

  const removeExistingImage = (storagePath) => {
    setRemovedImagePaths((prev) => [...prev, storagePath]);
  };

  const applyCustomCategory = () => {
    const value = customCategory.trim();
    if (!value) return;
    setFormData((prev) => ({ ...prev, category: value }));
    setCustomCategory('');
  };

  const applyCustomColour = (index) => {
    const value = customColour.trim();
    if (!value) return;
    handleVariantChange(index, 'colour', value);
    setCustomColour('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFormError('');

    const nextFiles = primaryFile ? [primaryFile, ...imageFiles] : imageFiles;
    const hasImage = visibleImages.length > 0 || nextFiles.length > 0;

    const validationMessage = validateMerchandiseForm(
      {
        ...formData,
        images: hasImage ? [{ url: 'https://placeholder.local/image' }] : [],
      },
      { requireImage: !isEditing },
    );

    if (!isEditing && !nextFiles.length) {
      setFormError('At least one product image is required.');
      return;
    }

    if (isEditing && !visibleImages.length && !nextFiles.length) {
      setFormError('At least one product image is required.');
      return;
    }

    if (validationMessage && validationMessage !== 'At least one product image is required.') {
      setFormError(validationMessage);
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({
        formData: { ...formData, images: visibleImages },
        imageFiles: nextFiles,
        removedImagePaths,
      });
    } catch (error) {
      setFormError(error.message || 'Unable to save merchandise.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Edit Merchandise' : 'Add Merchandise'}
      maxWidth="max-w-3xl"
      panelClassName="p-4 md:p-5 space-y-4 max-h-[90vh] overflow-y-auto"
    >
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Product Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            placeholder="e.g. Classic Church Tee"
          />
          <div className="space-y-2">
            <Select
              label="Category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              options={buildCategoryOptions(formData.category, customCategories)}
            />
            <div className="flex gap-2">
              <input
                type="text"
                value={customCategory}
                onChange={(event) => setCustomCategory(event.target.value)}
                placeholder="New category…"
                className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
              <Button type="button" variant="outline" className="!py-2 !shadow-none" onClick={applyCustomCategory}>
                Add
              </Button>
            </div>
          </div>
        </div>

        <div>
          <label htmlFor="merchandise-description" className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
            Description
          </label>
          <textarea
            id="merchandise-description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={4}
            placeholder="Product details, materials, notes…"
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 resize-y min-h-[100px]"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Input
            label="Selling Price (R)"
            name="sellingPrice"
            type="number"
            min="0"
            step="0.01"
            value={formData.sellingPrice}
            onChange={handleChange}
            required
          />
          <Input
            label="Cost Price (R)"
            name="costPrice"
            type="number"
            min="0"
            step="0.01"
            value={formData.costPrice}
            onChange={handleChange}
            placeholder="Optional"
          />
          <Input
            label="Supplier"
            name="supplier"
            value={formData.supplier}
            onChange={handleChange}
            placeholder="Optional"
          />
        </div>

        <Select
          label="Product Status"
          name="status"
          value={formData.status}
          onChange={handleChange}
          options={PRODUCT_STATUS_OPTIONS}
        />

        <div className="space-y-3">
          <div className="flex items-center justify-between gap-2">
            <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider">Variants</h4>
            <Button type="button" variant="outline" className="!py-1.5 !px-3 !shadow-none" icon={Plus} onClick={addVariantRow}>
              Add Variant
            </Button>
          </div>

          <div className="space-y-3">
            {(formData.variants || []).map((variant, index) => (
              <div key={`variant-${index}`} className="grid grid-cols-1 sm:grid-cols-4 gap-2 p-3 rounded-lg bg-slate-900/60 border border-slate-700/70">
                <Select
                  label="Colour"
                  value={variant.colour}
                  onChange={(event) => handleVariantChange(index, 'colour', event.target.value)}
                  options={buildColourOptions(variant.colour, customColours)}
                />
                <Select
                  label="Size"
                  value={variant.size}
                  onChange={(event) => handleVariantChange(index, 'size', event.target.value)}
                  options={MERCHANDISE_SIZE_OPTIONS}
                />
                <Input
                  label="Quantity"
                  type="number"
                  min="0"
                  value={variant.quantity}
                  onChange={(event) => handleVariantChange(index, 'quantity', event.target.value)}
                />
                <div className="flex items-end">
                  <Button
                    type="button"
                    variant="danger"
                    className="!py-2 w-full !shadow-none"
                    icon={Trash2}
                    onClick={() => removeVariantRow(index)}
                    disabled={(formData.variants || []).length <= 1}
                  >
                    Remove
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={customColour}
              onChange={(event) => setCustomColour(event.target.value)}
              placeholder="New colour…"
              className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
            />
            <Button
              type="button"
              variant="outline"
              className="!py-2 !shadow-none"
              onClick={() => applyCustomColour(0)}
            >
              Add Colour
            </Button>
          </div>
        </div>

        <div className="space-y-3">
          <ImageUploadField
            label={isEditing ? 'Add / Replace Primary Image' : 'Product Image'}
            existingImageUrl={visibleImages[0]?.url || ''}
            selectedFile={primaryFile}
            onFileSelect={handlePrimarySelect}
            onRemove={() => {
              setPrimaryFile(null);
              if (visibleImages[0]?.storagePath) {
                removeExistingImage(visibleImages[0].storagePath);
              }
            }}
            accept={ACCEPTED_MERCHANDISE_IMAGE_ACCEPT}
            maxSizeMB={5}
            previewShape="square"
            previewName={formData.name || 'Merchandise'}
            helperText="JPG, PNG, or WEBP up to 5 MB. Up to 5 images per product."
            error={imageError}
            disabled={isSubmitting}
            loading={isSubmitting}
          />

          {visibleImages.length > 1 && (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {visibleImages.slice(1).map((image) => (
                <div key={image.storagePath || image.url} className="relative aspect-square rounded-lg overflow-hidden border border-slate-700">
                  <img src={image.url} alt="" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    className="absolute inset-x-0 bottom-0 bg-slate-950/80 text-[10px] text-rose-300 py-1"
                    onClick={() => removeExistingImage(image.storagePath)}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}

          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
              Additional Images
            </label>
            <input
              type="file"
              accept={ACCEPTED_MERCHANDISE_IMAGE_ACCEPT}
              multiple
              onChange={handleAdditionalFiles}
              disabled={isSubmitting}
              className="block w-full text-xs text-slate-400 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:bg-slate-700 file:text-white"
            />
            {imageFiles.length > 0 && (
              <p className="text-[11px] text-slate-400 mt-1">{imageFiles.length} additional file(s) selected</p>
            )}
          </div>
        </div>

        {formError ? <p className="text-rose-400 text-[11px]">{formError}</p> : null}

        <div className="flex justify-end gap-2 pt-2 border-t border-slate-700">
          <Button type="button" variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isSubmitting} disabled={isSubmitting}>
            {isEditing ? 'Save Changes' : 'Add Product'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
