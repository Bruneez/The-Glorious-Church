import { uploadImage, uploadFile, deleteFile, deleteFileSafe } from '@/hooks/useStorage';
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
