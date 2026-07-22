export function getMachanehMoviePosterStorageErrorMessage(error) {
  const code = String(error?.code || '');

  if (code === 'storage/retry-limit-exceeded' || code === 'storage/timeout') {
    return 'Poster upload timed out. Please check your connection and try again.';
  }

  if (code === 'storage/unauthorized') {
    return 'You do not have permission to upload movie posters. Please contact an administrator.';
  }

  if (code === 'storage/quota-exceeded') {
    return 'Storage quota exceeded. Please contact an administrator.';
  }

  if (code === 'storage/canceled') {
    return 'Poster upload was canceled. Please try again.';
  }

  if (code.startsWith('storage/')) {
    return 'Failed to upload poster image. Please try again.';
  }

  return '';
}
