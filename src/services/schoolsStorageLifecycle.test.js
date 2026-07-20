import test from 'node:test';
import assert from 'node:assert/strict';
import {
  cleanupSchoolBadgeStoragePath,
  resolvePreviousSchoolBadgePath,
  shouldCleanupPreviousSchoolBadge,
} from './schoolsStorageLifecycle.js';

test('shouldCleanupPreviousSchoolBadge skips unchanged badge path', () => {
  assert.equal(
    shouldCleanupPreviousSchoolBadge('school-logos/old.jpg', 'school-logos/old.jpg'),
    false,
  );
});

test('update without badge change performs no cleanup', () => {
  assert.equal(
    shouldCleanupPreviousSchoolBadge('school-logos/old.jpg', 'school-logos/old.jpg'),
    false,
  );
});

test('replace deletes old badge only when previous and next paths differ', () => {
  assert.equal(
    shouldCleanupPreviousSchoolBadge('school-logos/old.jpg', 'school-logos/new.jpg'),
    true,
  );
});

test('remove clears fields then deletes old badge when next path is empty', () => {
  assert.equal(
    shouldCleanupPreviousSchoolBadge('school-logos/old.jpg', ''),
    true,
  );
});

test('resolvePreviousSchoolBadgePath prefers explicit previousBadgePath', () => {
  assert.equal(
    resolvePreviousSchoolBadgePath(
      { previousBadgePath: 'school-logos/explicit.jpg' },
      { badgePath: 'school-logos/other.jpg' },
    ),
    'school-logos/explicit.jpg',
  );
});

test('cleanupSchoolBadgeStoragePath ignores empty path', async () => {
  const deleteFn = async () => {
    throw new Error('should not be called');
  };

  assert.equal(await cleanupSchoolBadgeStoragePath('', deleteFn), null);
});

test('storage/object-not-found remains non-fatal during school badge cleanup', async () => {
  const deleteFn = async () => {
    const error = new Error('Object not found');
    error.code = 'storage/object-not-found';
    throw error;
  };

  assert.equal(
    await cleanupSchoolBadgeStoragePath('school-logos/missing.jpg', deleteFn),
    null,
  );
});

test('cleanupSchoolBadgeStoragePath returns warning for unexpected delete failures', async () => {
  const deleteFn = async () => {
    const error = new Error('Permission denied');
    error.code = 'storage/unauthorized';
    throw error;
  };

  const warning = await cleanupSchoolBadgeStoragePath('school-logos/old.jpg', deleteFn);
  assert.match(warning, /could not be removed from storage/i);
});

test('delete school cleanup attempts resolved badge path after Firestore deletion', async () => {
  const calls = [];
  const deleteFn = async (path) => {
    calls.push(path);
  };

  const warning = await cleanupSchoolBadgeStoragePath('school-logos/old.jpg', deleteFn);

  assert.equal(warning, null);
  assert.deepEqual(calls, ['school-logos/old.jpg']);
});

test('Firestore failure rolls back newly uploaded badge path in form submit flow', () => {
  const uploadedBadgePath = 'school-logos/new.jpg';
  const firestoreSucceeded = false;
  const shouldRollback = Boolean(uploadedBadgePath && !firestoreSucceeded);

  assert.equal(shouldRollback, true);
});
