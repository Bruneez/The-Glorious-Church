import test from 'node:test';
import assert from 'node:assert/strict';
import {
  extractStoragePathFromDownloadUrl,
  resolveMemberPhotoStoragePath,
} from './storagePathUtils.js';

test('extractStoragePathFromDownloadUrl decodes Firebase download URLs', () => {
  const url =
    'https://firebasestorage.googleapis.com/v0/b/the-glorious-church.firebasestorage.app/o/member-photos%2F1712345678_photo.jpg?alt=media&token=abc';

  assert.equal(
    extractStoragePathFromDownloadUrl(url),
    'member-photos/1712345678_photo.jpg',
  );
});

test('resolveMemberPhotoStoragePath prefers profileImagePath over photo URL', () => {
  assert.equal(
    resolveMemberPhotoStoragePath({
      profileImagePath: 'member-photos/123_photo.jpg',
      photo: 'https://example.com/other.jpg',
    }),
    'member-photos/123_photo.jpg',
  );
});

test('resolveMemberPhotoStoragePath falls back to photo URL when path missing', () => {
  const url =
    'https://firebasestorage.googleapis.com/v0/b/the-glorious-church.firebasestorage.app/o/member-photos%2F999_photo.webp?alt=media&token=abc';

  assert.equal(
    resolveMemberPhotoStoragePath({
      profileImagePath: '',
      photo: url,
    }),
    'member-photos/999_photo.webp',
  );
});
