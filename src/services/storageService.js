import { uploadImage, uploadFile, deleteFile, deleteFileSafe } from '@/hooks/useStorage';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { storage } from '@/config/firebase';
import {
  MEMBER_PHOTO_UPLOAD_TIMEOUT_MS,
  getStorageErrorMessage,
  withUploadTimeout,
} from '@/utils/storageErrors';
import { TRAVEL_IMAGE_UPLOAD_TIMEOUT_MS } from '@/config/travellingOptions';
import {
  MOVIE_POSTER_UPLOAD_TIMEOUT_MS,
  buildMachanehMoviePosterStoragePath,
  resolveMoviePosterContentType,
  validateMoviePosterFile,
} from '@/config/machanehMoviesOptions';
import { toMachanehMoviePosterUploadError } from '@/config/machanehMoviesPosterValidation';
import { MERCHANDISE_IMAGE_UPLOAD_TIMEOUT_MS } from '@/config/merchandiseOptions';
import {
  SHEPHERDING_COVER_UPLOAD_TIMEOUT_MS,
} from '@/config/shepherdingToolsResourceOptions';
import {
  generateStoragePath,
  resolveCoverContentType,
  validateImage,
} from '@/services/shepherdingToolsStorage';
import { APP_FIX_ATTACHMENT_UPLOAD_TIMEOUT_MS } from '@/config/appFixesAttachmentOptions';
import {
  generateStoragePath as generateAppFixStoragePath,
  resolveAttachmentContentType,
  validateAttachment,
} from '@/services/appFixesStorage';
import {
  PROJECT_ATTACHMENT_UPLOAD_TIMEOUT_MS,
  PROJECT_COVER_UPLOAD_TIMEOUT_MS,
} from '@/config/projectsConstants';
import {
  generateProjectAttachmentStoragePath,
  generateProjectCoverStoragePath,
  resolveAttachmentContentType as resolveProjectAttachmentContentType,
  resolveCoverContentType as resolveProjectCoverContentType,
  validateAttachment as validateProjectAttachment,
  validateCoverImage,
} from '@/services/projectStorage';

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

  try {
    const avatarUrl = await withUploadTimeout(
      uploadFile(file, avatarPath),
      MEMBER_PHOTO_UPLOAD_TIMEOUT_MS,
    );

    return { avatarUrl, avatarPath };
  } catch (error) {
    rethrowStorageError(error);
  }
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
  return deleteFileSafe(path);
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
  return deleteFileSafe(path);
}

export async function uploadMachanehMoviePoster(file, movieId) {
  const posterValidationMessage = validateMoviePosterFile(file);
  if (posterValidationMessage) {
    throw new Error(posterValidationMessage);
  }

  const contentType = resolveMoviePosterContentType(file);
  if (!contentType) {
    throw new Error('Please upload a JPG, PNG, or WEBP poster image.');
  }

  const posterStoragePath = buildMachanehMoviePosterStoragePath(movieId, file.name);

  try {
    const posterUrl = await withUploadTimeout(
      uploadFile(file, posterStoragePath, {
        contentType,
        cacheControl: 'public,max-age=31536000',
      }),
      MOVIE_POSTER_UPLOAD_TIMEOUT_MS,
    );

    if (!posterUrl) {
      throw toMachanehMoviePosterUploadError(new Error('Failed to upload poster image. Please try again.'));
    }

    return { posterUrl, posterStoragePath };
  } catch (error) {
    throw toMachanehMoviePosterUploadError(error);
  }
}

export async function deleteMachanehMoviePoster(path) {
  return deleteFileSafe(path);
}

export async function uploadMerchandiseImage(file, itemId) {
  const timestamp = Date.now();
  const safeName = String(file.name || 'image').replace(/[^\w.-]+/g, '_');
  const storagePath = `merchandise/${itemId}/${timestamp}_${safeName}`;

  try {
    const url = await withUploadTimeout(
      uploadFile(file, storagePath),
      MERCHANDISE_IMAGE_UPLOAD_TIMEOUT_MS,
    );

    return { url, storagePath };
  } catch (error) {
    rethrowStorageError(error);
  }
}

export async function deleteMerchandiseImage(path) {
  return deleteFileSafe(path);
}

export async function uploadShepherdingCoverImage(file, resourceId) {
  const validationMessage = validateImage(file);
  if (validationMessage) {
    throw new Error(validationMessage);
  }

  const contentType = resolveCoverContentType(file);
  if (!contentType) {
    throw new Error('Please upload a JPG, PNG, or WEBP cover image.');
  }

  const coverImageStoragePath = generateStoragePath(resourceId, file.name);

  try {
    const coverImageUrl = await withUploadTimeout(
      uploadFile(file, coverImageStoragePath, {
        contentType,
        cacheControl: 'public,max-age=31536000',
      }),
      SHEPHERDING_COVER_UPLOAD_TIMEOUT_MS,
    );

    if (!coverImageUrl) {
      throw new Error('Failed to upload cover image. Please try again.');
    }

    return { coverImageUrl, coverImageStoragePath };
  } catch (error) {
    rethrowStorageError(error);
  }
}

export async function deleteShepherdingCoverImage(path) {
  return deleteFileSafe(path);
}

export async function uploadAppFixAttachment(file, requestId, { onProgress } = {}) {
  const validationMessage = validateAttachment(file);
  if (validationMessage) {
    throw new Error(validationMessage);
  }

  const contentType = resolveAttachmentContentType(file);
  if (!contentType) {
    throw new Error('Please upload a JPG, PNG, WEBP, PDF, MP4, WEBM, or MOV file.');
  }

  const fileStoragePath = generateAppFixStoragePath(requestId, file.name);

  try {
    const storageRef = ref(storage, fileStoragePath);
    const uploadTask = uploadBytesResumable(storageRef, file, {
      contentType,
      cacheControl: 'public,max-age=31536000',
    });

    const fileUrl = await new Promise((resolve, reject) => {
      uploadTask.on(
        'state_changed',
        (snapshot) => {
          if (typeof onProgress === 'function' && snapshot.totalBytes > 0) {
            onProgress(Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100));
          }
        },
        reject,
        async () => {
          try {
            const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
            resolve(downloadUrl);
          } catch (error) {
            reject(error);
          }
        },
      );
    });

    if (!fileUrl) {
      throw new Error('Failed to upload attachment. Please try again.');
    }

    if (typeof onProgress === 'function') {
      onProgress(100);
    }

    return {
      fileUrl,
      fileStoragePath,
      contentType,
      fileName: String(file.name || '').trim(),
      fileSizeBytes: Number.isFinite(Number(file.size)) ? Number(file.size) : null,
    };
  } catch (error) {
    rethrowStorageError(error);
  }
}

export async function deleteAppFixAttachment(path) {
  return deleteFileSafe(path);
}

export async function uploadProjectCover(file, projectId, { storagePath, contentType } = {}) {
  const validationMessage = validateCoverImage(file);
  if (validationMessage) {
    throw new Error(validationMessage);
  }

  const resolvedContentType = contentType || resolveProjectCoverContentType(file);
  if (!resolvedContentType) {
    throw new Error('Please upload a JPG, PNG, or WEBP cover image.');
  }

  const coverStoragePath = storagePath || generateProjectCoverStoragePath(projectId, file.name);

  try {
    const coverUrl = await withUploadTimeout(
      uploadFile(file, coverStoragePath, {
        contentType: resolvedContentType,
        cacheControl: 'public,max-age=31536000',
      }),
      PROJECT_COVER_UPLOAD_TIMEOUT_MS,
    );

    if (!coverUrl) {
      throw new Error('Failed to upload cover image. Please try again.');
    }

    return { coverUrl, coverStoragePath };
  } catch (error) {
    rethrowStorageError(error);
  }
}

export async function deleteProjectCover(path) {
  return deleteFileSafe(path);
}

export async function uploadProjectAttachment(file, projectId, { storagePath, contentType, onProgress } = {}) {
  const validationMessage = validateProjectAttachment(file);
  if (validationMessage) {
    throw new Error(validationMessage);
  }

  const resolvedContentType = contentType || resolveProjectAttachmentContentType(file);
  if (!resolvedContentType) {
    throw new Error('Please upload a JPG, PNG, WEBP, or PDF file.');
  }

  const fileStoragePath = storagePath || generateProjectAttachmentStoragePath(projectId, file.name);
  let uploadedPath = '';

  try {
    const storageRef = ref(storage, fileStoragePath);
    const uploadTask = uploadBytesResumable(storageRef, file, {
      contentType: resolvedContentType,
      cacheControl: 'public,max-age=31536000',
    });

    const fileUrl = await new Promise((resolve, reject) => {
      uploadTask.on(
        'state_changed',
        (snapshot) => {
          if (typeof onProgress === 'function' && snapshot.totalBytes > 0) {
            onProgress(Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100));
          }
        },
        reject,
        async () => {
          uploadedPath = fileStoragePath;
          try {
            const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
            resolve(downloadUrl);
          } catch (error) {
            reject(error);
          }
        },
      );
    });

    if (!fileUrl) {
      throw new Error('Failed to upload attachment. Please try again.');
    }

    if (typeof onProgress === 'function') {
      onProgress(100);
    }

    return {
      fileUrl,
      fileStoragePath,
      contentType: resolvedContentType,
      fileName: String(file.name || '').trim(),
      fileSizeBytes: Number.isFinite(Number(file.size)) ? Number(file.size) : null,
    };
  } catch (error) {
    if (uploadedPath) {
      await deleteFileSafe(uploadedPath);
    }
    rethrowStorageError(error);
  }
}

export async function deleteProjectAttachment(path) {
  return deleteFileSafe(path);
}
