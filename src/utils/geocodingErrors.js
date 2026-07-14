export function createGeocodingError(code, message) {
  const error = new Error(message);
  error.code = code;
  return error;
}

export function getGeocodingErrorMessage(error) {
  if (!error) return null;

  switch (error.code) {
    case 'NOT_CONFIGURED':
      return 'Address lookup is not configured. Please contact an administrator.';
    case 'NETWORK':
      return 'The address service is unavailable. Check your internet connection and try again.';
    case 'AUTH':
      return 'Address lookup is unavailable due to a configuration issue. Please contact an administrator.';
    case 'RATE_LIMIT':
      return 'Too many address lookups were requested. Please wait a moment and try again.';
    case 'SERVICE':
      return 'Address lookup failed. Please try again in a moment.';
    case 'INVALID':
      return error.message || 'Please enter a valid address.';
    default:
      return error.message || 'Address lookup failed. Please try again.';
  }
}

export function mapGeoapifyHttpStatusToError(status) {
  if (status === 401 || status === 403) {
    return createGeocodingError(
      'AUTH',
      'Address lookup is unavailable due to a configuration issue. Please contact an administrator.',
    );
  }

  if (status === 429) {
    return createGeocodingError(
      'RATE_LIMIT',
      'Too many address lookups were requested. Please wait a moment and try again.',
    );
  }

  if (status >= 500) {
    return createGeocodingError(
      'SERVICE',
      'The address service is temporarily unavailable. Please try again in a moment.',
    );
  }

  return createGeocodingError(
    'SERVICE',
    'Address lookup failed. Please try again in a moment.',
  );
}
