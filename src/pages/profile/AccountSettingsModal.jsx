import { useEffect, useState } from 'react';
import { UserCog } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { changePassword } from '@/services/authService';
import { updateStaffProfile } from '@/services/staffService';
import { fileToBase64 } from '@/utils/imageUtils';
import Modal from '@/components/ui/Modal';

export default function AccountSettingsModal({ isOpen, onClose }) {
  const { firebaseUser, staffDocId, staffProfile, refreshStaffProfile } = useAuth();
  const [name, setName] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [photoBase64, setPhotoBase64] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isOpen || !staffProfile) return;

    setName(staffProfile.name || '');
    setPhotoBase64(staffProfile.photo || '');
    setNewPassword('');
    setError('');
  }, [isOpen, staffProfile]);

  async function handleFileChange(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    const base64 = await fileToBase64(file);
    setPhotoBase64(base64);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');

    if (!staffDocId || !firebaseUser) {
      setError('Session not verified.');
      return;
    }

    if (newPassword.trim() !== '' && newPassword.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setIsSaving(true);

    try {
      await updateStaffProfile(staffDocId, {
        name: name.trim(),
        photo: photoBase64,
      });

      if (newPassword.trim() !== '') {
        await changePassword(firebaseUser, newPassword);
      }

      await refreshStaffProfile();
      onClose();
    } catch (err) {
      console.error(err);
      setError(err.message || 'Error saving updates.');
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Account Settings" icon={UserCog}>
      <form onSubmit={handleSubmit} className="space-y-3">
        {error ? (
          <p className="text-rose-400 text-[11px]">{error}</p>
        ) : null}

        <div>
          <label className="block text-slate-400 mb-1">Update Profile Picture</label>
          <div className="flex items-center gap-3 bg-slate-900 p-2 rounded-lg border border-slate-700">
            <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 overflow-hidden flex items-center justify-center shrink-0">
              {photoBase64 ? (
                <img src={photoBase64} alt="" className="w-full h-full object-cover rounded-full" />
              ) : (
                <span className="text-slate-500 text-xs">?</span>
              )}
            </div>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="text-[11px] text-slate-400 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-[11px] file:font-semibold file:bg-slate-800 file:text-slate-300 hover:file:bg-slate-700 file:cursor-pointer"
            />
          </div>
        </div>

        <div>
          <label className="block text-slate-400 mb-0.5">Full Name</label>
          <input
            type="text"
            required
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white focus:outline-none"
          />
        </div>

        <div className="pt-2 border-t border-slate-700/60">
          <p className="text-indigo-400 font-semibold mb-2">Change Account Password (Optional)</p>
          <div>
            <label className="block text-slate-400 mb-0.5">New Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
              placeholder="Leave blank to keep current"
              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white focus:outline-none"
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2 border-t border-slate-700">
          <button
            type="button"
            onClick={onClose}
            className="bg-slate-700 text-slate-200 px-3 py-1.5 rounded-lg cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSaving}
            className="bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 rounded-lg font-medium cursor-pointer transition disabled:opacity-60"
          >
            {isSaving ? 'Saving...' : 'Save Updates'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
