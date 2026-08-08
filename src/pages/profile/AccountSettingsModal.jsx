import { useEffect, useState } from 'react';
import { UserCog } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { changePassword } from '@/services/authService';
import { updateStaffProfile } from '@/services/staffService';
import { uploadStaffPhoto, deleteStaffPhoto } from '@/services/storageService';
import {
  ACCEPTED_MEMBER_PHOTO_ACCEPT,
  validateMemberPhotoFile,
} from '@/config/memberPhotoValidation';
import { extractStoragePathFromDownloadUrl } from '@/utils/storagePathUtils';
import { getStorageErrorMessage } from '@/utils/storageErrors';
import Modal from '@/components/ui/Modal';
import ImageUploadField from '@/components/common/ImageUploadField';

export default function AccountSettingsModal({ isOpen, onClose }) {
  const { firebaseUser, staffDocId, staffProfile, refreshStaffProfile } = useAuth();
  const [name, setName] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [photoFile, setPhotoFile] = useState(null);
  const [removePhoto, setRemovePhoto] = useState(false);
  const [photoError, setPhotoError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (!isOpen || !staffProfile) return;

    setName(staffProfile.name || '');
    setPhotoFile(null);
    setRemovePhoto(false);
    setPhotoError('');
    setNewPassword('');
    setConfirmPassword('');
    setError('');
    setPasswordError('');
    setConfirmPasswordError('');
    setSuccess('');
  }, [isOpen, staffProfile]);

  function handlePhotoSelect(file) {
    const validationMessage = validateMemberPhotoFile(file);
    if (validationMessage) {
      setPhotoError(validationMessage);
      setPhotoFile(null);
      return;
    }

    setPhotoError('');
    setPhotoFile(file);
    setRemovePhoto(false);
  }

  function handlePhotoRemove() {
    setPhotoFile(null);
    setRemovePhoto(true);
    setPhotoError('');
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

    let uploadedPhotoPath = '';

    try {
      const updates = { name: name.trim() };

      if (removePhoto) {
        updates.photo = '';
      } else if (photoFile) {
        const validationMessage = validateMemberPhotoFile(photoFile);
        if (validationMessage) {
          setPhotoError(validationMessage);
          return;
        }

        const uploadedPhoto = await uploadStaffPhoto(photoFile);
        updates.photo = uploadedPhoto.photoUrl;
        uploadedPhotoPath = uploadedPhoto.photoPath;
      }

      await updateStaffProfile(staffDocId, updates);

      if (uploadedPhotoPath) {
        const previousPhotoPath = extractStoragePathFromDownloadUrl(staffProfile?.photo || '');
        if (previousPhotoPath) {
          try {
            await deleteStaffPhoto(previousPhotoPath);
          } catch (cleanupError) {
            console.warn('Failed to delete previous staff profile photo:', cleanupError);
          }
        }
      } else if (removePhoto) {
        const previousPhotoPath = extractStoragePathFromDownloadUrl(staffProfile?.photo || '');
        if (previousPhotoPath) {
          try {
            await deleteStaffPhoto(previousPhotoPath);
          } catch (cleanupError) {
            console.warn('Failed to delete removed staff profile photo:', cleanupError);
          }
        }
      }

      if (isUpdatingPassword) {
        await changePassword(firebaseUser, trimmedNewPassword);
      }

      await refreshStaffProfile();
      setSuccess(
        isUpdatingPassword ? 'Password updated successfully.' : 'Profile updated successfully.',
      );
      window.setTimeout(() => onClose(), 1500);
    } catch (err) {
      if (uploadedPhotoPath) {
        try {
          await deleteStaffPhoto(uploadedPhotoPath);
        } catch (rollbackError) {
          console.warn('Failed to roll back uploaded staff profile photo:', rollbackError);
        }
      }

      console.error(err);
      setError(
        getStorageErrorMessage(err) || err.message || 'Error saving updates.',
      );
    } finally {
      setIsSaving(false);
    }
  }

  const existingPhotoUrl = !removePhoto && !photoFile ? staffProfile?.photo || '' : '';

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Account Settings" icon={UserCog}>
      <form onSubmit={handleSubmit} className="space-y-3">
        {error ? (
          <p className="text-rose-400 text-[11px]">{error}</p>
        ) : null}

        {success ? (
          <p className="text-emerald-400 text-[11px]">{success}</p>
        ) : null}

        <ImageUploadField
          label="Update Profile Picture"
          existingImageUrl={existingPhotoUrl}
          selectedFile={photoFile}
          onFileSelect={handlePhotoSelect}
          onRemove={handlePhotoRemove}
          accept={ACCEPTED_MEMBER_PHOTO_ACCEPT}
          maxSizeMB={5}
          disabled={isSaving}
          loading={isSaving}
          previewShape="circle"
          previewName={name || staffProfile?.name || 'User'}
          helperText="JPG, PNG, or WEBP up to 5 MB."
          error={photoError}
        />

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
