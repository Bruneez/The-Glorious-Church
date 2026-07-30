export const MOVIE_GENRE_OPTIONS = [
  { value: 'Christian', label: 'Christian' },
  { value: 'Family', label: 'Family' },
  { value: 'Documentary', label: 'Documentary' },
  { value: 'Drama', label: 'Drama' },
  { value: 'Youth', label: 'Youth' },
  { value: 'Inspirational', label: 'Inspirational' },
];

export const AGE_RECOMMENDATION_OPTIONS = [
  { value: 'All Ages', label: 'All Ages' },
  { value: 'PG', label: 'PG' },
  { value: 'PG-13', label: 'PG-13' },
  { value: 'Teen', label: 'Teen' },
  { value: 'Adult', label: 'Adult' },
];

export const MINISTRY_TAG_OPTIONS = [
  'Faith',
  'Evangelism',
  'Leadership',
  'Forgiveness',
  'Prayer',
  'Youth Camp',
  'Missions',
  'Family',
];

export const ACCEPTED_MOVIE_POSTER_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export const ACCEPTED_MOVIE_POSTER_ACCEPT =
  '.jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp';

export const MAX_MOVIE_POSTER_BYTES = 5 * 1024 * 1024;

export const MOVIE_POSTER_UPLOAD_TIMEOUT_MS = 30_000;

export function isPermanentPosterUrl(url) {
  const value = String(url || '').trim();
  if (!value) return false;
  return !value.startsWith('blob:') && !value.startsWith('data:');
}

export function normalizeMinistryTags(tags = []) {
  if (!Array.isArray(tags)) return [];

  return tags
    .map((tag) => String(tag || '').trim())
    .filter(Boolean);
}

export function normalizeOptionalString(value) {
  const trimmed = String(value ?? '').trim();
  return trimmed || null;
}

export function hasMachanehMoviePosterReference(formData = {}) {
  return (
    isPermanentPosterUrl(formData.posterUrl)
    || Boolean(normalizeOptionalString(formData.posterStoragePath))
  );
}

export function getMachanehMovieValidationErrors(
  formData,
  {
    posterFile = null,
    removePoster = false,
    hasExistingPoster = false,
    isEditing = false,
  } = {},
) {
  const errors = {};

  if (!String(formData?.title || '').trim()) {
    errors.title = 'Movie title is required.';
  }

  if (posterFile) {
    const posterFileError = validateMoviePosterFile(posterFile);
    if (posterFileError) {
      errors.poster = posterFileError;
    }
  } else if (!isEditing) {
    errors.poster = 'Poster image is required.';
  } else if (removePoster || !hasExistingPoster) {
    errors.poster = 'Poster image is required.';
  }

  return errors;
}

export function validateMoviePosterFile(file) {
  if (!file) return '';

  if (file.size > MAX_MOVIE_POSTER_BYTES) {
    return 'Poster must be 5 MB or smaller.';
  }

  const hasAllowedType = ACCEPTED_MOVIE_POSTER_TYPES.includes(file.type);
  const hasAllowedExtension = /\.(jpe?g|png|webp)$/i.test(file.name || '');

  if (!hasAllowedType && !hasAllowedExtension) {
    return 'Please upload a JPG, PNG, or WEBP poster image.';
  }

  return '';
}

export function resolveMoviePosterContentType(file) {
  if (!file) return null;

  const fileType = String(file.type || '').trim().toLowerCase();
  if (ACCEPTED_MOVIE_POSTER_TYPES.includes(fileType)) {
    return fileType;
  }

  const extension = String(file.name || '').match(/\.([a-z0-9]+)$/i)?.[1]?.toLowerCase();
  if (extension === 'jpg' || extension === 'jpeg') return 'image/jpeg';
  if (extension === 'png') return 'image/png';
  if (extension === 'webp') return 'image/webp';

  return null;
}

export function buildMachanehMoviePosterStoragePath(movieId, fileName, timestamp = Date.now()) {
  const safeMovieId = String(movieId || '').trim();
  const safeName = String(fileName || 'poster').replace(/[^\w.-]/g, '_');
  return `machaneh-movies/${safeMovieId}/${timestamp}_${safeName}`;
}

export function mapMachanehMovieToFormData(movie) {
  if (!movie) {
    return {
      title: '',
      description: '',
      genre: '',
      releaseYear: '',
      duration: '',
      language: '',
      ageRecommendation: '',
      ministryTags: [],
      posterUrl: '',
      posterStoragePath: '',
    };
  }

  return {
    title: movie.title || '',
    description: movie.description || '',
    genre: movie.genre || '',
    releaseYear: movie.releaseYear ? String(movie.releaseYear) : '',
    duration: movie.duration || '',
    language: movie.language || '',
    ageRecommendation: movie.ageRecommendation || '',
    ministryTags: normalizeMinistryTags(movie.ministryTags),
    posterUrl: movie.posterUrl || '',
    posterStoragePath: movie.posterStoragePath || '',
  };
}

export function validateMachanehMovieForm(formData, { requirePoster = false } = {}) {
  if (!String(formData.title || '').trim()) {
    return 'Movie title is required.';
  }

  if (requirePoster && !hasMachanehMoviePosterReference(formData)) {
    return 'Poster image is required.';
  }

  return '';
}

export function buildMachanehMoviePayload(formData, { createdBy = '' } = {}) {
  const releaseYearValue = String(formData.releaseYear ?? '').trim();
  const parsedReleaseYear = releaseYearValue ? Number(releaseYearValue) : null;
  const posterUrl = isPermanentPosterUrl(formData.posterUrl)
    ? String(formData.posterUrl).trim()
    : null;

  return {
    title: String(formData.title || '').trim(),
    description: normalizeOptionalString(formData.description),
    genre: normalizeOptionalString(formData.genre),
    duration: normalizeOptionalString(formData.duration),
    releaseYear: Number.isFinite(parsedReleaseYear) ? parsedReleaseYear : null,
    language: normalizeOptionalString(formData.language),
    ageRecommendation: normalizeOptionalString(formData.ageRecommendation),
    ministryTags: normalizeMinistryTags(formData.ministryTags),
    posterUrl,
    posterStoragePath: normalizeOptionalString(formData.posterStoragePath),
    createdBy: normalizeOptionalString(createdBy || formData.createdBy),
  };
}

export const MACHANEH_MOVIE_FIRESTORE_FIELDS = [
  'title',
  'description',
  'genre',
  'duration',
  'releaseYear',
  'language',
  'ageRecommendation',
  'ministryTags',
  'posterUrl',
  'posterStoragePath',
  'createdBy',
  'createdAt',
  'updatedAt',
];

export function buildMachanehMovieFirestoreDocument(payload, timestamps) {
  const document = {
    title: payload.title,
    description: payload.description,
    genre: payload.genre,
    duration: payload.duration,
    releaseYear: payload.releaseYear,
    language: payload.language,
    ageRecommendation: payload.ageRecommendation,
    ministryTags: payload.ministryTags,
    posterUrl: payload.posterUrl,
    posterStoragePath: payload.posterStoragePath,
    createdBy: payload.createdBy,
    createdAt: timestamps.createdAt,
    updatedAt: timestamps.updatedAt,
  };

  return Object.fromEntries(
    Object.entries(document).filter(([, value]) => value !== undefined),
  );
}

export function filterMachanehMovies(movies = [], searchTerm = '') {
  if (!searchTerm.trim()) return movies;

  const term = searchTerm.trim().toLowerCase();

  return movies.filter((movie) => {
    const title = movie.title?.toLowerCase() || '';
    const description = movie.description?.toLowerCase() || '';
    const genre = movie.genre?.toLowerCase() || '';
    const tags = normalizeMinistryTags(movie.ministryTags).join(' ').toLowerCase();

    return (
      title.includes(term)
      || description.includes(term)
      || genre.includes(term)
      || tags.includes(term)
    );
  });
}

export function getEmptyMachanehMoviesMessage(searchTerm = '', canManage = false) {
  if (searchTerm.trim()) {
    return 'No movies match your search.';
  }

  if (canManage) {
    return 'No movies have been added yet.';
  }

  return 'No movies have been added yet.';
}

export function getMachanehMovieSortTime(movie = {}) {
  const updatedAt = movie.updatedAt;
  const createdAt = movie.createdAt;

  if (updatedAt?.toMillis) return updatedAt.toMillis();
  if (updatedAt?.seconds) return updatedAt.seconds * 1000;
  if (typeof updatedAt === 'number') return updatedAt;

  if (createdAt?.toMillis) return createdAt.toMillis();
  if (createdAt?.seconds) return createdAt.seconds * 1000;
  if (typeof createdAt === 'number') return createdAt;

  return 0;
}

export function sortMachanehMoviesByRecency(movies = []) {
  return [...movies].sort(
    (left, right) => getMachanehMovieSortTime(right) - getMachanehMovieSortTime(left),
  );
}

export function mergeMachanehMovies(existingMovies = [], incomingMovies = []) {
  const byId = new Map();

  for (const movie of existingMovies) {
    if (movie?.id) {
      byId.set(movie.id, movie);
    }
  }

  for (const movie of incomingMovies) {
    if (!movie?.id) continue;
    byId.set(movie.id, { ...byId.get(movie.id), ...movie });
  }

  return sortMachanehMoviesByRecency(Array.from(byId.values()));
}
