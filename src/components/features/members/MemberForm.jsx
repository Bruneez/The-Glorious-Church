import { useState } from 'react';
import { UserPlus, X } from 'lucide-react';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import { uploadMemberPhoto } from '@/services/storageService';

const CREATIVE_ARTS_OPTIONS = [
  { value: 'Dance Stars', label: 'Dance Stars' },
  { value: 'Choir', label: 'The Choir / Worshipers' },
  { value: 'Film Stars', label: 'Film Stars' },
  { value: '', label: 'None' }
];

const OCCUPATION_OPTIONS = [
  { value: 'Primary School', label: 'Primary School Student' },
  { value: 'High School', label: 'High School Student' },
  { value: 'University', label: 'University Student' },
  { value: 'College', label: 'College Student' },
  { value: 'Work', label: 'Employed / Workplace' }
];

export default function MemberForm({ isOpen, onClose, onSubmit, initialData = null }) {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    phone: initialData?.phone || '',
    address: initialData?.address || '',
    dob: initialData?.dob || '',
    creativeArts: initialData?.creativeArts || '',
    occupation: initialData?.occupation || '',
    school: initialData?.school || '',
    institution: initialData?.institution || '',
    photo: initialData?.photo || ''
  });
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(initialData?.photo || '');
  const [isUploading, setIsUploading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    let photoUrl = formData.photo;
    
    if (photoFile) {
      setIsUploading(true);
      try {
        photoUrl = await uploadMemberPhoto(photoFile);
      } catch (error) {
        console.error('Error uploading photo:', error);
        setIsUploading(false);
        return;
      }
      setIsUploading(false);
    }

    onSubmit({
      ...formData,
      photo: photoUrl
    });
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Register Youth Account">
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="block text-slate-400 mb-0.5 text-xs">Profile Picture</label>
          <div className="flex items-center gap-3 bg-slate-900 p-2 rounded-lg border border-slate-700">
            <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 overflow-hidden flex items-center justify-center">
              {photoPreview ? (
                <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <UserPlus className="w-5 h-5 text-slate-500" />
              )}
            </div>
            <input
              type="file"
              accept="image/*"
              onChange={handlePhotoChange}
              className="text-[11px] text-slate-400 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-[11px] file:font-semibold file:bg-slate-800 file:text-slate-300 hover:file:bg-slate-700 file:cursor-pointer"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Input
            label="Full Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
          <Input
            label="Mobile Phone"
            name="phone"
            type="tel"
            value={formData.phone}
            onChange={handleChange}
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Input
            label="Physical Address"
            name="address"
            value={formData.address}
            onChange={handleChange}
            required
          />
          <Input
            label="Date of Birth"
            name="dob"
            type="date"
            value={formData.dob}
            onChange={handleChange}
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Select
            label="Creative Arts Team"
            name="creativeArts"
            value={formData.creativeArts}
            onChange={handleChange}
            options={CREATIVE_ARTS_OPTIONS}
          />
          <Select
            label="Occupation Status"
            name="occupation"
            value={formData.occupation}
            onChange={handleChange}
            options={OCCUPATION_OPTIONS}
          />
        </div>

        {(formData.occupation === 'Primary School' || formData.occupation === 'High School') && (
          <Input
            label="School Name"
            name="school"
            value={formData.school}
            onChange={handleChange}
          />
        )}

        {(formData.occupation === 'University' || formData.occupation === 'College') && (
          <Input
            label="Institution Name"
            name="institution"
            value={formData.institution}
            onChange={handleChange}
          />
        )}

        <div className="flex justify-end gap-2 pt-2 border-t border-slate-700">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isUploading}>
            Save System Record
          </Button>
        </div>
      </form>
    </Modal>
  );
}
