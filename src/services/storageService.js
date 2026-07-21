import { uploadImage, uploadFile, deleteFile, deleteFileSafe } from '@/hooks/useStorage';
import {
  MEMBER_PHOTO_UPLOAD_TIMEOUT_MS,
  getStorageErrorMessage,
  withUploadTimeout,
} from '@/utils/storageErrors';
import { TRAVEL_IMAGE_UPLOAD_TIMEOUT_MS } from '@/config/travellingOptions';

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

  try {
    const logoUrl = await withUploadTimeout(
      uploadFile(file, logoPath),
      MEMBER_PHOTO_UPLOAD_TIMEOUT_MS,
    );

    return { logoUrl, logoPath };
  } catch (error) {
    rethrowStorageError(error);
  }
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
  return deleteFileSafe(path);
}

export async function deleteMemberReportCard(path) {
  return deleteFileSafe(path);
}

export async function deleteStaffPhoto(path) {
  return deleteFile(path);
}

export async function deleteSchoolLogo(path) {
  return deleteFileSafe(path);
}

export async function deleteEventImage(path) {
  return deleteFile(path);
}

export async function deleteCreativeArtsImage(path) {
  return deleteFileSafe(path);
}

export async function deleteMinistryAvatar(path) {
  return deleteFile(path);
}

export async function uploadTravelDestinationImage(file, destinationId) {
  const timestamp = Date.now();
  const safeName = String(file.name || 'image').replace(/[^\w.-]/g, '_');
  const imageStoragePath = `travel-destinations/${destinationId}/${timestamp}_${safeName}`;

  try {
    const imageUrl = await withUploadTimeout(
      uploadFile(file, imageStoragePath),
      TRAVEL_IMAGE_UPLOAD_TIMEOUT_MS,
    );

    return { imageUrl, imageStoragePath };
  } catch (error) {
    rethrowStorageError(error);
  }
}

export async function deleteTravelDestinationImage(path) {
  return deleteFile(path);
}
