import { useEffect, useState } from 'react';
import { School } from 'lucide-react';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import ImageUploadField from '@/components/common/ImageUploadField';
import {
  SCHOOL_STATUS,
  SCHOOL_STATUS_OPTIONS,
  SCHOOL_TYPE_OPTIONS,
  ACCEPTED_SCHOOL_BADGE_ACCEPT,
  getSchoolBadge,
  mapSchoolToFormData,
  validateSchoolBadgeFile,
  validateSchoolForm,
} from '@/config/schoolsOptions';
import { resolveSchoolBadgeStoragePath } from '@/utils/storagePathUtils';
import { uploadSchoolBadge, deleteSchoolLogo } from '@/services/storageService';
import { getStorageErrorMessage } from '@/utils/storageErrors';

const EMPTY_FORM = {
  name: '',
  type: '',
  address: '',
  status: SCHOOL_STATUS.ACTIVE,
  badgeUrl: '',
  badgePath: '',
};

export default function SchoolsForm({ isOpen, onClose, onSubmit, initialData = null, defaultType = '' }) {
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [badgeFile, setBadgeFile] = useState(null);
  const [removeBadge, setRemoveBadge] = useState(false);
  const [badgeError, setBadgeError] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEditing = Boolean(initialData?.id);

  useEffect(() => {
    if (!isOpen) return;

    if (isEditing) {
      setFormData(mapSchoolToFormData(initialData));
    } else {
      setFormData({
        ...EMPTY_FORM,
        type: defaultType || '',
      });
    }

    setBadgeFile(null);
    setRemoveBadge(false);
    setBadgeError('');
    setError('');
    setIsSubmitting(false);
  }, [defaultType, initialData, isEditing, isOpen]);

  const rollbackUploadedBadge = async (badgePath) => {
    if (!badgePath) return;

    try {
      await deleteSchoolLogo(badgePath);
    } catch (rollbackError) {
      console.warn('Failed to roll back uploaded school badge:', rollbackError);
    }
  };

  const handleBadgeSelect = (file) => {
    const validationMessage = validateSchoolBadgeFile(file);
    if (validationMessage) {
      setBadgeError(validationMessage);
      setBadgeFile(null);
      return;
    }

    setBadgeError('');
    setBadgeFile(file);
    setRemoveBadge(false);
  };

  const handleBadgeRemove = () => {
    setBadgeFile(null);
    setRemoveBadge(true);
    setBadgeError('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setBadgeError('');

    const validationError = validateSchoolForm(formData);
    if (validationError) {
      setError(validationError);
      return;
    }

    if (badgeFile) {
      const badgeValidationError = validateSchoolBadgeFile(badgeFile);
      if (badgeValidationError) {
        setBadgeError(badgeValidationError);
        return;
      }
    }

    setIsSubmitting(true);

    let uploadedBadgePath = '';

    try {
      const previousBadgePath =
        formData.badgePath
        || initialData?.badgePath
        || resolveSchoolBadgeStoragePath(formData)
        || resolveSchoolBadgeStoragePath(initialData)
        || '';
      let nextBadgeUrl = formData.badgeUrl;
      let nextBadgePath = formData.badgePath;

      if (removeBadge) {
        nextBadgeUrl = '';
        nextBadgePath = '';
      } else if (badgeFile) {
        const uploadedBadge = await uploadSchoolBadge(badgeFile);
        nextBadgeUrl = uploadedBadge.badgeUrl;
        nextBadgePath = uploadedBadge.badgePath;
        uploadedBadgePath = uploadedBadge.badgePath;
      }

      await onSubmit({
        name: formData.name.trim(),
        type: formData.type,
        address: formData.address.trim(),
        status: formData.status,
        badgeUrl: nextBadgeUrl,
        badgePath: nextBadgePath,
        logo: nextBadgeUrl,
        removeBadge,
        previousBadgePath:
          removeBadge || badgeFile ? previousBadgePath : '',
      });
    } catch (submitError) {
      await rollbackUploadedBadge(uploadedBadgePath);
      setError(
        getStorageErrorMessage(submitError)
          || submitError?.message
          || 'Failed to save school. Please try again.',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const existingBadgeUrl =
    !removeBadge && !badgeFile
      ? formData.badgeUrl || getSchoolBadge(initialData)
      : '';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Edit School' : 'Add School'}
      icon={School}
      maxWidth="max-w-lg"
    >
      <form onSubmit={handleSubmit} className="space-y-3">
        <ImageUploadField
          label="School Badge / Logo"
          existingImageUrl={existingBadgeUrl}
          selectedFile={badgeFile}
          onFileSelect={handleBadgeSelect}
          onRemove={handleBadgeRemove}
          accept={ACCEPTED_SCHOOL_BADGE_ACCEPT}
          maxSizeMB={5}
          previewShape="circle"
          previewName={formData.name || 'School'}
          helperText="JPG, PNG, or WEBP up to 5 MB. Images keep their aspect ratio inside a circular avatar."
          error={badgeError}
          disabled={isSubmitting}
          loading={isSubmitting}
        />

        <Input
          label="School Name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="e.g. Sunshine Primary School"
          required
        />

        <Select
          label="School Type"
          name="type"
          value={formData.type}
          onChange={handleChange}
          options={SCHOOL_TYPE_OPTIONS}
          placeholder="Select school type"
          required
        />

        <Input
          label="Address"
          name="address"
          value={formData.address}
          onChange={handleChange}
          placeholder="123 Main Street, Suburb"
        />

        <Select
          label="Status"
          name="status"
          value={formData.status}
          onChange={handleChange}
          options={SCHOOL_STATUS_OPTIONS}
          placeholder="Select status"
          required
        />

        {error && <p className="text-rose-400 text-[11px] font-medium">{error}</p>}

        <div className="flex justify-end gap-2 pt-2 border-t border-slate-700">
          <Button type="button" variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isSubmitting}>
            {isEditing ? 'Save Changes' : 'Add School'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
