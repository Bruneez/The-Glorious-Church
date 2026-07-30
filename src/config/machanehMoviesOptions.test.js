import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildMachanehMovieFirestoreDocument,
  buildMachanehMoviePayload,
  buildMachanehMoviePosterStoragePath,
  filterMachanehMovies,
  getMachanehMovieValidationErrors,
  getMachanehMovieSortTime,
  MACHANEH_MOVIE_FIRESTORE_FIELDS,
  mergeMachanehMovies,
  normalizeMinistryTags,
  normalizeOptionalString,
  resolveMoviePosterContentType,
  sortMachanehMoviesByRecency,
  validateMachanehMovieForm,
  validateMoviePosterFile,
  MAX_MOVIE_POSTER_BYTES,
} from './machanehMoviesOptions.js';

const validPosterFile = { type: 'image/jpeg', size: 1024, name: 'poster.jpg' };

test('validateMoviePosterFile accepts jpeg, png, and webp', () => {
  assert.equal(
    validateMoviePosterFile({ type: 'image/jpeg', size: 1024, name: 'poster.jpg' }),
    '',
  );
  assert.equal(
    validateMoviePosterFile({ type: 'image/png', size: 1024, name: 'poster.png' }),
    '',
  );
  assert.equal(
    validateMoviePosterFile({ type: '', size: 1024, name: 'poster.jpg' }),
    '',
  );
});

test('resolveMoviePosterContentType matches validated poster files', () => {
  assert.equal(
    resolveMoviePosterContentType({ type: 'image/jpeg', name: 'poster.jpg' }),
    'image/jpeg',
  );
  assert.equal(
    resolveMoviePosterContentType({ type: '', name: 'poster.png' }),
    'image/png',
  );
  assert.equal(
    resolveMoviePosterContentType({ type: '', name: 'poster.webp' }),
    'image/webp',
  );
});

test('buildMachanehMoviePosterStoragePath uses machaneh-movies prefix and movie id folder', () => {
  assert.equal(
    buildMachanehMoviePosterStoragePath('movie-123', 'My Poster.jpg', 1000),
    'machaneh-movies/movie-123/1000_My_Poster.jpg',
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

test('getMachanehMovieValidationErrors only requires title and poster on create', () => {
  assert.deepEqual(
    getMachanehMovieValidationErrors(
      { title: 'Overcomer' },
      { posterFile: validPosterFile, isEditing: false },
    ),
    {},
  );

  assert.equal(
    getMachanehMovieValidationErrors(
      { title: 'Overcomer', genre: '', releaseYear: '' },
      { posterFile: validPosterFile, isEditing: false },
    ).genre,
    undefined,
  );

  assert.match(
    getMachanehMovieValidationErrors(
      { title: '' },
      { posterFile: validPosterFile, isEditing: false },
    ).title,
    /title is required/i,
  );

  assert.match(
    getMachanehMovieValidationErrors(
      { title: 'Overcomer' },
      { isEditing: false },
    ).poster,
    /Poster image is required/i,
  );
});

test('getMachanehMovieValidationErrors allows edit without new poster when one exists', () => {
  assert.deepEqual(
    getMachanehMovieValidationErrors(
      {
        title: 'Overcomer',
        posterUrl: 'https://example.com/poster.jpg',
        posterStoragePath: 'machaneh-movies/m1/poster.jpg',
      },
      { isEditing: true, hasExistingPoster: true },
    ),
    {},
  );
});

test('normalizeOptionalString converts blank values to null', () => {
  assert.equal(normalizeOptionalString(''), null);
  assert.equal(normalizeOptionalString('   '), null);
  assert.equal(normalizeOptionalString('Drama'), 'Drama');
});

test('buildMachanehMoviePayload normalizes ministry tags, release year, and optional fields', () => {
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
  assert.equal(payload.description, 'Inspiring sports drama.');
});

test('buildMachanehMovieFirestoreDocument maps payload fields and excludes form-only keys', () => {
  const payload = buildMachanehMoviePayload({
    title: 'Overcomer',
    description: '',
    genre: 'Drama',
    releaseYear: '2019',
    ministryTags: ['Faith'],
    posterUrl: 'https://example.com/poster.jpg',
    posterStoragePath: 'machaneh-movies/m1/poster.jpg',
    previousPosterPath: 'machaneh-movies/old/poster.jpg',
  }, { createdBy: 'Admin User' });

  const createdAt = { _methodName: 'serverTimestamp' };
  const updatedAt = { _methodName: 'serverTimestamp' };
  const document = buildMachanehMovieFirestoreDocument(payload, { createdAt, updatedAt });

  assert.equal(document.title, 'Overcomer');
  assert.equal(document.releaseYear, 2019);
  assert.equal(document.description, null);
  assert.deepEqual(document.ministryTags, ['Faith']);
  assert.equal(document.createdAt, createdAt);
  assert.equal(document.updatedAt, updatedAt);
  assert.equal(document.previousPosterPath, undefined);
  assert.deepEqual(Object.keys(document).sort(), [
    'ageRecommendation',
    'createdAt',
    'createdBy',
    'description',
    'duration',
    'genre',
    'language',
    'ministryTags',
    'posterStoragePath',
    'posterUrl',
    'releaseYear',
    'title',
    'updatedAt',
  ]);
});

test('MACHANEH_MOVIE_FIRESTORE_FIELDS documents the persisted movie schema', () => {
  assert.deepEqual(MACHANEH_MOVIE_FIRESTORE_FIELDS, [
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
  ]);
});

test('buildMachanehMoviePayload converts empty optional strings to null', () => {
  const payload = buildMachanehMoviePayload({
    title: 'Overcomer',
    description: '',
    genre: '   ',
    releaseYear: '',
    duration: '',
    language: '',
    ageRecommendation: '',
    ministryTags: [],
    posterUrl: '',
    posterStoragePath: '',
    createdBy: '',
  });

  assert.equal(payload.description, null);
  assert.equal(payload.genre, null);
  assert.equal(payload.duration, null);
  assert.equal(payload.language, null);
  assert.equal(payload.ageRecommendation, null);
  assert.equal(payload.releaseYear, null);
  assert.equal(payload.posterUrl, null);
  assert.equal(payload.posterStoragePath, null);
  assert.equal(payload.createdBy, null);
  assert.deepEqual(payload.ministryTags, []);
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

test('mergeMachanehMovies deduplicates by id and prefers incoming data', () => {
  const merged = mergeMachanehMovies(
    [{ id: 'm1', title: 'Old Title', updatedAt: { seconds: 10 } }],
    [{ id: 'm1', title: 'New Title', updatedAt: { seconds: 20 } }],
  );

  assert.equal(merged.length, 1);
  assert.equal(merged[0].title, 'New Title');
});

test('sortMachanehMoviesByRecency orders movies by updatedAt descending', () => {
  const sorted = sortMachanehMoviesByRecency([
    { id: 'older', updatedAt: { seconds: 10 } },
    { id: 'newer', updatedAt: { seconds: 30 } },
    { id: 'middle', updatedAt: { seconds: 20 } },
  ]);

  assert.deepEqual(sorted.map((movie) => movie.id), ['newer', 'middle', 'older']);
});

test('getMachanehMovieSortTime reads Firestore timestamp seconds', () => {
  assert.equal(getMachanehMovieSortTime({ updatedAt: { seconds: 42 } }), 42000);
});
