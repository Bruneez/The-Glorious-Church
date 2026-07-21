import { useEffect, useState } from 'react';
import { Palette } from 'lucide-react';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import ImageUploadField from '@/components/common/ImageUploadField';
import {
  DEPARTMENT_STATUS,
  DEPARTMENT_STATUS_OPTIONS,
  ACCEPTED_DEPARTMENT_LOGO_ACCEPT,
  getDepartmentLogo,
  validateDepartmentLogoFile,
} from '@/config/creativeArtsOptions';
import { getCreativeArtsStorageErrorMessage } from '@/config/creativeArtsLogoValidation';
import { resolveCreativeArtsLogoStoragePath } from '@/utils/storagePathUtils';
import { uploadCreativeArtsLogo, deleteCreativeArtsImage } from '@/services/storageService';

const EMPTY_FORM = {
  name: '',
  leader: '',
  description: '',
  status: DEPARTMENT_STATUS.ACTIVE,
  logoUrl: '',
  logoPath: '',
};

export default function CreativeArtsForm({ isOpen, onClose, onSubmit, initialData = null }) {
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [logoFile, setLogoFile] = useState(null);
  const [removeLogo, setRemoveLogo] = useState(false);
  const [logoError, setLogoError] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEditing = Boolean(initialData?.id);

  useEffect(() => {
    if (!isOpen) return;

    setFormData({
      name: initialData?.name || '',
      leader: initialData?.leader || '',
      description: initialData?.description || '',
      status: initialData?.status || DEPARTMENT_STATUS.ACTIVE,
      logoUrl: initialData?.logoUrl || initialData?.photo || '',
      logoPath: initialData?.logoPath || '',
    });
    setLogoFile(null);
    setRemoveLogo(false);
    setLogoError('');
    setError('');
    setIsSubmitting(false);
  }, [initialData, isOpen]);

  const rollbackUploadedLogo = async (logoPath) => {
    if (!logoPath) return;

    try {
      await deleteCreativeArtsImage(logoPath);
    } catch {
      // Non-blocking rollback failure.
    }
  };

  const handleLogoSelect = (file) => {
    const validationMessage = validateDepartmentLogoFile(file);
    if (validationMessage) {
      setLogoError(validationMessage);
      setLogoFile(null);
      return;
    }

    setLogoError('');
    setLogoFile(file);
    setRemoveLogo(false);
  };

  const handleLogoRemove = () => {
    setLogoFile(null);
    setRemoveLogo(true);
    setLogoError('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setLogoError('');

    if (!formData.name.trim()) {
      setError('Department name is required.');
      return;
    }

    if (logoFile) {
      const validationMessage = validateDepartmentLogoFile(logoFile);
      if (validationMessage) {
        setLogoError(validationMessage);
        return;
      }
    }

    setIsSubmitting(true);

    let uploadedLogoPath = '';

    try {
      const previousLogoPath =
        formData.logoPath
        || initialData?.logoPath
        || resolveCreativeArtsLogoStoragePath(formData)
        || resolveCreativeArtsLogoStoragePath(initialData)
        || '';
      let nextLogoUrl = formData.logoUrl;
      let nextLogoPath = formData.logoPath;

      if (removeLogo) {
        nextLogoUrl = '';
        nextLogoPath = '';
      } else if (logoFile) {
        const uploadedLogo = await uploadCreativeArtsLogo(logoFile);
        nextLogoUrl = uploadedLogo.logoUrl;
        nextLogoPath = uploadedLogo.logoPath;
        uploadedLogoPath = uploadedLogo.logoPath;
      }

      await onSubmit({
        ...formData,
        logoUrl: nextLogoUrl,
        logoPath: nextLogoPath,
        photo: nextLogoUrl,
        removeLogo,
        previousLogoPath:
          removeLogo || logoFile ? previousLogoPath : '',
      });
    } catch (submitError) {
      await rollbackUploadedLogo(uploadedLogoPath);
      setError(
        getCreativeArtsStorageErrorMessage(submitError)
          || submitError?.message
          || 'Failed to save department. Please try again.',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const existingLogoUrl =
    !removeLogo && !logoFile
      ? formData.logoUrl || getDepartmentLogo(initialData)
      : '';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Edit Department' : 'Add Department'}
      icon={Palette}
      maxWidth="max-w-lg"
    >
      <form onSubmit={handleSubmit} className="space-y-3">
        <ImageUploadField
          label="Department Logo"
          existingImageUrl={existingLogoUrl}
          selectedFile={logoFile}
          onFileSelect={handleLogoSelect}
          onRemove={handleLogoRemove}
          accept={ACCEPTED_DEPARTMENT_LOGO_ACCEPT}
          maxSizeMB={5}
          previewShape="circle"
          previewName={formData.name || 'Department'}
          helperText="JPG, PNG, or WEBP up to 5 MB. Images keep their aspect ratio inside a circular avatar."
          error={logoError}
          disabled={isSubmitting}
          loading={isSubmitting}
        />

        <Input
          label="Department Name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="e.g. Choir"
          required
        />

        <Input
          label="Department Leader"
          name="leader"
          value={formData.leader}
          onChange={handleChange}
          placeholder="Leader name"
        />

        <div>
          <label className="block text-slate-400 mb-1 font-medium text-xs">Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={3}
            placeholder="Describe the department's purpose and ministry focus..."
            className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-indigo-500 resize-none text-xs"
          />
        </div>

        <Select
          label="Status"
          name="status"
          value={formData.status}
          onChange={handleChange}
          options={DEPARTMENT_STATUS_OPTIONS}
          placeholder="Select Status"
        />

        {error && <p className="text-rose-400 text-[11px] font-medium">{error}</p>}

        <div className="flex justify-end gap-2 pt-2 border-t border-slate-700">
          <Button type="button" variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isSubmitting}>
            Save Department
          </Button>
        </div>
      </form>
    </Modal>
  );
}
