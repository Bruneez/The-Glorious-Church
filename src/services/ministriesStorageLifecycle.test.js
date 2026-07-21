import test from 'node:test';
import assert from 'node:assert/strict';
import {
  cleanupMinistryAvatarStoragePath,
  resolvePreviousMinistryAvatarPath,
  shouldCleanupPreviousMinistryAvatar,
} from './ministriesStorageLifecycle.js';
import { buildMinistryPayload } from '../config/ministriesOptions.js';

test('edit without image replacement preserves existing avatar fields', () => {
  const payload = buildMinistryPayload(
    {
      ministryName: 'Ushering',
      ministryLeader: 'Leader',
      description: 'Desc',
      status: 'Active',
      avatarUrl: 'https://firebasestorage.googleapis.com/avatar.jpg',
      avatarPath: 'ministry-avatars/123_avatar.jpg',
      removeAvatar: false,
    },
    {
      avatarUrl: 'https://firebasestorage.googleapis.com/avatar.jpg',
      avatarPath: 'ministry-avatars/123_avatar.jpg',
    },
  );

  assert.equal(payload.avatarUrl, 'https://firebasestorage.googleapis.com/avatar.jpg');
  assert.equal(payload.avatarPath, 'ministry-avatars/123_avatar.jpg');
});

test('replace deletes old avatar only when previous and next paths differ', () => {
  assert.equal(
    shouldCleanupPreviousMinistryAvatar(
      'ministry-avatars/old.jpg',
      'ministry-avatars/new.jpg',
    ),
    true,
  );
});

test('update without avatar change performs no cleanup', () => {
  assert.equal(
    shouldCleanupPreviousMinistryAvatar(
      'ministry-avatars/old.jpg',
      'ministry-avatars/old.jpg',
    ),
    false,
  );
});

test('resolvePreviousMinistryAvatarPath prefers explicit previousAvatarPath', () => {
  assert.equal(
    resolvePreviousMinistryAvatarPath(
      { previousAvatarPath: 'ministry-avatars/explicit.jpg' },
      { avatarPath: 'ministry-avatars/other.jpg' },
    ),
    'ministry-avatars/explicit.jpg',
  );
});

test('storage/object-not-found remains non-fatal during ministry avatar cleanup', async () => {
  const deleteFn = async () => {
    const error = new Error('Object not found');
    error.code = 'storage/object-not-found';
    throw error;
  };

  assert.equal(
    await cleanupMinistryAvatarStoragePath('ministry-avatars/missing.jpg', deleteFn),
    null,
  );
});

test('cleanupMinistryAvatarStoragePath returns warning for unexpected delete failures', async () => {
  const deleteFn = async () => {
    const error = new Error('Permission denied');
    error.code = 'storage/unauthorized';
    throw error;
  };

  const warning = await cleanupMinistryAvatarStoragePath(
    'ministry-avatars/old.jpg',
    deleteFn,
  );
  assert.match(warning, /could not be removed from storage/i);
});

test('buildMinistryPayload never persists blob preview URLs', () => {
  const payload = buildMinistryPayload({
    ministryName: 'Ushering',
    avatarUrl: 'blob:http://localhost/preview',
    avatarPath: '',
    removeAvatar: false,
  });

  assert.equal(payload.avatarUrl, '');
});
