import { useEffect, useRef, useState } from 'react';
import { Palette } from 'lucide-react';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import DepartmentAvatar from '@/components/features/creative-arts/DepartmentAvatar';
import {
  DEPARTMENT_STATUS,
  DEPARTMENT_STATUS_OPTIONS,
  ACCEPTED_DEPARTMENT_LOGO_ACCEPT,
  getDepartmentLogo,
  validateDepartmentLogoFile,
} from '@/config/creativeArtsOptions';
import { uploadCreativeArtsLogo } from '@/services/storageService';

const EMPTY_FORM = {
  name: '',
  leader: '',
  description: '',
  status: DEPARTMENT_STATUS.ACTIVE,
  logoUrl: '',
  logoPath: '',
};

export default function CreativeArtsForm({ isOpen, onClose, onSubmit, initialData = null }) {
  const fileInputRef = useRef(null);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState('');
  const [removeLogo, setRemoveLogo] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    const existingLogo = getDepartmentLogo(initialData);

    setFormData({
      name: initialData?.name || '',
      leader: initialData?.leader || '',
      description: initialData?.description || '',
      status: initialData?.status || DEPARTMENT_STATUS.ACTIVE,
      logoUrl: initialData?.logoUrl || initialData?.photo || '',
      logoPath: initialData?.logoPath || '',
    });
    setLogoFile(null);
    setLogoPreview(existingLogo);
    setRemoveLogo(false);
    setError('');
    setIsSubmitting(false);
  }, [initialData, isOpen]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    if (!formData.name.trim()) {
      setError('Department name is required.');
      return;
    }

    if (logoFile) {
      const validationMessage = validateDepartmentLogoFile(logoFile);
      if (validationMessage) {
        setError(validationMessage);
        return;
      }
    }

    setIsSubmitting(true);

    try {
      let nextLogoUrl = formData.logoUrl;
      let nextLogoPath = formData.logoPath;

      if (removeLogo) {
        nextLogoUrl = '';
        nextLogoPath = '';
      } else if (logoFile) {
        const uploadedLogo = await uploadCreativeArtsLogo(logoFile);
        nextLogoUrl = uploadedLogo.logoUrl;
        nextLogoPath = uploadedLogo.logoPath;
      }

      await onSubmit({
        ...formData,
        logoUrl: nextLogoUrl,
        logoPath: nextLogoPath,
        photo: nextLogoUrl,
        removeLogo,
      });

      setIsSubmitting(false);
    } catch (submitError) {
      setError(submitError?.message || 'Failed to save department. Please try again.');
      setIsSubmitting(false);
    }
  };

  const handleLogoChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const validationMessage = validateDepartmentLogoFile(file);
    if (validationMessage) {
      setError(validationMessage);
      event.target.value = '';
      return;
    }

    setError('');
    setLogoFile(file);
    setRemoveLogo(false);

    const reader = new FileReader();
    reader.onloadend = () => {
      setLogoPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveLogo = () => {
    setLogoFile(null);
    setLogoPreview('');
    setRemoveLogo(true);
    setFormData((prev) => ({ ...prev, logoUrl: '', logoPath: '' }));

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleReplaceLogo = () => {
    fileInputRef.current?.click();
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const previewDepartment = {
    name: formData.name || 'Department',
    logoUrl: removeLogo ? '' : logoPreview,
    photo: removeLogo ? '' : logoPreview,
  };

  const hasLogo = Boolean(!removeLogo && logoPreview);
  const isEditing = Boolean(initialData);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Edit Department' : 'Add Department'}
      icon={Palette}
      maxWidth="max-w-lg"
    >
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="block text-slate-400 mb-1 text-xs">Department Logo</label>
          <div className="rounded-lg border border-slate-700 bg-slate-900 p-3 space-y-3">
            <div className="flex items-center gap-3">
              <DepartmentAvatar department={previewDepartment} size="lg" />
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-white">
                  {hasLogo ? 'Department logo uploaded' : 'No logo uploaded'}
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  JPG, PNG, or WEBP. Images keep their aspect ratio inside a circular avatar.
                </p>
              </div>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept={ACCEPTED_DEPARTMENT_LOGO_ACCEPT}
              onChange={handleLogoChange}
              className="hidden"
            />

            <div className="flex flex-wrap gap-2">
              {!hasLogo ? (
                <Button type="button" variant="secondary" onClick={handleReplaceLogo}>
                  Upload Department Logo
                </Button>
              ) : (
                <>
                  <Button type="button" variant="secondary" onClick={handleReplaceLogo}>
                    Replace Logo
                  </Button>
                  <Button type="button" variant="outline" onClick={handleRemoveLogo}>
                    Remove Logo
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>

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

        {error && <p className="text-rose-400 text-[11px]">{error}</p>}

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
