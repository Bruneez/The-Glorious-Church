import { uploadImage, uploadFile, deleteFile } from '@/hooks/useStorage';
import {
  MEMBER_PHOTO_UPLOAD_TIMEOUT_MS,
  getStorageErrorMessage,
  withUploadTimeout,
} from '@/utils/storageErrors';

function rethrowStorageError(error) {
  const message = getStorageErrorMessage(error);
  if (message) {
    const wrappedError = new Error(message);
    wrappedError.code = error?.code;
    throw wrappedError;
  }

  throw error;
}

export async function uploadMemberPhoto(file) {
  const timestamp = Date.now();
  const safeName = String(file.name || 'photo').replace(/[^\w.-]/g, '_');
  const profileImagePath = `member-photos/${timestamp}_${safeName}`;

  try {
    const profileImageUrl = await withUploadTimeout(
      uploadFile(file, profileImagePath),
      MEMBER_PHOTO_UPLOAD_TIMEOUT_MS,
    );

    return { profileImageUrl, profileImagePath };
  } catch (error) {
    rethrowStorageError(error);
  }
}

export async function uploadMemberReportCard(file) {
  const timestamp = Date.now();
  const safeName = String(file.name || 'report-card').replace(/[^\w.-]/g, '_');
  const reportCardPath = `member-report-cards/${timestamp}_${safeName}`;
  const reportCardUrl = await uploadFile(file, reportCardPath);

  return { reportCardUrl, reportCardPath };
}

export async function uploadStaffPhoto(file) {
  return uploadImage(file, 'staff-photos');
}

export async function uploadSchoolBadge(file) {
  const timestamp = Date.now();
  const safeName = String(file.name || 'badge').replace(/[^\w.-]/g, '_');
  const badgePath = `school-logos/${timestamp}_${safeName}`;
  const badgeUrl = await uploadFile(file, badgePath);

  return { badgeUrl, badgePath };
}

export async function uploadSchoolLogo(file) {
  const { badgeUrl } = await uploadSchoolBadge(file);
  return badgeUrl;
}

export async function uploadEventImage(file) {
  return uploadImage(file, 'event-images');
}

export async function uploadCreativeArtsLogo(file) {
  const timestamp = Date.now();
  const safeName = String(file.name || 'logo').replace(/[^\w.-]/g, '_');
  const logoPath = `creative-arts-images/${timestamp}_${safeName}`;
  const logoUrl = await uploadFile(file, logoPath);

  return { logoUrl, logoPath };
}

export async function uploadCreativeArtsImage(file) {
  const { logoUrl } = await uploadCreativeArtsLogo(file);
  return logoUrl;
}

export async function uploadMinistryAvatar(file) {
  const timestamp = Date.now();
  const safeName = String(file.name || 'avatar').replace(/[^\w.-]/g, '_');
  const avatarPath = `ministry-avatars/${timestamp}_${safeName}`;
  const avatarUrl = await uploadFile(file, avatarPath);

  return { avatarUrl, avatarPath };
}

export async function deleteMemberPhoto(path) {
  return deleteFile(path);
}

export async function deleteStaffPhoto(path) {
  return deleteFile(path);
}

export async function deleteSchoolLogo(path) {
  return deleteFile(path);
}

export async function deleteEventImage(path) {
  return deleteFile(path);
}

export async function deleteCreativeArtsImage(path) {
  return deleteFile(path);
}

export async function deleteMinistryAvatar(path) {
  return deleteFile(path);
}
