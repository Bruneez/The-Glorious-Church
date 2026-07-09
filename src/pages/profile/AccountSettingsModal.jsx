import { useEffect, useState } from 'react';
import { UserCog } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { changePassword } from '@/services/authService';
import { updateStaffProfile } from '@/services/staffService';
import { fileToBase64 } from '@/utils/imageUtils';
import Modal from '@/components/ui/Modal';
import UserAvatar from '@/components/ui/UserAvatar';

export default function AccountSettingsModal({ isOpen, onClose }) {
  const { firebaseUser, staffDocId, staffProfile, refreshStaffProfile } = useAuth();
  const [name, setName] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [photoBase64, setPhotoBase64] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (!isOpen || !staffProfile) return;

    setName(staffProfile.name || '');
    setPhotoBase64(staffProfile.photo || '');
    setNewPassword('');
    setConfirmPassword('');
    setError('');
    setPasswordError('');
    setConfirmPasswordError('');
    setSuccess('');
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
    setPasswordError('');
    setConfirmPasswordError('');
    setSuccess('');

    if (!staffDocId || !firebaseUser) {
      setError('Session not verified.');
      return;
    }

    const trimmedNewPassword = newPassword.trim();
    const trimmedConfirmPassword = confirmPassword.trim();
    const isUpdatingPassword = trimmedNewPassword !== '';

    if (isUpdatingPassword) {
      if (trimmedNewPassword.length < 6) {
        setPasswordError('Password must be at least 6 characters long.');
        return;
      }

      if (!trimmedConfirmPassword) {
        setConfirmPasswordError('Please confirm your password.');
        return;
      }

      if (trimmedNewPassword !== trimmedConfirmPassword) {
        setConfirmPasswordError('Passwords do not match.');
        return;
      }
    }

    setIsSaving(true);

    try {
      await updateStaffProfile(staffDocId, {
        name: name.trim(),
        photo: photoBase64,
      });

      if (isUpdatingPassword) {
        await changePassword(firebaseUser, trimmedNewPassword);
      }

      await refreshStaffProfile();
      setSuccess(
        isUpdatingPassword ? 'Password updated successfully.' : 'Profile updated successfully.'
      );
      window.setTimeout(() => onClose(), 1500);
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

        {success ? (
          <p className="text-emerald-400 text-[11px]">{success}</p>
        ) : null}

        <div>
          <label className="block text-slate-400 mb-1">Update Profile Picture</label>
          <div className="flex items-center gap-3 bg-slate-900 p-2 rounded-lg border border-slate-700">
            <UserAvatar
              name={name || staffProfile?.name || 'User'}
              photo={photoBase64 || staffProfile?.photo}
              size="md"
            />
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
          <div className="space-y-3">
            <div>
              <label className="block text-slate-400 mb-0.5">New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(event) => {
                  setNewPassword(event.target.value);
                  setPasswordError('');
                  setConfirmPasswordError('');
                }}
                placeholder="Leave blank to keep current"
                autoComplete="new-password"
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white focus:outline-none"
              />
              {passwordError ? (
                <p className="mt-1 text-rose-400 text-[11px]">{passwordError}</p>
              ) : null}
            </div>

            <div>
              <label className="block text-slate-400 mb-0.5">Confirm Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(event) => {
                  setConfirmPassword(event.target.value);
                  setConfirmPasswordError('');
                }}
                placeholder="Re-enter new password"
                autoComplete="new-password"
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white focus:outline-none"
              />
              {confirmPasswordError ? (
                <p className="mt-1 text-rose-400 text-[11px]">{confirmPasswordError}</p>
              ) : null}
            </div>
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
