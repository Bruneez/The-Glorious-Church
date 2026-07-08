import { useEffect, useRef, useState } from 'react';
import { School } from 'lucide-react';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import UserAvatar from '@/components/ui/UserAvatar';
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
import { uploadSchoolBadge } from '@/services/storageService';

const EMPTY_FORM = {
  name: '',
  type: '',
  address: '',
  status: SCHOOL_STATUS.ACTIVE,
  badgeUrl: '',
  badgePath: '',
};

export default function SchoolsForm({ isOpen, onClose, onSubmit, initialData = null, defaultType = '' }) {
  const fileInputRef = useRef(null);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [badgeFile, setBadgeFile] = useState(null);
  const [badgePreview, setBadgePreview] = useState('');
  const [removeBadge, setRemoveBadge] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEditing = Boolean(initialData?.id);

  useEffect(() => {
    if (!isOpen) return;

    if (isEditing) {
      setFormData(mapSchoolToFormData(initialData));
      setBadgePreview(getSchoolBadge(initialData));
    } else {
      setFormData({
        ...EMPTY_FORM,
        type: defaultType || '',
      });
      setBadgePreview('');
    }

    setBadgeFile(null);
    setRemoveBadge(false);
    setError('');
    setIsSubmitting(false);
  }, [defaultType, initialData, isEditing, isOpen]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    const validationError = validateSchoolForm(formData);
    if (validationError) {
      setError(validationError);
      return;
    }

    if (badgeFile) {
      const badgeValidationError = validateSchoolBadgeFile(badgeFile);
      if (badgeValidationError) {
        setError(badgeValidationError);
        return;
      }
    }

    setIsSubmitting(true);

    try {
      let nextBadgeUrl = formData.badgeUrl;
      let nextBadgePath = formData.badgePath;

      if (removeBadge) {
        nextBadgeUrl = '';
        nextBadgePath = '';
      } else if (badgeFile) {
        const uploadedBadge = await uploadSchoolBadge(badgeFile);
        nextBadgeUrl = uploadedBadge.badgeUrl;
        nextBadgePath = uploadedBadge.badgePath;
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
      });

      setIsSubmitting(false);
    } catch (submitError) {
      setError(submitError?.message || 'Failed to save school. Please try again.');
      setIsSubmitting(false);
    }
  };

  const handleBadgeChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const validationMessage = validateSchoolBadgeFile(file);
    if (validationMessage) {
      setError(validationMessage);
      event.target.value = '';
      return;
    }

    setError('');
    setBadgeFile(file);
    setRemoveBadge(false);

    const reader = new FileReader();
    reader.onloadend = () => {
      setBadgePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveBadge = () => {
    setBadgeFile(null);
    setBadgePreview('');
    setRemoveBadge(true);
    setFormData((prev) => ({ ...prev, badgeUrl: '', badgePath: '' }));

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleReplaceBadge = () => {
    fileInputRef.current?.click();
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const hasBadge = Boolean(!removeBadge && badgePreview);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Edit School' : 'Add School'}
      icon={School}
      maxWidth="max-w-lg"
    >
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="block text-slate-400 mb-1 text-xs">School Badge / Logo</label>
          <div className="rounded-lg border border-slate-700 bg-slate-900 p-3 space-y-3">
            <div className="flex items-center gap-3">
              <UserAvatar name={formData.name || 'School'} photo={hasBadge ? badgePreview : ''} size="lg" />
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-white">
                  {hasBadge ? 'School badge uploaded' : 'No badge uploaded'}
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  JPG, PNG, or WEBP. Images keep their aspect ratio inside a circular avatar.
                </p>
              </div>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept={ACCEPTED_SCHOOL_BADGE_ACCEPT}
              onChange={handleBadgeChange}
              className="hidden"
            />

            <div className="flex flex-wrap gap-2">
              {!hasBadge ? (
                <Button type="button" variant="secondary" onClick={handleReplaceBadge}>
                  Upload School Badge
                </Button>
              ) : (
                <>
                  <Button type="button" variant="secondary" onClick={handleReplaceBadge}>
                    Replace Badge
                  </Button>
                  <Button type="button" variant="outline" onClick={handleRemoveBadge}>
                    Remove Badge
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>

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
