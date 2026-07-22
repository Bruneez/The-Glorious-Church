import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildMachanehMoviePayload,
  filterMachanehMovies,
  normalizeMinistryTags,
  validateMachanehMovieForm,
  validateMoviePosterFile,
  MAX_MOVIE_POSTER_BYTES,
} from './machanehMoviesOptions.js';

test('validateMoviePosterFile accepts jpeg, png, and webp', () => {
  assert.equal(
    validateMoviePosterFile({ type: 'image/jpeg', size: 1024, name: 'poster.jpg' }),
    '',
  );
  assert.equal(
    validateMoviePosterFile({ type: 'image/png', size: 1024, name: 'poster.png' }),
    '',
  );
});

test('validateMoviePosterFile rejects unsupported file types and oversized files', () => {
  assert.match(
    validateMoviePosterFile({ type: 'image/gif', size: 1024, name: 'poster.gif' }),
    /JPG, PNG, or WEBP/i,
  );
  assert.match(
    validateMoviePosterFile({
      type: 'image/jpeg',
      size: MAX_MOVIE_POSTER_BYTES + 1,
      name: 'poster.jpg',
    }),
    /5 MB/i,
  );
});

test('validateMachanehMovieForm requires title and poster when requested', () => {
  assert.match(validateMachanehMovieForm({ title: '' }), /title is required/i);
  assert.match(
    validateMachanehMovieForm({ title: 'Faithful' }, { requirePoster: true }),
    /Poster image is required/i,
  );
});

test('buildMachanehMoviePayload normalizes ministry tags and release year', () => {
  const payload = buildMachanehMoviePayload({
    title: '  Overcomer  ',
    description: 'Inspiring sports drama.',
    genre: 'Drama',
    releaseYear: '2019',
    duration: '1 hr 59 min',
    language: 'English',
    ageRecommendation: 'PG',
    ministryTags: ['Faith', 'Family', ''],
    posterUrl: 'https://example.com/poster.jpg',
    posterStoragePath: 'machaneh-movies/m1/poster.jpg',
  });

  assert.equal(payload.title, 'Overcomer');
  assert.equal(payload.releaseYear, 2019);
  assert.deepEqual(payload.ministryTags, ['Faith', 'Family']);
});

test('filterMachanehMovies searches title, description, genre, and ministry tags', () => {
  const movies = [
    {
      title: 'Overcomer',
      description: 'Sports ministry story',
      genre: 'Drama',
      ministryTags: ['Faith'],
    },
    {
      title: 'Facing the Giants',
      description: 'Football and prayer',
      genre: 'Inspirational',
      ministryTags: ['Youth Camp'],
    },
  ];

  assert.equal(filterMachanehMovies(movies, 'football').length, 1);
  assert.equal(filterMachanehMovies(movies, 'youth camp').length, 1);
  assert.equal(filterMachanehMovies(movies, 'drama').length, 1);
});

test('normalizeMinistryTags trims and removes empty values', () => {
  assert.deepEqual(normalizeMinistryTags([' Faith ', '', 'Prayer']), ['Faith', 'Prayer']);
});
