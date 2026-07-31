import { useEffect, useRef, useState } from 'react';
import { Bus } from 'lucide-react';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import ImageUploadField from '@/components/common/ImageUploadField';
import {
  TRANSPORT_STATUS,
  TRANSPORT_STATUS_OPTIONS,
  ACCEPTED_TRANSPORT_IMAGE_ACCEPT,
  mapTransportToFormData,
  validateTransportForm,
  validateTransportImageFile,
  getVehicleImage,
} from '@/config/transportOptions';
import { getTransportSubmitErrorMessage } from '@/config/transportImageValidation';
import { resolvePreviousTransportVehicleImagePath } from '@/services/transportStorageLifecycle';

export default function TransportForm({
  isOpen,
  onClose,
  onSubmit,
  initialData = null,
  canManage = false,
}) {
  const [formData, setFormData] = useState(mapTransportToFormData(null));
  const [imageFile, setImageFile] = useState(null);
  const [removeImage, setRemoveImage] = useState(false);
  const [imageError, setImageError] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isSubmittingRef = useRef(false);

  useEffect(() => {
    if (!isOpen) return;

    setFormData(mapTransportToFormData(initialData));
    setImageFile(null);
    setRemoveImage(false);
    setImageError('');
    setError('');
    setIsSubmitting(false);
    isSubmittingRef.current = false;
  }, [initialData, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canManage || isSubmittingRef.current || isSubmitting) return;

    setError('');

    const validationError = validateTransportForm(formData);
    if (validationError) {
      setError(validationError);
      return;
    }

    if (imageFile) {
      const imageValidation = validateTransportImageFile(imageFile);
      if (imageValidation) {
        setImageError(imageValidation);
        return;
      }
    }

    setImageError('');
    isSubmittingRef.current = true;
    setIsSubmitting(true);

    try {
      const previousImagePath = resolvePreviousTransportVehicleImagePath(
        { previousImagePath: formData.previousImagePath },
        initialData,
      );

      await onSubmit({
        formData: {
          ...formData,
          vehicleImageUrl: removeImage ? '' : formData.vehicleImageUrl,
          vehicleImageStoragePath: removeImage ? '' : formData.vehicleImageStoragePath,
          previousImagePath: removeImage || imageFile ? previousImagePath : '',
        },
        imageFile: removeImage ? null : imageFile,
        removeImage,
      });
    } catch (submitError) {
      console.error('Failed to save transport record:', submitError);
      setError(getTransportSubmitErrorMessage(submitError));
    } finally {
      isSubmittingRef.current = false;
      setIsSubmitting(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageSelect = (file) => {
    const validationMessage = validateTransportImageFile(file);
    if (validationMessage) {
      setImageError(validationMessage);
      setImageFile(null);
      return;
    }

    setImageError('');
    setImageFile(file);
    setRemoveImage(false);
  };

  const handleImageRemove = () => {
    setImageFile(null);
    setRemoveImage(true);
    setImageError('');
  };

  const existingImageUrl =
    !removeImage && !imageFile
      ? formData.vehicleImageUrl || getVehicleImage(initialData)
      : '';

  if (!canManage) {
    return null;
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData?.id ? 'Edit Driver' : 'Add Driver'}
      icon={Bus}
      maxWidth="max-w-lg"
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-3">
        <ImageUploadField
          label="Driver or Vehicle Photo"
          existingImageUrl={existingImageUrl}
          selectedFile={imageFile}
          onFileSelect={handleImageSelect}
          onRemove={handleImageRemove}
          accept={ACCEPTED_TRANSPORT_IMAGE_ACCEPT}
          maxSizeMB={5}
          previewShape="circle"
          previewName={formData.name || 'Transport'}
          helperText="JPG, PNG, or WEBP up to 5 MB. Optional photo shown on the transport tile."
          error={imageError}
          disabled={isSubmitting}
          loading={isSubmitting}
        />

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
          label="Vehicle"
          name="vehicle"
          value={formData.vehicle}
          onChange={handleChange}
          placeholder="e.g. Toyota Quantum (CA 123 456)"
          required
        />

        <Input
          label="Route"
          name="route"
          value={formData.route}
          onChange={handleChange}
          placeholder="e.g. Route A - CBD to Soweto"
          required
        />

        <Input
          label="Capacity"
          name="capacity"
          type="number"
          min="1"
          value={formData.capacity}
          onChange={handleChange}
          placeholder="e.g. 15"
          required
        />

        <Select
          label="Status"
          name="status"
          value={formData.status}
          onChange={handleChange}
          options={TRANSPORT_STATUS_OPTIONS}
          placeholder="Select Status"
        />

        {error && <p className="text-rose-400 text-[11px]">{error}</p>}

        <div className="flex justify-end gap-2 pt-2 border-t border-slate-700">
          <Button type="button" variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isSubmitting}>
            Save Driver
          </Button>
        </div>
      </form>
    </Modal>
  );
}
