import { useState } from 'react';
import { Palette, X, Plus } from 'lucide-react';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import { uploadCreativeArtsImage } from '@/services/storageService';

export default function CreativeArtsForm({ isOpen, onClose, onSubmit, initialData = null }) {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    leader: initialData?.leader || '',
    subtitle: initialData?.subtitle || '',
    description: initialData?.description || '',
    scripture: initialData?.scripture || '',
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
        photoUrl = await uploadCreativeArtsImage(photoFile);
      } catch (error) {
        console.error('Error uploading photo:', error);
        setIsUploading(false);
        return;
      }
      setIsUploading(false);
    }

    onSubmit({
      ...formData,
      photo: photoUrl,
      members: initialData?.members || []
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
    <Modal isOpen={isOpen} onClose={onClose} title={initialData ? 'Edit Creative Arts Node' : 'Add Creative Arts Node'}>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="block text-slate-400 mb-1 text-xs">Group Cover Image Photo</label>
          <div className="flex items-center gap-3 bg-slate-900 p-2 rounded-lg border border-slate-700">
            <div className="w-10 h-10 rounded bg-slate-800 border border-slate-700 overflow-hidden flex items-center justify-center">
              {photoPreview ? (
                <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <Palette className="w-5 h-5 text-slate-500" />
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

        <Input
          label="Group Name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="e.g. Choir"
          required
        />

        <Input
          label="Creative Arts Leader"
          name="leader"
          value={formData.leader}
          onChange={handleChange}
          placeholder="Leader Name"
          required
        />

        <Input
          label="Slogan/Subtitle"
          name="subtitle"
          value={formData.subtitle}
          onChange={handleChange}
          placeholder="Harmony & Worship"
        />

        <div>
          <label className="block text-slate-400 mb-1 text-xs">Ministry Vision Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
            rows={3}
            placeholder="Unite voices and hearts together..."
            className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white focus:outline-none resize-none text-xs"
          />
        </div>

        <Input
          label="Scripture Reference"
          name="scripture"
          value={formData.scripture}
          onChange={handleChange}
          placeholder="Romans 12:1"
        />

        <div className="flex justify-end gap-2 pt-2 border-t border-slate-700">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isUploading}>
            Save Group
          </Button>
        </div>
      </form>
    </Modal>
  );
}
