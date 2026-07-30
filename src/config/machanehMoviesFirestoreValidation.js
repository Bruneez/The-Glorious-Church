export function getMachanehMovieFirestoreErrorMessage(error) {
  const code = String(error?.code || '');

  if (code === 'permission-denied') {
    return 'You do not have permission to save movies. Please contact an administrator.';
  }

  if (code === 'unavailable') {
    return 'Unable to reach the database. Please check your connection and try again.';
  }

  if (code === 'failed-precondition') {
    return 'Unable to save the movie due to a database configuration issue. Please contact an administrator.';
  }

  if (code === 'resource-exhausted') {
    return 'The database is temporarily unavailable. Please try again later.';
  }

  if (code === 'deadline-exceeded') {
    return 'Saving the movie timed out. Please check your connection and try again.';
  }

  if (code.startsWith('firestore/')) {
    return 'Failed to save the movie. Please try again.';
  }

  return '';
}

export function toMachanehMovieFirestoreError(error) {
  const message =
    getMachanehMovieFirestoreErrorMessage(error)
    || error?.message
    || 'Failed to save the movie. Please try again.';

  const firestoreError = new Error(message);
  firestoreError.code = error?.code;
  return firestoreError;
}
