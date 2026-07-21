import test from 'node:test';
import assert from 'node:assert/strict';
import {
  cleanupCreativeArtsLogoStoragePath,
  resolvePreviousCreativeArtsLogoPath,
  shouldCleanupPreviousCreativeArtsLogo,
} from './creativeArtsStorageLifecycle.js';
import { buildDepartmentPayload } from '../config/creativeArtsOptions.js';

test('edit without image replacement preserves existing logo fields', () => {
  const payload = buildDepartmentPayload(
    {
      name: 'Choir',
      leader: 'Leader',
      description: 'Desc',
      status: 'Active',
      logoUrl: 'https://firebasestorage.googleapis.com/logo.jpg',
      logoPath: 'creative-arts-images/123_logo.jpg',
      removeLogo: false,
    },
    {
      logoUrl: 'https://firebasestorage.googleapis.com/logo.jpg',
      logoPath: 'creative-arts-images/123_logo.jpg',
    },
  );

  assert.equal(payload.logoUrl, 'https://firebasestorage.googleapis.com/logo.jpg');
  assert.equal(payload.logoPath, 'creative-arts-images/123_logo.jpg');
});

test('replace deletes old logo only when previous and next paths differ', () => {
  assert.equal(
    shouldCleanupPreviousCreativeArtsLogo(
      'creative-arts-images/old.jpg',
      'creative-arts-images/new.jpg',
    ),
    true,
  );
});

test('update without logo change performs no cleanup', () => {
  assert.equal(
    shouldCleanupPreviousCreativeArtsLogo(
      'creative-arts-images/old.jpg',
      'creative-arts-images/old.jpg',
    ),
    false,
  );
});

test('resolvePreviousCreativeArtsLogoPath prefers explicit previousLogoPath', () => {
  assert.equal(
    resolvePreviousCreativeArtsLogoPath(
      { previousLogoPath: 'creative-arts-images/explicit.jpg' },
      { logoPath: 'creative-arts-images/other.jpg' },
    ),
    'creative-arts-images/explicit.jpg',
  );
});

test('storage/object-not-found remains non-fatal during creative arts logo cleanup', async () => {
  const deleteFn = async () => {
    const error = new Error('Object not found');
    error.code = 'storage/object-not-found';
    throw error;
  };

  assert.equal(
    await cleanupCreativeArtsLogoStoragePath('creative-arts-images/missing.jpg', deleteFn),
    null,
  );
});

test('cleanupCreativeArtsLogoStoragePath returns warning for unexpected delete failures', async () => {
  const deleteFn = async () => {
    const error = new Error('Permission denied');
    error.code = 'storage/unauthorized';
    throw error;
  };

  const warning = await cleanupCreativeArtsLogoStoragePath(
    'creative-arts-images/old.jpg',
    deleteFn,
  );
  assert.match(warning, /could not be removed from storage/i);
});

test('buildDepartmentPayload never persists blob preview URLs', () => {
  const payload = buildDepartmentPayload({
    name: 'Choir',
    logoUrl: 'blob:http://localhost/preview',
    logoPath: '',
    removeLogo: false,
  });

  assert.equal(payload.logoUrl, '');
  assert.equal(payload.photo, '');
});
