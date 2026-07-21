import { useEffect, useState } from 'react';
import { Plane } from 'lucide-react';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import ImageUploadField from '@/components/common/ImageUploadField';
import { TRAVEL_COUNTRY_OPTIONS } from '@/config/travelCountryOptions';
import {
  TRAVEL_EXTENT,
  TRAVEL_EXTENT_OPTIONS,
  RECOMMENDED_TRANSPORT_OPTIONS,
  VISA_REQUIRED_OPTIONS,
  ACCEPTED_TRAVEL_IMAGE_ACCEPT,
  mapTravelDestinationToFormData,
  validateTravelDestinationFieldErrors,
  validateTravelImageFile,
} from '@/config/travellingOptions';
import { getTravelStorageErrorMessage } from '@/config/travellingImageValidation';
import { resolveTravelDestinationImageStoragePath } from '@/utils/storagePathUtils';
import { getDestinationImageUrl, getDestinationImageAlt } from '@/config/travellingDisplay';

function clearExtentSpecificFields(travelExtent) {
  if (travelExtent === TRAVEL_EXTENT.INTERNATIONAL) {
    return { townCity: '', recommendedTransport: '' };
  }

  return { country: '', visaRequired: '' };
}

export default function TravellingForm({
  isOpen,
  onClose,
  onSubmit,
  initialData = null,
  defaultTravelExtent = TRAVEL_EXTENT.INTERNATIONAL,
}) {
  const [formData, setFormData] = useState(mapTravelDestinationToFormData(null));
  const [fieldErrors, setFieldErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [removeImage, setRemoveImage] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    const mapped = initialData
      ? mapTravelDestinationToFormData(initialData)
      : { ...mapTravelDestinationToFormData(null), travelExtent: defaultTravelExtent };

    setFormData(mapped);
    setImageFile(null);
    setRemoveImage(false);
    setFieldErrors({});
    setFormError('');
    setIsSubmitting(false);
  }, [defaultTravelExtent, initialData, isOpen]);

  const isInternational = formData.travelExtent === TRAVEL_EXTENT.INTERNATIONAL;
  const isEditing = Boolean(initialData?.id);

  const handleChange = (event) => {
    const { name, value } = event.target;

    if (name === 'travelExtent') {
      setFormData((prev) => ({
        ...prev,
        travelExtent: value,
        ...clearExtentSpecificFields(value),
      }));
      setFieldErrors((prev) => ({
        ...prev,
        travelExtent: '',
        country: '',
        visaRequired: '',
        townCity: '',
        recommendedTransport: '',
      }));
      return;
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
    setFieldErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleImageSelect = (file) => {
    const validationMessage = validateTravelImageFile(file);
    if (validationMessage) {
      setFieldErrors((prev) => ({ ...prev, image: validationMessage }));
      setImageFile(null);
      return;
    }

    setFieldErrors((prev) => ({ ...prev, image: '' }));
    setImageFile(file);
    setRemoveImage(false);
  };

  const handleImageRemove = () => {
    setImageFile(null);
    setRemoveImage(true);
    setFieldErrors((prev) => ({ ...prev, image: '' }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFormError('');

    const errors = validateTravelDestinationFieldErrors(formData);
    if (imageFile) {
      const imageValidation = validateTravelImageFile(imageFile);
      if (imageValidation) errors.image = imageValidation;
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setFieldErrors({});
    setIsSubmitting(true);

    try {
      const previousImagePath =
        formData.imageStoragePath
        || initialData?.imageStoragePath
        || resolveTravelDestinationImageStoragePath(formData)
        || resolveTravelDestinationImageStoragePath(initialData)
        || '';

      await onSubmit({
        formData: {
          ...formData,
          imageUrl: removeImage ? '' : formData.imageUrl,
          imageStoragePath: removeImage ? '' : formData.imageStoragePath,
          previousImagePath:
            removeImage || imageFile ? previousImagePath : '',
        },
        imageFile: removeImage ? null : imageFile,
        removeImage,
      });
    } catch (submitError) {
      setFormError(
        getTravelStorageErrorMessage(submitError)
          || submitError?.message
          || 'Failed to save travel destination. Please try again.',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const existingImageUrl =
    !removeImage && !imageFile
      ? formData.imageUrl || getDestinationImageUrl(initialData)
      : '';

  const previewName = isInternational
    ? formData.country || getDestinationImageAlt(initialData)
    : formData.townCity || getDestinationImageAlt(initialData);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Edit Travel Location' : 'Add Travel Location'}
      icon={Plane}
      maxWidth="max-w-lg"
    >
      <form onSubmit={handleSubmit} className="space-y-3">
        <Select
          label="Travel Extent"
          name="travelExtent"
          value={formData.travelExtent}
          onChange={handleChange}
          options={TRAVEL_EXTENT_OPTIONS}
          required
          error={fieldErrors.travelExtent}
        />

        <ImageUploadField
          label="Destination Image"
          existingImageUrl={existingImageUrl}
          selectedFile={imageFile}
          onFileSelect={handleImageSelect}
          onRemove={handleImageRemove}
          accept={ACCEPTED_TRAVEL_IMAGE_ACCEPT}
          maxSizeMB={5}
          previewShape="square"
          previewName={previewName || 'Destination'}
          helperText="JPG, PNG, or WEBP up to 5 MB. Permanent URLs are saved after upload."
          error={fieldErrors.image}
          disabled={isSubmitting}
          loading={isSubmitting}
        />

        {isInternational ? (
          <>
            <Select
              label="Country"
              name="country"
              value={formData.country}
              onChange={handleChange}
              options={TRAVEL_COUNTRY_OPTIONS}
              placeholder="Select a country"
              required
              error={fieldErrors.country}
            />
            <Select
              label="Visa Required for South African Citizens"
              name="visaRequired"
              value={formData.visaRequired}
              onChange={handleChange}
              options={VISA_REQUIRED_OPTIONS}
              placeholder="Select yes or no"
              required
              error={fieldErrors.visaRequired}
            />
            <Input
              label="Estimated Distance from Cape Town (km)"
              name="distanceFromCapeTownKm"
              type="number"
              min="0"
              step="1"
              value={formData.distanceFromCapeTownKm}
              onChange={handleChange}
              placeholder="Optional"
              error={fieldErrors.distanceFromCapeTownKm}
            />
            <Input
              label="Estimated Return Flight Cost (ZAR)"
              name="estimatedCostZar"
              type="number"
              min="0"
              step="1"
              value={formData.estimatedCostZar}
              onChange={handleChange}
              placeholder="Optional"
              error={fieldErrors.estimatedCostZar}
            />
          </>
        ) : (
          <>
            <Input
              label="Town / City"
              name="townCity"
              value={formData.townCity}
              onChange={handleChange}
              placeholder="e.g. George"
              required
              error={fieldErrors.townCity}
            />
            <Input
              label="Distance from Cape Town (km)"
              name="distanceFromCapeTownKm"
              type="number"
              min="0"
              step="1"
              value={formData.distanceFromCapeTownKm}
              onChange={handleChange}
              placeholder="Optional"
              error={fieldErrors.distanceFromCapeTownKm}
            />
            <Select
              label="Recommended Form of Transportation"
              name="recommendedTransport"
              value={formData.recommendedTransport}
              onChange={handleChange}
              options={RECOMMENDED_TRANSPORT_OPTIONS}
              placeholder="Select transport"
              required
              error={fieldErrors.recommendedTransport}
            />
            <Input
              label="Estimated Return Travel Cost (ZAR)"
              name="estimatedCostZar"
              type="number"
              min="0"
              step="1"
              value={formData.estimatedCostZar}
              onChange={handleChange}
              placeholder="Optional"
              error={fieldErrors.estimatedCostZar}
            />
          </>
        )}

        {formError && (
          <p role="alert" className="text-rose-400 text-[11px]">
            {formError}
          </p>
        )}

        <div className="flex justify-end gap-2 pt-2 border-t border-slate-700">
          <Button type="button" variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isSubmitting} disabled={isSubmitting}>
            {isEditing ? 'Save Changes' : 'Add Location'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
