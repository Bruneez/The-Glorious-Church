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

  if (requirePoster) {
    const hasPoster = isPermanentPosterUrl(formData.posterUrl)
      || String(formData.posterStoragePath || '').trim();
    if (!hasPoster) {
      return 'Poster image is required.';
    }
  }

  return '';
}

export function buildMachanehMoviePayload(formData, { createdBy = '' } = {}) {
  const releaseYearValue = String(formData.releaseYear || '').trim();
  const parsedReleaseYear = releaseYearValue ? Number(releaseYearValue) : null;

  return {
    title: String(formData.title || '').trim(),
    description: String(formData.description || '').trim(),
    genre: String(formData.genre || '').trim(),
    duration: String(formData.duration || '').trim(),
    releaseYear: Number.isFinite(parsedReleaseYear) ? parsedReleaseYear : null,
    language: String(formData.language || '').trim(),
    ageRecommendation: String(formData.ageRecommendation || '').trim(),
    ministryTags: normalizeMinistryTags(formData.ministryTags),
    posterUrl: isPermanentPosterUrl(formData.posterUrl) ? String(formData.posterUrl).trim() : '',
    posterStoragePath: String(formData.posterStoragePath || '').trim(),
    createdBy: String(createdBy || formData.createdBy || '').trim(),
  };
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
