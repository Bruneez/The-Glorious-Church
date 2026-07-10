export const MEMBER_PHOTO_UPLOAD_TIMEOUT_MS = 60_000;

export function withUploadTimeout(promise, timeoutMs = MEMBER_PHOTO_UPLOAD_TIMEOUT_MS) {
  return new Promise((resolve, reject) => {
    const timeoutId = window.setTimeout(() => {
      const timeoutError = new Error(
        'Profile picture upload timed out. Please check your connection or Firebase Storage configuration and try again.',
      );
      timeoutError.code = 'storage/timeout';
      reject(timeoutError);
    }, timeoutMs);

    Promise.resolve(promise)
      .then((value) => {
        window.clearTimeout(timeoutId);
        resolve(value);
      })
      .catch((error) => {
        window.clearTimeout(timeoutId);
        reject(error);
      });
  });
}

export function getStorageErrorMessage(error) {
  const code = String(error?.code || '');

  if (!code.startsWith('storage/')) {
    return null;
  }

  if (code === 'storage/retry-limit-exceeded' || code === 'storage/timeout') {
    return 'Profile picture upload timed out. Please check your connection or Firebase Storage configuration and try again.';
  }

  if (code === 'storage/unauthorized') {
    return 'You do not have permission to upload profile pictures. Please contact an administrator.';
  }

  if (code === 'storage/quota-exceeded') {
    return 'Storage quota exceeded. Please contact an administrator.';
  }

  if (code === 'storage/canceled') {
    return 'Profile picture upload was canceled. Please try again.';
  }

  return error?.message || 'Failed to upload profile picture. Please try again.';
}
