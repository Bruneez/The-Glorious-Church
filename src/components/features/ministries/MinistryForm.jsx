import { useEffect, useState } from 'react';
import { Church } from 'lucide-react';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import ImageUploadField from '@/components/common/ImageUploadField';
import {
  MINISTRY_STATUS,
  MINISTRY_STATUS_OPTIONS,
  ACCEPTED_MINISTRY_AVATAR_ACCEPT,
  getMinistryAvatar,
  mapMinistryToFormData,
  validateMinistryAvatarFile,
} from '@/config/ministriesOptions';
import { getMinistryStorageErrorMessage } from '@/config/ministriesAvatarValidation';
import { resolveMinistryAvatarStoragePath } from '@/utils/storagePathUtils';
import { uploadMinistryAvatar, deleteMinistryAvatar } from '@/services/storageService';

const EMPTY_FORM = {
  ministryName: '',
  ministryLeader: '',
  description: '',
  status: MINISTRY_STATUS.ACTIVE,
  avatarUrl: '',
  avatarPath: '',
};

export default function MinistryForm({ isOpen, onClose, onSubmit, initialData = null }) {
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [avatarFile, setAvatarFile] = useState(null);
  const [removeAvatar, setRemoveAvatar] = useState(false);
  const [avatarError, setAvatarError] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEditing = Boolean(initialData?.id);

  useEffect(() => {
    if (!isOpen) return;

    setFormData(mapMinistryToFormData(initialData));
    setAvatarFile(null);
    setRemoveAvatar(false);
    setAvatarError('');
    setError('');
    setIsSubmitting(false);
  }, [initialData, isOpen]);

  const rollbackUploadedAvatar = async (avatarPath) => {
    if (!avatarPath) return;

    try {
      await deleteMinistryAvatar(avatarPath);
    } catch {
      // Non-blocking rollback failure.
    }
  };

  const handleAvatarSelect = (file) => {
    const validationMessage = validateMinistryAvatarFile(file);
    if (validationMessage) {
      setAvatarError(validationMessage);
      setAvatarFile(null);
      return;
    }

    setAvatarError('');
    setAvatarFile(file);
    setRemoveAvatar(false);
  };

  const handleAvatarRemove = () => {
    setAvatarFile(null);
    setRemoveAvatar(true);
    setAvatarError('');
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setAvatarError('');

    if (!formData.ministryName.trim()) {
      setError('Ministry name is required.');
      return;
    }

    if (avatarFile) {
      const validationMessage = validateMinistryAvatarFile(avatarFile);
      if (validationMessage) {
        setAvatarError(validationMessage);
        return;
      }
    }

    setIsSubmitting(true);

    let uploadedAvatarPath = '';

    try {
      const previousAvatarPath =
        formData.avatarPath
        || initialData?.avatarPath
        || resolveMinistryAvatarStoragePath(formData)
        || resolveMinistryAvatarStoragePath(initialData)
        || '';
      let nextAvatarUrl = formData.avatarUrl;
      let nextAvatarPath = formData.avatarPath;

      if (removeAvatar) {
        nextAvatarUrl = '';
        nextAvatarPath = '';
      } else if (avatarFile) {
        const uploadedAvatar = await uploadMinistryAvatar(avatarFile);
        nextAvatarUrl = uploadedAvatar.avatarUrl;
        nextAvatarPath = uploadedAvatar.avatarPath;
        uploadedAvatarPath = uploadedAvatar.avatarPath;
      }

      await onSubmit({
        ...formData,
        avatarUrl: nextAvatarUrl,
        avatarPath: nextAvatarPath,
        removeAvatar,
        previousAvatarPath:
          removeAvatar || avatarFile ? previousAvatarPath : '',
      });
    } catch (submitError) {
      await rollbackUploadedAvatar(uploadedAvatarPath);
      setError(
        getMinistryStorageErrorMessage(submitError)
          || submitError?.message
          || 'Failed to save ministry. Please try again.',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const existingAvatarUrl =
    !removeAvatar && !avatarFile
      ? formData.avatarUrl || getMinistryAvatar(initialData)
      : '';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Edit Ministry' : 'Add Ministry'}
      icon={Church}
      maxWidth="max-w-lg"
    >
      <form onSubmit={handleSubmit} className="space-y-3">
        <ImageUploadField
          label="Ministry Avatar / Icon"
          existingImageUrl={existingAvatarUrl}
          selectedFile={avatarFile}
          onFileSelect={handleAvatarSelect}
          onRemove={handleAvatarRemove}
          accept={ACCEPTED_MINISTRY_AVATAR_ACCEPT}
          maxSizeMB={5}
          previewShape="circle"
          previewName={formData.ministryName || 'Ministry'}
          helperText="JPG, PNG, or WEBP up to 5 MB. Optional — images display in a circular avatar."
          error={avatarError}
          disabled={isSubmitting}
          loading={isSubmitting}
        />

        <Input
          label="Ministry Name"
          name="ministryName"
          value={formData.ministryName}
          onChange={handleChange}
          placeholder="e.g. Ushering Ministry"
          required
        />

        <Input
          label="Ministry Leader"
          name="ministryLeader"
          value={formData.ministryLeader}
          onChange={handleChange}
          placeholder="Leader name"
        />

        <div>
          <label htmlFor="description" className="block text-slate-400 mb-1 font-medium text-xs">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={3}
            placeholder="Describe the ministry's purpose and focus..."
            className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-indigo-500 resize-none text-xs"
          />
        </div>

        <Select
          label="Status"
          name="status"
          value={formData.status}
          onChange={handleChange}
          options={MINISTRY_STATUS_OPTIONS}
          required
        />

        {error && <p className="text-rose-400 text-[11px] font-medium">{error}</p>}

        <div className="flex justify-end gap-2 pt-2 border-t border-slate-700">
          <Button type="button" variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isSubmitting} disabled={isSubmitting}>
            {isEditing ? 'Save Changes' : 'Add Ministry'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
