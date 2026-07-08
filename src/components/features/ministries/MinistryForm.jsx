import { useEffect, useRef, useState } from 'react';
import { Church } from 'lucide-react';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import MinistryAvatar from '@/components/features/ministries/MinistryAvatar';
import {
  MINISTRY_STATUS,
  MINISTRY_STATUS_OPTIONS,
  ACCEPTED_MINISTRY_AVATAR_ACCEPT,
  getMinistryAvatar,
  mapMinistryToFormData,
  validateMinistryAvatarFile,
} from '@/config/ministriesOptions';
import { uploadMinistryAvatar } from '@/services/storageService';

const EMPTY_FORM = {
  ministryName: '',
  ministryLeader: '',
  description: '',
  status: MINISTRY_STATUS.ACTIVE,
  avatarUrl: '',
  avatarPath: '',
};

export default function MinistryForm({ isOpen, onClose, onSubmit, initialData = null }) {
  const fileInputRef = useRef(null);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState('');
  const [removeAvatar, setRemoveAvatar] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    setFormData(mapMinistryToFormData(initialData));
    setAvatarFile(null);
    setAvatarPreview(getMinistryAvatar(initialData));
    setRemoveAvatar(false);
    setError('');
    setIsSubmitting(false);
  }, [initialData, isOpen]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAvatarChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const validationMessage = validateMinistryAvatarFile(file);
    if (validationMessage) {
      setError(validationMessage);
      event.target.value = '';
      return;
    }

    setError('');
    setAvatarFile(file);
    setRemoveAvatar(false);

    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveAvatar = () => {
    setAvatarFile(null);
    setAvatarPreview('');
    setRemoveAvatar(true);
    setFormData((prev) => ({ ...prev, avatarUrl: '', avatarPath: '' }));

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleReplaceAvatar = () => {
    fileInputRef.current?.click();
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    if (!formData.ministryName.trim()) {
      setError('Ministry name is required.');
      return;
    }

    if (avatarFile) {
      const validationMessage = validateMinistryAvatarFile(avatarFile);
      if (validationMessage) {
        setError(validationMessage);
        return;
      }
    }

    setIsSubmitting(true);

    try {
      let nextAvatarUrl = formData.avatarUrl;
      let nextAvatarPath = formData.avatarPath;

      if (removeAvatar) {
        nextAvatarUrl = '';
        nextAvatarPath = '';
      } else if (avatarFile) {
        const uploadedAvatar = await uploadMinistryAvatar(avatarFile);
        nextAvatarUrl = uploadedAvatar.avatarUrl;
        nextAvatarPath = uploadedAvatar.avatarPath;
      }

      await onSubmit({
        ...formData,
        avatarUrl: nextAvatarUrl,
        avatarPath: nextAvatarPath,
        removeAvatar,
      });
    } catch (submitError) {
      setError(submitError?.message || 'Failed to save ministry. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const previewMinistry = {
    ministryName: formData.ministryName || 'Ministry',
    avatarUrl: removeAvatar ? '' : avatarPreview,
  };

  const hasAvatar = Boolean(!removeAvatar && avatarPreview);
  const isEditing = Boolean(initialData);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Edit Ministry' : 'Add Ministry'}
      icon={Church}
      maxWidth="max-w-lg"
    >
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="block text-slate-400 mb-1 text-xs">Ministry Avatar / Icon</label>
          <div className="rounded-lg border border-slate-700 bg-slate-900 p-3 space-y-3">
            <div className="flex items-center gap-3">
              <MinistryAvatar ministry={previewMinistry} size="lg" />
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-white">
                  {hasAvatar ? 'Avatar uploaded' : 'No avatar uploaded'}
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  JPG, PNG, or WEBP. Optional — images display in a circular avatar.
                </p>
              </div>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept={ACCEPTED_MINISTRY_AVATAR_ACCEPT}
              onChange={handleAvatarChange}
              className="hidden"
            />

            <div className="flex flex-wrap gap-2">
              {!hasAvatar ? (
                <Button type="button" variant="secondary" onClick={handleReplaceAvatar}>
                  Upload Avatar
                </Button>
              ) : (
                <>
                  <Button type="button" variant="secondary" onClick={handleReplaceAvatar}>
                    Replace Avatar
                  </Button>
                  <Button type="button" variant="outline" onClick={handleRemoveAvatar}>
                    Remove Avatar
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>

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

        {error && <p className="text-rose-400 text-[11px]">{error}</p>}

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
