import { isPermanentPosterUrl } from './machanehMoviesOptions.js';

export function getMoviePosterUrl(movie) {
  const posterUrl = String(movie?.posterUrl || '').trim();
  return isPermanentPosterUrl(posterUrl) ? posterUrl : '';
}

export function getMoviePosterAlt(movie) {
  const title = String(movie?.title || '').trim();
  return title ? `${title} poster` : 'Movie poster';
}

export function getMovieTitle(movie) {
  return String(movie?.title || '').trim() || 'Untitled movie';
}

export function formatMovieReleaseYear(movie) {
  const year = movie?.releaseYear;
  if (year === null || year === undefined || year === '') return '—';
  return String(year);
}

export function formatMovieDetailValue(value) {
  const text = String(value || '').trim();
  return text || '—';
}
