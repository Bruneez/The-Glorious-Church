import { useState } from 'react';
import { School, X } from 'lucide-react';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import { uploadSchoolLogo } from '@/services/storageService';

export default function SchoolForm({ isOpen, onClose, onSubmit, initialData = null, schoolType = 'primary' }) {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    address: initialData?.address || '',
    contact: initialData?.contact || '',
    principal: initialData?.principal || '',
    logo: initialData?.logo || ''
  });
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(initialData?.logo || '');
  const [isUploading, setIsUploading] = useState(false);

  const typeLabels = {
    primary: 'Primary School',
    high: 'High School',
    'higher-education': 'University/College'
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    let logoUrl = formData.logo;
    
    if (logoFile) {
      setIsUploading(true);
      try {
        logoUrl = await uploadSchoolLogo(logoFile);
      } catch (error) {
        console.error('Error uploading logo:', error);
        setIsUploading(false);
        return;
      }
      setIsUploading(false);
    }

    onSubmit({
      ...formData,
      type: schoolType,
      logo: logoUrl
    });
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Add ${typeLabels[schoolType]} Node`}>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="block text-slate-400 mb-1 text-xs">School Cover Image Photo</label>
          <div className="flex items-center gap-3 bg-slate-900 p-2 rounded-lg border border-slate-700">
            <div className="w-10 h-10 rounded bg-slate-800 border border-slate-700 overflow-hidden flex items-center justify-center">
              {logoPreview ? (
                <img src={logoPreview} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <School className="w-5 h-5 text-slate-500" />
              )}
            </div>
            <input
              type="file"
              accept="image/*"
              onChange={handleLogoChange}
              className="text-[11px] text-slate-400 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-[11px] file:font-semibold file:bg-slate-800 file:text-slate-300 hover:file:bg-slate-700 file:cursor-pointer"
            />
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

        <Input
          label="Physical Address"
          name="address"
          value={formData.address}
          onChange={handleChange}
          placeholder="123 Main Street, Suburb"
          required
        />

        <Input
          label="Contact Number"
          name="contact"
          type="tel"
          value={formData.contact}
          onChange={handleChange}
          placeholder="012 345 6789"
        />

        <Input
          label="Principal Name"
          name="principal"
          value={formData.principal}
          onChange={handleChange}
          placeholder="Mr./Ms. Principal Name"
        />

        <div className="flex justify-end gap-2 pt-2 border-t border-slate-700">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isUploading}>
            Save School
          </Button>
        </div>
      </form>
    </Modal>
  );
}
