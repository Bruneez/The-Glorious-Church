import { useEffect, useState } from 'react';
import { Palette } from 'lucide-react';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import DepartmentAvatar from '@/components/features/creative-arts/DepartmentAvatar';
import { DEPARTMENT_STATUS, DEPARTMENT_STATUS_OPTIONS } from '@/config/creativeArtsOptions';
import { uploadCreativeArtsImage } from '@/services/storageService';

const EMPTY_FORM = {
  name: '',
  leader: '',
  description: '',
  status: DEPARTMENT_STATUS.ACTIVE,
  photo: '',
};

export default function CreativeArtsForm({ isOpen, onClose, onSubmit, initialData = null }) {
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    setFormData({
      name: initialData?.name || '',
      leader: initialData?.leader || '',
      description: initialData?.description || '',
      status: initialData?.status || DEPARTMENT_STATUS.ACTIVE,
      photo: initialData?.photo || '',
    });
    setPhotoFile(null);
    setPhotoPreview(initialData?.photo || '');
    setError('');
    setIsSubmitting(false);
  }, [initialData, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.name.trim()) {
      setError('Department name is required.');
      return;
    }

    setIsSubmitting(true);

    try {
      let photoUrl = formData.photo;

      if (photoFile) {
        photoUrl = await uploadCreativeArtsImage(photoFile);
      }

      await onSubmit({
        ...formData,
        photo: photoUrl,
      });
    } catch (submitError) {
      setError(submitError?.message || 'Failed to save department. Please try again.');
      setIsSubmitting(false);
    }
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setPhotoFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setPhotoPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const previewDepartment = {
    name: formData.name || 'Department',
    photo: photoPreview,
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Edit Department' : 'Add Department'}
      icon={Palette}
      maxWidth="max-w-lg"
    >
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="block text-slate-400 mb-0.5 text-xs">Department Image</label>
          <div className="flex items-center gap-3 bg-slate-900 p-2 rounded-lg border border-slate-700">
            <DepartmentAvatar department={previewDepartment} size="md" />
            <input
              type="file"
              accept="image/*"
              onChange={handlePhotoChange}
              className="text-[11px] text-slate-400 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-[11px] file:font-semibold file:bg-slate-800 file:text-slate-300 hover:file:bg-slate-700 file:cursor-pointer"
            />
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
