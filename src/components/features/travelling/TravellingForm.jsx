import { useEffect, useRef, useState } from 'react';
import { Plane } from 'lucide-react';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
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
import { getDestinationImageUrl, getDestinationImageAlt } from '@/config/travellingDisplay';
import { DestinationImage } from '@/components/features/travelling/TravellingCardGrid';

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
  const fileInputRef = useRef(null);
  const [formData, setFormData] = useState(mapTravelDestinationToFormData(null));
  const [fieldErrors, setFieldErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [removeImage, setRemoveImage] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    const mapped = initialData
      ? mapTravelDestinationToFormData(initialData)
      : { ...mapTravelDestinationToFormData(null), travelExtent: defaultTravelExtent };

    setFormData(mapped);
    setImageFile(null);
    setImagePreview(getDestinationImageUrl(initialData));
    setRemoveImage(false);
    setFieldErrors({});
    setFormError('');
    setIsSubmitting(false);
    setIsUploading(false);
  }, [defaultTravelExtent, initialData, isOpen]);

  const isInternational = formData.travelExtent === TRAVEL_EXTENT.INTERNATIONAL;
  const isEditing = Boolean(initialData);
  const hasImagePreview = Boolean(!removeImage && imagePreview);

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

  const handleImageChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const validationMessage = validateTravelImageFile(file);
    if (validationMessage) {
      setFieldErrors((prev) => ({ ...prev, image: validationMessage }));
      event.target.value = '';
      return;
    }

    setFieldErrors((prev) => ({ ...prev, image: '' }));
    setImageFile(file);
    setRemoveImage(false);

    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview('');
    setRemoveImage(true);
    setFormData((prev) => ({ ...prev, imageUrl: '', imageStoragePath: '' }));

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleReplaceImage = () => {
    fileInputRef.current?.click();
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
    setIsUploading(Boolean(imageFile));

    try {
      await onSubmit({
        formData: {
          ...formData,
          imageUrl: removeImage ? '' : formData.imageUrl,
          imageStoragePath: removeImage ? '' : formData.imageStoragePath,
        },
        imageFile: removeImage ? null : imageFile,
        removeImage,
      });
    } catch (submitError) {
      setFormError(submitError?.message || 'Failed to save travel destination. Please try again.');
    } finally {
      setIsSubmitting(false);
      setIsUploading(false);
    }
  };

  const previewDestination = {
    travelExtent: formData.travelExtent,
    imageUrl: removeImage ? '' : imagePreview,
    country: formData.country,
    townCity: formData.townCity,
  };

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

        <div>
          <label className="block text-slate-400 mb-1 text-xs">Destination Image</label>
          <div className="rounded-lg border border-slate-700 bg-slate-900 p-3 space-y-3">
            {hasImagePreview ? (
              <img
                src={imagePreview}
                alt={getDestinationImageAlt(previewDestination)}
                className="w-full aspect-[16/10] rounded-lg object-cover bg-slate-800"
              />
            ) : (
              <DestinationImage destination={previewDestination} className="w-full aspect-[16/10] rounded-lg" />
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept={ACCEPTED_TRAVEL_IMAGE_ACCEPT}
              onChange={handleImageChange}
              className="hidden"
            />

            <div className="flex flex-wrap gap-2">
              {!hasImagePreview ? (
                <Button type="button" variant="secondary" onClick={handleReplaceImage}>
                  Upload Image
                </Button>
              ) : (
                <>
                  <Button type="button" variant="secondary" onClick={handleReplaceImage}>
                    Replace Image
                  </Button>
                  <Button type="button" variant="outline" onClick={handleRemoveImage}>
                    Remove Image
                  </Button>
                </>
              )}
            </div>
            <p className="text-[11px] text-slate-400">
              JPG, JPEG, PNG, or WEBP up to 5 MB. Preview only — permanent URLs are saved after upload.
            </p>
            {fieldErrors.image && (
              <p role="alert" className="text-rose-400 text-[10px]">
                {fieldErrors.image}
              </p>
            )}
          </div>
        </div>

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
            {isUploading ? 'Uploading...' : isEditing ? 'Save Changes' : 'Add Location'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
